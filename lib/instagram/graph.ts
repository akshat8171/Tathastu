import 'server-only'

import {
  INSTAGRAM_FETCH_TIMEOUT_MS,
  INSTAGRAM_GRAPH_BASE,
  INSTAGRAM_LONG_TOKEN_URL,
  INSTAGRAM_REFRESH_TOKEN_URL,
  INSTAGRAM_SHORT_TOKEN_URL,
} from '@/lib/instagram/constants'

export class InstagramGraphError extends Error {
  readonly status: number
  constructor(message: string, status = 502) {
    super(message)
    this.name = 'InstagramGraphError'
    this.status = status
  }
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), INSTAGRAM_FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const message = extractGraphError(body) || `Instagram API ${response.status}`
      throw new InstagramGraphError(message, response.status)
    }
    return body
  } catch (error) {
    if (error instanceof InstagramGraphError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new InstagramGraphError('Instagram API timed out', 504)
    }
    throw new InstagramGraphError('Instagram API request failed', 502)
  } finally {
    clearTimeout(timer)
  }
}

export function extractGraphError(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const row = body as { error_message?: unknown; error?: { message?: string } | string }
  if (typeof row.error_message === 'string' && row.error_message.trim()) return row.error_message
  if (typeof row.error === 'string' && row.error.trim()) return row.error
  if (row.error && typeof row.error === 'object' && typeof row.error.message === 'string') {
    return row.error.message
  }
  return null
}

export async function graphGet(
  path: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(`${INSTAGRAM_GRAPH_BASE}/${path.replace(/^\//, '')}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  url.searchParams.set('access_token', accessToken)
  return fetchJson(url.toString())
}

export async function graphPost(
  path: string,
  accessToken: string,
  params: Record<string, string>
): Promise<unknown> {
  const url = new URL(`${INSTAGRAM_GRAPH_BASE}/${path.replace(/^\//, '')}`)
  url.searchParams.set('access_token', accessToken)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return fetchJson(url.toString(), { method: 'POST' })
}

export async function exchangeAuthorizationCode(input: {
  appId: string
  appSecret: string
  redirectUri: string
  code: string
}): Promise<unknown> {
  const body = new URLSearchParams({
    client_id: input.appId,
    client_secret: input.appSecret,
    grant_type: 'authorization_code',
    redirect_uri: input.redirectUri,
    code: input.code,
  })
  return fetchJson(INSTAGRAM_SHORT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export async function exchangeLongLivedToken(input: {
  appSecret: string
  shortLivedToken: string
}): Promise<unknown> {
  const url = new URL(INSTAGRAM_LONG_TOKEN_URL)
  url.searchParams.set('grant_type', 'ig_exchange_token')
  url.searchParams.set('client_secret', input.appSecret)
  url.searchParams.set('access_token', input.shortLivedToken)
  return fetchJson(url.toString())
}

export async function refreshLongLivedToken(accessToken: string): Promise<unknown> {
  const url = new URL(INSTAGRAM_REFRESH_TOKEN_URL)
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', accessToken)
  return fetchJson(url.toString())
}
