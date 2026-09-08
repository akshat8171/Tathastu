import { randomBytes, timingSafeEqual } from 'crypto'
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

export function createOAuthState(): string {
  return randomBytes(24).toString('hex')
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
  })
  return `${INSTAGRAM_AUTHORIZE_URL}?${params.toString()}`
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
