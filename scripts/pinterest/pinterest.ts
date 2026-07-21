/**
 * pinterest.ts — Pinterest API v5 operations: board get-or-create, image
 * reachability precheck, and pin publishing.
 *
 * All calls verified against the v5 docs:
 *   GET  /v5/boards           → { items: [{ id, name, ... }], bookmark }
 *   POST /v5/boards           → { id, name, ... }
 *   POST /v5/pins             → { id, ... }  with media_source.source_type=image_url
 */

import { PINTEREST_API_BASE } from './auth'
import type { Board, CreatedPin, SeoContent } from './types'

type FetchImpl = typeof fetch

/** Shared JSON POST/GET helper with consistent error reporting. */
async function pinterestFetch(
  path: string,
  token: string,
  init: RequestInit,
  fetchImpl: FetchImpl,
): Promise<Response> {
  return fetchImpl(`${PINTEREST_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

async function readErr(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500)
  } catch {
    return '<unreadable>'
  }
}

/**
 * Verifies the image URL is publicly fetchable before we hand it to Pinterest.
 * Pinterest fetches the URL server-side; a 404 there produces an opaque failure,
 * so we check first and throw a precise error the caller can choose to skip on.
 *
 * Tries HEAD first (cheap); some CDNs disallow HEAD, so falls back to a ranged
 * GET. Considers any 2xx a success.
 */
export async function assertImageReachable(
  imageUrl: string,
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  let status = 0
  try {
    const head = await fetchImpl(imageUrl, { method: 'HEAD' })
    status = head.status
    if (head.ok) return
  } catch {
    // fall through to GET
  }
  try {
    const get = await fetchImpl(imageUrl, { method: 'GET', headers: { Range: 'bytes=0-0' } })
    status = get.status
    if (get.ok || status === 206) return
  } catch (err) {
    throw new Error(`Image URL is not reachable: ${imageUrl} (${(err as Error).message})`)
  }
  throw new Error(`Image URL returned non-OK status ${status}: ${imageUrl}`)
}

/**
 * Finds a board by name (case-insensitive), creating it if absent.
 * Paginates the board list via the `bookmark` cursor so it works past 25 boards.
 *
 * @returns the board id
 */
export async function resolveBoard(params: {
  token: string
  name: string
  fetchImpl?: FetchImpl
}): Promise<string> {
  const { token, name, fetchImpl = fetch } = params
  const target = name.trim().toLowerCase()

  let bookmark: string | undefined
  do {
    const query = new URLSearchParams({ page_size: '250' })
    if (bookmark) query.set('bookmark', bookmark)

    const res = await pinterestFetch(`/boards?${query.toString()}`, token, { method: 'GET' }, fetchImpl)
    if (!res.ok) {
      throw new Error(`Failed to list Pinterest boards (${res.status}): ${await readErr(res)}`)
    }
    const data = (await res.json()) as { items?: Board[]; bookmark?: string }
    for (const b of data.items ?? []) {
      if (typeof b.name === 'string' && b.name.trim().toLowerCase() === target) {
        return b.id
      }
    }
    bookmark = data.bookmark && data.bookmark.length > 0 ? data.bookmark : undefined
  } while (bookmark)

  // Not found — create it.
  const createRes = await pinterestFetch(
    '/boards',
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        description: 'Auto-curated by Tathastu Keepsakes.',
        privacy: 'PUBLIC',
      }),
    },
    fetchImpl,
  )
  if (!createRes.ok) {
    throw new Error(`Failed to create board "${name}" (${createRes.status}): ${await readErr(createRes)}`)
  }
  const created = (await createRes.json()) as Board
  if (!created.id) throw new Error(`Board creation returned no id for "${name}".`)
  return created.id
}

/**
 * Publishes an image Pin.
 *
 * @returns the created Pin (with its id)
 */
export async function publishPin(params: {
  token: string
  boardId: string
  seo: SeoContent
  link: string
  imageUrl: string
  altText?: string
  fetchImpl?: FetchImpl
}): Promise<CreatedPin> {
  const { token, boardId, seo, link, imageUrl, altText, fetchImpl = fetch } = params

  const payload = {
    board_id: boardId,
    title: seo.title,
    description: seo.description,
    link,
    alt_text: (altText ?? seo.title).slice(0, 500),
    media_source: {
      source_type: 'image_url' as const,
      url: imageUrl,
    },
  }

  const res = await pinterestFetch('/pins', token, { method: 'POST', body: JSON.stringify(payload) }, fetchImpl)
  if (!res.ok) {
    throw new Error(`Failed to create pin (${res.status}): ${await readErr(res)}`)
  }
  const pin = (await res.json()) as CreatedPin
  if (!pin.id) throw new Error('Pin creation returned no id.')
  return pin
}
