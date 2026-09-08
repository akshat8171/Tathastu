/**
 * @jest-environment node
 */

import {
  buildAuthorizeUrl,
  createOAuthState,
  isOAuthStateValid,
  parseLongLivedToken,
  parseOAuthState,
  parseShortLivedToken,
  sanitizeInstagramAuthCode,
  shouldRefreshToken,
  validateReplyMessage,
} from '@/lib/instagram/oauth'
import { INSTAGRAM_AUTHORIZE_URL, INSTAGRAM_SCOPES } from '@/lib/instagram/constants'
import { extractGraphError } from '@/lib/instagram/graph'
import { getInstagramRedirectUri, resolveOAuthOrigin } from '@/lib/instagram/config'
import { describeInstagramConnectError } from '@/lib/instagram/connect-errors'

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
    expect(actual).toContain('enable_fb_login=0')
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

  it('signs and parses OAuth state with redirect URI + admin email', () => {
    process.env.INSTAGRAM_APP_SECRET = 'test-secret'
    const state = createOAuthState({
      email: 'tathastukeepsakes@gmail.com',
      redirectUri: 'https://www.tathastukeepsakes.in/api/admin/instagram/callback',
    })
    expect(parseOAuthState(state)).toEqual({
      email: 'tathastukeepsakes@gmail.com',
      redirectUri: 'https://www.tathastukeepsakes.in/api/admin/instagram/callback',
    })
    expect(parseOAuthState(`${state}x`)).toBeNull()
  })

  it('strips Instagram hash suffix from auth codes', () => {
    expect(sanitizeInstagramAuthCode('ABC#_')).toBe('ABC')
  })
})

describe('Instagram error surfaces', () => {
  it('reads Meta error_message from token failures', () => {
    expect(
      extractGraphError({
        error_type: 'OAuthException',
        error_message: 'Error validating verification code. Please make sure your redirect_uri is identical',
      })
    ).toContain('redirect_uri')
  })

  it('explains invalid_oauth_state for the admin page', () => {
    expect(describeInstagramConnectError('invalid_oauth_state')).toContain('same browser')
  })
})

describe('Instagram redirect URI origin', () => {
  it('keeps www and apex production hosts', () => {
    const site = 'https://www.tathastukeepsakes.in'
    expect(resolveOAuthOrigin('https://www.tathastukeepsakes.in', site)).toBe(
      'https://www.tathastukeepsakes.in'
    )
    expect(resolveOAuthOrigin('https://tathastukeepsakes.in', site)).toBe('https://tathastukeepsakes.in')
  })

  it('uses the request origin for production callback URLs', () => {
    const previousApp = process.env.APP_URL
    const previousRedirect = process.env.INSTAGRAM_REDIRECT_URI
    process.env.APP_URL = 'https://www.tathastukeepsakes.in'
    delete process.env.INSTAGRAM_REDIRECT_URI
    expect(getInstagramRedirectUri('https://www.tathastukeepsakes.in')).toBe(
      'https://www.tathastukeepsakes.in/api/admin/instagram/callback'
    )
    if (previousApp === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previousApp
    if (previousRedirect === undefined) delete process.env.INSTAGRAM_REDIRECT_URI
    else process.env.INSTAGRAM_REDIRECT_URI = previousRedirect
  })
})

