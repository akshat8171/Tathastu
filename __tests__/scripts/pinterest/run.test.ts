/**
 * @jest-environment node
 *
 * Tests for run.ts orchestration via injected deps (no network/SDK/filesystem).
 * Focus: the autonomy-critical behaviors —
 *   - record ONLY after a confirmed publish
 *   - skip a failing ("poison") product and try the next candidate
 *   - cheap image precheck runs BEFORE the paid Gemini SEO call
 *   - dry-run mints no token, publishes nothing, records nothing
 *   - all-candidates-fail throws loudly (red X)
 */

import { main, DEFAULT_DEPS, MAX_CANDIDATE_ATTEMPTS, type RunDeps } from '@/scripts/pinterest/run'
import type { Product, PostedLog, SeoContent, CreatedPin } from '@/scripts/pinterest/types'

const CONFIG = {
  geminiApiKey: 'sk',
  pinterestAppId: 'A',
  pinterestAppSecret: 'S',
  authMode: 'client_credentials' as const,
  pinterestScopes: 'pins:write',
  pinterestRefreshToken: undefined,
  siteOrigin: 'https://site.test',
}

function product(id: string, name = id): Product {
  return { id, name, description: '', images: [`/img/${id}.jpg`], category: '', price: 0 }
}

const SEO: SeoContent = { title: 'T', description: 'D', board_suggestion: 'Board' }

/** A deps object where every step succeeds; individual tests override pieces. */
function makeDeps(over: Partial<RunDeps> = {}, catalog: Product[] = [product('p1'), product('p2')]): {
  deps: RunDeps
  calls: string[]
  records: unknown[]
} {
  const calls: string[] = []
  const records: unknown[] = []
  const deps: RunDeps = {
    loadConfig: () => CONFIG as ReturnType<typeof DEFAULT_DEPS.loadConfig>,
    loadProducts: () => catalog,
    readLog: async () => ({ version: 1, posts: [] } as PostedLog),
    rankProducts: (products) => products, // identity: catalog order = rank order
    buildPublicImageUrl: (rel, origin) => `${origin}${rel}`,
    assertImageReachable: async (url) => {
      calls.push(`image:${url}`)
    },
    generateSeo: async (p) => {
      calls.push(`seo:${p.id}`)
      return SEO
    },
    mintAccessToken: async () => {
      calls.push('mint')
      return 'tok'
    },
    resolveBoard: async ({ name }) => {
      calls.push(`board:${name}`)
      return 'b-1'
    },
    publishPin: async ({ boardId }) => {
      calls.push(`publish:${boardId}`)
      return { id: 'pin-1' } as CreatedPin
    },
    recordResult: async (rec) => {
      calls.push(`record:${rec.productId}`)
      records.push(rec)
      return { version: 1, posts: [rec] }
    },
    ...over,
  }
  return { deps, calls, records }
}

describe('main — happy path', () => {
  it('publishes the top candidate and records exactly once, after publish', async () => {
    const { deps, calls, records } = makeDeps()
    await main([], deps)

    expect(records).toHaveLength(1)
    expect((records[0] as { productId: string }).productId).toBe('p1')
    // record happens AFTER publish.
    expect(calls.indexOf('record:p1')).toBeGreaterThan(calls.indexOf('publish:b-1'))
    // never fell through to the second candidate.
    expect(calls).not.toContain('seo:p2')
  })

  it('mints the access token exactly once even when it iterates past a failing candidate', async () => {
    // Force ≥2 loop iterations (p1 fails its precheck → p2 publishes) so this test
    // genuinely distinguishes "mint ONCE before the loop" from "mint per-candidate":
    // if the mint moved inside the loop, it would fire twice here and fail.
    const { deps, calls, records } = makeDeps({
      assertImageReachable: async (url) => {
        calls.push(`image:${url}`)
        if (url.includes('/img/p1.jpg')) throw new Error('404 not found')
      },
    })
    await main([], deps)
    expect(calls.filter((c) => c === 'mint')).toHaveLength(1) // not 2
    expect((records[0] as { productId: string }).productId).toBe('p2') // did loop past p1
  })

  it('prechecks image reachability BEFORE the paid Gemini SEO call', async () => {
    const { deps, calls } = makeDeps()
    await main([], deps)
    expect(calls.indexOf('image:https://site.test/img/p1.jpg')).toBeLessThan(calls.indexOf('seo:p1'))
  })
})

