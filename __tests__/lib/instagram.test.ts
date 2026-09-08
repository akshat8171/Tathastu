/**
 * @jest-environment node
 */

import {
  buildAuthorizeUrl,
  isOAuthStateValid,
  parseLongLivedToken,
  parseShortLivedToken,
  shouldRefreshToken,
  validateReplyMessage,
} from '@/lib/instagram/oauth'
import { INSTAGRAM_AUTHORIZE_URL, INSTAGRAM_SCOPES } from '@/lib/instagram/constants'

describe('Instagram OAuth helpers', () => {
  it('builds the Instagram Login authorize URL', () => {
    const actual = buildAuthorizeUrl({
      appId: '123',
      redirectUri: 'https://www.tathastukeepsakes.in/api/admin/instagram/callback',
      state: 'abc',
    })
    expect(actual.startsWith(INSTAGRAM_AUTHORIZE_URL)).toBe(true)
    expect(actual).toContain('client_id=123')
    expect(actual).toContain('state=abc')
    expect(actual).toContain(encodeURIComponent('instagram_business_basic'))
    expect(INSTAGRAM_SCOPES).not.toContain('instagram_business_content_publish')
  })

  it('rejects mismatched OAuth state', () => {
    expect(isOAuthStateValid('aaaa', 'bbbb')).toBe(false)
    expect(isOAuthStateValid('same-token-value-okok', 'same-token-value-okok')).toBe(true)
    expect(isOAuthStateValid('', 'x')).toBe(false)
  })

  it('parses nested and flat short-lived token payloads', () => {
    expect(
      parseShortLivedToken({
        data: [{ access_token: 'short', user_id: '88', permissions: 'instagram_business_basic' }],
      })
    ).toEqual({ accessToken: 'short', userId: '88' })
    expect(parseShortLivedToken({ access_token: 'flat', user_id: 99 })).toEqual({
      accessToken: 'flat',
      userId: '99',
    })
    expect(parseShortLivedToken({})).toBeNull()
  })

  it('parses long-lived token payloads', () => {
    expect(parseLongLivedToken({ access_token: 'long', expires_in: 5184000 })).toEqual({
      accessToken: 'long',
      expiresIn: 5184000,
    })
    expect(parseLongLivedToken({ access_token: 'long' })).toBeNull()
  })

  it('refreshes tokens inside the 7-day window', () => {
    const now = Date.parse('2026-09-08T00:00:00Z')
    expect(shouldRefreshToken(new Date(now + 2 * 24 * 60 * 60 * 1000), now)).toBe(true)
    expect(shouldRefreshToken(new Date(now + 20 * 24 * 60 * 60 * 1000), now)).toBe(false)
    expect(shouldRefreshToken(null, now)).toBe(true)
  })

  it('validates reply copy', () => {
    expect(validateReplyMessage('  hello  ')).toEqual({ ok: true, message: 'hello' })
    expect(validateReplyMessage('')).toEqual({ ok: false, error: 'Reply cannot be empty' })
    expect(validateReplyMessage('x'.repeat(301)).ok).toBe(false)
    expect(validateReplyMessage(12).ok).toBe(false)
  })
})
