import { NextRequest, NextResponse } from 'next/server'
import { isAllowlistedAdminEmail } from '@/lib/auth/admin-emails'
import { requireAdmin } from '@/lib/auth/admin'
import { getInstagramAppConfig } from '@/lib/instagram/config'
import { INSTAGRAM_OAUTH_STATE_COOKIE } from '@/lib/instagram/constants'
import { fetchInstagramProfile } from '@/lib/instagram/dashboard'
import { InstagramGraphError, exchangeAuthorizationCode } from '@/lib/instagram/graph'
import {
  parseOAuthState,
  parseShortLivedToken,
  sanitizeInstagramAuthCode,
} from '@/lib/instagram/oauth'
import {
  loadInstagramConnection,
  persistExchangedToken,
  saveInstagramConnection,
} from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'

function redirectToAdmin(redirectUri: string, query: string): NextResponse {
  const origin = new URL(redirectUri).origin
  return NextResponse.redirect(`${origin}/admin/instagram?${query}`)
}

function secondsUntil(iso: string | null): number {
  if (!iso) return 60 * 24 * 60 * 60
  const delta = Math.floor((Date.parse(iso) - Date.now()) / 1000)
  return Number.isFinite(delta) && delta > 60 ? delta : 60
}

export async function GET(request: NextRequest) {
  const fallbackOrigin = `${request.nextUrl.protocol}//${request.nextUrl.host}`
  const fallbackRedirect = `${fallbackOrigin}/api/admin/instagram/callback`

  const denied = request.nextUrl.searchParams.get('error')
  const receivedState = request.nextUrl.searchParams.get('state') || ''
  const parsedState = receivedState ? parseOAuthState(receivedState) : null
  const redirectUri = parsedState?.redirectUri || fallbackRedirect

  if (denied) return redirectToAdmin(redirectUri, `error=${encodeURIComponent(denied)}`)

  const cookieState = request.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value || ''
  if (cookieState && cookieState !== receivedState) {
    return redirectToAdmin(redirectUri, 'error=invalid_oauth_state')
  }
  if (!parsedState || !isAllowlistedAdminEmail(parsedState.email)) {
    return redirectToAdmin(redirectUri, 'error=invalid_oauth_state')
  }

  const auth = await requireAdmin()
  const connectedByEmail = (auth.ok ? auth.user.email : parsedState.email) ?? null

  const rawCode = request.nextUrl.searchParams.get('code')
  const code = rawCode ? sanitizeInstagramAuthCode(rawCode) : ''
  if (!code) return redirectToAdmin(redirectUri, 'error=invalid_oauth_state')

  const config = getInstagramAppConfig(new URL(redirectUri).origin)
  if (!config) return redirectToAdmin(redirectUri, 'error=instagram_not_configured')

  try {
    const shortLived = parseShortLivedToken(
      await exchangeAuthorizationCode({
        appId: config.appId,
        appSecret: config.appSecret,
        redirectUri: parsedState.redirectUri,
        code,
      })
    )
    if (!shortLived) return redirectToAdmin(redirectUri, 'error=token_exchange_failed')

    const stored = await persistExchangedToken({
      shortLivedToken: shortLived.accessToken,
      userId: shortLived.userId,
      connectedByEmail,
    })
    if (!stored.ok) return redirectToAdmin(redirectUri, `error=${encodeURIComponent(stored.error)}`)

    const loaded = await loadInstagramConnection()
    if (loaded.ok && loaded.connection) {
      try {
        const profile = await fetchInstagramProfile(loaded.connection.accessToken)
        await saveInstagramConnection({
          igUserId: profile.id,
          username: profile.username,
          accessToken: loaded.connection.accessToken,
          expiresInSec: secondsUntil(loaded.connection.tokenExpiresAt),
          connectedByEmail,
        })
      } catch {
        // Token is saved; username can hydrate on the next dashboard load.
      }
    }

    const response = redirectToAdmin(redirectUri, 'connected=1')
    response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 })
    return response
  } catch (error) {
    const message =
      error instanceof InstagramGraphError
        ? error.message
        : 'instagram_connect_failed'
    return redirectToAdmin(redirectUri, `error=${encodeURIComponent(message)}`)
  }
}
