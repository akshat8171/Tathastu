import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import {
  INSTAGRAM_AUTHORIZE_URL,
  INSTAGRAM_SCOPES,
} from '@/lib/instagram/constants'

export interface AuthorizeUrlInput {
  appId: string
  redirectUri: string
  state: string
}

export interface ShortLivedToken {
  accessToken: string
  userId: string
}

export interface OAuthStatePayload {
  email: string
  redirectUri: string
}

function stateSigningKey(): string {
  return process.env.INSTAGRAM_APP_SECRET?.trim() || process.env.APP_URL || 'ig-oauth-state'
}

export function createOAuthState(payload?: OAuthStatePayload): string {
  if (!payload) return randomBytes(24).toString('hex')
  const body = Buffer.from(
    JSON.stringify({
      n: randomBytes(16).toString('hex'),
      e: payload.email,
      u: payload.redirectUri,
      t: Date.now() + 10 * 60 * 1000,
    })
  ).toString('base64url')
  const sig = createHmac('sha256', stateSigningKey()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function parseOAuthState(state: string): OAuthStatePayload | null {
  const dot = state.lastIndexOf('.')
  if (dot < 1) return null
  const body = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  const expected = createHmac('sha256', stateSigningKey()).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      e?: unknown
      u?: unknown
      t?: unknown
    }
    if (typeof parsed.e !== 'string' || typeof parsed.u !== 'string' || typeof parsed.t !== 'number') {
      return null
    }
    if (parsed.t < Date.now()) return null
    return { email: parsed.e, redirectUri: parsed.u }
  } catch {
    return null
  }
}

export function isOAuthStateValid(expected: string, received: string): boolean {
  if (!expected || !received) return false
  const expectedBuf = Buffer.from(expected)
  const receivedBuf = Buffer.from(received)
  if (expectedBuf.length !== receivedBuf.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}

export function buildAuthorizeUrl(input: AuthorizeUrlInput): string {
  const params = new URLSearchParams({
    client_id: input.appId,
    redirect_uri: input.redirectUri,
    response_type: 'code',
    scope: INSTAGRAM_SCOPES.join(','),
    state: input.state,
    enable_fb_login: '0',
  })
  return `${INSTAGRAM_AUTHORIZE_URL}?${params.toString()}`
}

export function sanitizeInstagramAuthCode(code: string): string {
  return code.replace(/#.*$/, '').trim()
}

export function parseShortLivedToken(payload: unknown): ShortLivedToken | null {
  if (!payload || typeof payload !== 'object') return null
  const root = payload as Record<string, unknown>
  const nested = Array.isArray(root.data) ? root.data[0] : root
  if (!nested || typeof nested !== 'object') return null
  const row = nested as Record<string, unknown>
  const accessToken = typeof row.access_token === 'string' ? row.access_token : ''
  const userId = row.user_id == null ? '' : String(row.user_id)
  if (!accessToken || !userId) return null
  return { accessToken, userId }
}

export function parseLongLivedToken(payload: unknown): {
  accessToken: string
  expiresIn: number
} | null {
  if (!payload || typeof payload !== 'object') return null
  const row = payload as Record<string, unknown>
  const accessToken = typeof row.access_token === 'string' ? row.access_token : ''
  const expiresIn = typeof row.expires_in === 'number' ? row.expires_in : 0
  if (!accessToken || expiresIn <= 0) return null
  return { accessToken, expiresIn }
}

export function shouldRefreshToken(expiresAt: Date | string | null, now = Date.now()): boolean {
  if (!expiresAt) return true
  const expiryMs = typeof expiresAt === 'string' ? Date.parse(expiresAt) : expiresAt.getTime()
  if (!Number.isFinite(expiryMs)) return true
  return expiryMs - now < 7 * 24 * 60 * 60 * 1000
}

export function validateReplyMessage(raw: unknown): { ok: true; message: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') return { ok: false, error: 'Reply must be text' }
  const message = raw.trim()
  if (!message) return { ok: false, error: 'Reply cannot be empty' }
  if (message.length > 300) return { ok: false, error: 'Reply must be 300 characters or fewer' }
  return { ok: true, message }
}
