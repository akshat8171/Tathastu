/**
 * @jest-environment node
 *
 * Tests for pinterest.ts — the most API-coupled module (board get-or-create with
 * bookmark pagination, image reachability precheck, pin publish payload shape).
 * A fake fetch is injected so no network is touched; we assert request URLs,
 * methods, Bearer auth, and body shapes against the Pinterest API v5 contract.
 */

import {
  assertImageReachable,
  resolveBoard,
  publishPin,
} from '@/scripts/pinterest/pinterest'
import { PINTEREST_API_BASE } from '@/scripts/pinterest/auth'
import type { SeoContent } from '@/scripts/pinterest/types'

type Captured = { url: string; init: RequestInit }

/** A canned Response good enough for the code under test. */
function res(opts: { ok?: boolean; status?: number; body?: unknown }): Response {
  const { ok = true, status = ok ? 200 : 400, body = {} } = opts
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'ERR',
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response
}

const SEO: SeoContent = {
  title: 'Handcrafted 3D Keepsake',
  description: 'A unique personalized gift.',
  board_suggestion: 'Personalized Gifts',
}

describe('assertImageReachable', () => {
  it('resolves when HEAD returns 2xx (no GET fallback needed)', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      return res({ ok: true, status: 200 })
    }) as unknown as typeof fetch

    await expect(assertImageReachable('https://x.test/a.jpg', fetchImpl)).resolves.toBeUndefined()
    expect(calls).toHaveLength(1)
    expect(calls[0]!.init.method).toBe('HEAD')
  })

  it('falls back to a ranged GET when HEAD is not ok, accepting 206', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      if (init.method === 'HEAD') return res({ ok: false, status: 405 })
      return res({ ok: false, status: 206 }) // partial content
    }) as unknown as typeof fetch

    await expect(assertImageReachable('https://x.test/a.jpg', fetchImpl)).resolves.toBeUndefined()
    expect(calls).toHaveLength(2)
    expect(calls[1]!.init.method).toBe('GET')
    expect((calls[1]!.init.headers as Record<string, string>).Range).toBe('bytes=0-0')
  })

  it('falls back to GET when HEAD throws', async () => {
    const fetchImpl = (async (_url: string, init: RequestInit = {}) => {
      if (init.method === 'HEAD') throw new Error('HEAD not supported')
      return res({ ok: true, status: 200 })
    }) as unknown as typeof fetch
    await expect(assertImageReachable('https://x.test/a.jpg', fetchImpl)).resolves.toBeUndefined()
  })

  it('throws on a non-OK status from both HEAD and GET', async () => {
    const fetchImpl = (async () => res({ ok: false, status: 404 })) as unknown as typeof fetch
    await expect(assertImageReachable('https://x.test/missing.jpg', fetchImpl)).rejects.toThrow(
      /non-OK status 404/,
    )
  })

  it('throws when the GET fallback rejects', async () => {
    const fetchImpl = (async (_url: string, init: RequestInit = {}) => {
      if (init.method === 'HEAD') return res({ ok: false, status: 500 })
      throw new Error('connection reset')
    }) as unknown as typeof fetch
    await expect(assertImageReachable('https://x.test/a.jpg', fetchImpl)).rejects.toThrow(
      /not reachable.*connection reset/,
    )
  })
})