describe('main — resilience (skip poison products)', () => {
  it('skips a product whose image is unreachable and publishes the next', async () => {
    const { deps, calls, records } = makeDeps({
      assertImageReachable: async (url) => {
        calls.push(`image:${url}`)
        if (url.includes('/img/p1.jpg')) throw new Error('404 not found')
      },
    })
    await main([], deps)

    expect((records[0] as { productId: string }).productId).toBe('p2')
    expect(calls).toContain('image:https://site.test/img/p1.jpg') // tried p1
    expect(calls).not.toContain('seo:p1') // but never paid for its SEO
    expect(calls).toContain('publish:b-1') // published p2
  })

  it('skips a product whose publish fails and records the next successful one', async () => {
    let firstPublish = true
    const { deps, records } = makeDeps({
      publishPin: async ({ boardId }) => {
        if (firstPublish) {
          firstPublish = false
          throw new Error('pin rejected')
        }
        return { id: 'pin-2' } as CreatedPin
      },
    })
    await main([], deps)
    expect(records).toHaveLength(1)
    expect((records[0] as { productId: string }).productId).toBe('p2')
  })

  it('does NOT record when a candidate fails before publish', async () => {
    const { deps, records } = makeDeps(
      { assertImageReachable: async () => { throw new Error('dead') } },
      [product('only')],
    )
    await expect(main([], deps)).rejects.toThrow(/No Pin published/)
    expect(records).toHaveLength(0) // state untouched on total failure
  })

  it('throws (never double-publishes) when publish succeeds but recording fails', async () => {
    // The point-of-no-return guard: once a Pin is live, a failure in the record
    // step must fail loudly, NOT skip to the next candidate (which would post twice).
    const publishes: string[] = []
    const { deps } = makeDeps({
      publishPin: async ({ boardId }) => {
        publishes.push(boardId)
        return { id: 'pin-live' } as CreatedPin
      },
      recordResult: async () => {
        throw new Error('disk full')
      },
    })
    await expect(main([], deps)).rejects.toThrow(/must be reconciled to avoid a duplicate/)
    // Crucially: only ONE publish happened — it did not fall through to p2.
    expect(publishes).toHaveLength(1)
  })
})

describe('main — bounded attempts', () => {
  it('tries at most MAX_CANDIDATE_ATTEMPTS then throws loudly', async () => {
    const many = Array.from({ length: MAX_CANDIDATE_ATTEMPTS + 3 }, (_, i) => product(`p${i}`))
    let seoCalls = 0
    const { deps } = makeDeps(
      {
        assertImageReachable: async () => { throw new Error('all dead') },
        generateSeo: async (p) => { seoCalls++; return SEO },
      },
      many,
    )
    await expect(main([], deps)).rejects.toThrow(
      new RegExp(`all ${MAX_CANDIDATE_ATTEMPTS} candidate`),
    )
    // Image precheck fails first, so SEO is never reached at all.
    expect(seoCalls).toBe(0)
  })
})

describe('main — dry run', () => {
  it('mints no token, publishes nothing, records nothing', async () => {
    const { deps, calls, records } = makeDeps()
    await main(['--dry-run'], deps)
    expect(calls).not.toContain('mint')
    expect(calls.some((c) => c.startsWith('publish:'))).toBe(false)
    expect(records).toHaveLength(0)
    // but it DID do the free work: image precheck + SEO for the top candidate.
    expect(calls).toContain('seo:p1')
  })
})

describe('main — empty catalog', () => {
  it('throws when no publishable products exist', async () => {
    const { deps } = makeDeps({ rankProducts: () => [] }, [])
    await expect(main([], deps)).rejects.toThrow(/No publishable products/)
  })
})