describe('resolveBoard', () => {
  it('returns an existing board id matched case-insensitively, without creating', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      return res({ ok: true, body: { items: [{ id: 'b-99', name: 'PERSONALIZED gifts' }] } })
    }) as unknown as typeof fetch

    const id = await resolveBoard({ token: 'T', name: 'Personalized Gifts', fetchImpl })
    expect(id).toBe('b-99')
    // Only the GET list call — no POST create.
    expect(calls).toHaveLength(1)
    expect(calls[0]!.init.method).toBe('GET')
    expect(calls[0]!.url.startsWith(`${PINTEREST_API_BASE}/boards?`)).toBe(true)
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer T')
  })

  it('follows the bookmark cursor across pages before giving up', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      if (init.method === 'GET' && !url.includes('bookmark=')) {
        return res({ ok: true, body: { items: [{ id: 'x', name: 'Other' }], bookmark: 'PAGE2' } })
      }
      if (init.method === 'GET') {
        return res({ ok: true, body: { items: [{ id: 'b-2', name: 'Target' }] } })
      }
      throw new Error('unexpected non-GET')
    }) as unknown as typeof fetch

    const id = await resolveBoard({ token: 'T', name: 'Target', fetchImpl })
    expect(id).toBe('b-2')
    expect(calls).toHaveLength(2)
    expect(calls[1]!.url).toContain('bookmark=PAGE2')
  })

  it('creates the board (PUBLIC) when not found on any page', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      if (init.method === 'GET') return res({ ok: true, body: { items: [] } })
      return res({ ok: true, body: { id: 'new-board' } }) // POST create
    }) as unknown as typeof fetch

    const id = await resolveBoard({ token: 'T', name: 'Brand New', fetchImpl })
    expect(id).toBe('new-board')
    const post = calls.find((c) => c.init.method === 'POST')!
    expect(post.url).toBe(`${PINTEREST_API_BASE}/boards`)
    const body = JSON.parse(String(post.init.body))
    expect(body.name).toBe('Brand New')
    expect(body.privacy).toBe('PUBLIC')
  })

  it('throws a clear error when listing boards fails', async () => {
    const fetchImpl = (async () => res({ ok: false, status: 401, body: 'unauthorized' })) as unknown as typeof fetch
    await expect(resolveBoard({ token: 'T', name: 'X', fetchImpl })).rejects.toThrow(
      /Failed to list Pinterest boards \(401\)/,
    )
  })

  it('throws when board creation fails', async () => {
    const fetchImpl = (async (_url: string, init: RequestInit = {}) => {
      if (init.method === 'GET') return res({ ok: true, body: { items: [] } })
      return res({ ok: false, status: 500, body: 'boom' })
    }) as unknown as typeof fetch
    await expect(resolveBoard({ token: 'T', name: 'X', fetchImpl })).rejects.toThrow(
      /Failed to create board "X" \(500\)/,
    )
  })
})

describe('publishPin', () => {
  it('POSTs a v5 image_url pin with the correct payload + Bearer auth', async () => {
    const calls: Captured[] = []
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      return res({ ok: true, body: { id: 'pin-1' } })
    }) as unknown as typeof fetch

    const pin = await publishPin({
      token: 'T',
      boardId: 'b-1',
      seo: SEO,
      link: 'https://site.test/products/p1',
      imageUrl: 'https://site.test/img/p1.jpg',
      altText: 'A keepsake',
      fetchImpl,
    })

    expect(pin.id).toBe('pin-1')
    expect(calls[0]!.url).toBe(`${PINTEREST_API_BASE}/pins`)
    expect(calls[0]!.init.method).toBe('POST')
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer T')

    const body = JSON.parse(String(calls[0]!.init.body))
    expect(body.board_id).toBe('b-1')
    expect(body.title).toBe(SEO.title)
    expect(body.description).toBe(SEO.description)
    expect(body.link).toBe('https://site.test/products/p1')
    expect(body.alt_text).toBe('A keepsake')
    expect(body.media_source).toEqual({ source_type: 'image_url', url: 'https://site.test/img/p1.jpg' })
  })

  it('defaults alt_text to the title and clamps it to 500 chars', async () => {
    const calls: Captured[] = []
    const longTitle = 'x'.repeat(600)
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      return res({ ok: true, body: { id: 'pin-2' } })
    }) as unknown as typeof fetch

    await publishPin({
      token: 'T',
      boardId: 'b-1',
      seo: { ...SEO, title: longTitle },
      link: 'https://site.test/p',
      imageUrl: 'https://site.test/i.jpg',
      fetchImpl,
    })
    const body = JSON.parse(String(calls[0]!.init.body))
    expect(body.alt_text.length).toBe(500)
  })

  it('throws when the pin response has no id', async () => {
    const fetchImpl = (async () => res({ ok: true, body: {} })) as unknown as typeof fetch
    await expect(
      publishPin({ token: 'T', boardId: 'b', seo: SEO, link: 'l', imageUrl: 'i', fetchImpl }),
    ).rejects.toThrow(/no id/)
  })

  it('throws a clear error when the API rejects the pin', async () => {
    const fetchImpl = (async () => res({ ok: false, status: 400, body: 'bad payload' })) as unknown as typeof fetch
    await expect(
      publishPin({ token: 'T', boardId: 'b', seo: SEO, link: 'l', imageUrl: 'i', fetchImpl }),
    ).rejects.toThrow(/Failed to create pin \(400\)/)
  })
})
