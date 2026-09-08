import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getSiteUrl } from '@/lib/admin/links'
import { getInstagramAppConfig } from '@/lib/instagram/config'
import { INSTAGRAM_OAUTH_STATE_COOKIE } from '@/lib/instagram/constants'
import { fetchInstagramProfile } from '@/lib/instagram/dashboard'
import { exchangeAuthorizationCode } from '@/lib/instagram/graph'
import { isOAuthStateValid, parseShortLivedToken } from '@/lib/instagram/oauth'
import {
  loadInstagramConnection,
  persistExchangedToken,
  saveInstagramConnection,
} from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'

function redirectToAdmin(query: string): NextResponse {
  return NextResponse.redirect(`${getSiteUrl()}/admin/instagram?${query}`)
}

function secondsUntil(iso: string | null): number {
  if (!iso) return 60 * 24 * 60 * 60
  const delta = Math.floor((Date.parse(iso) - Date.now()) / 1000)
  return Number.isFinite(delta) && delta > 60 ? delta : 60
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const denied = request.nextUrl.searchParams.get('error')
  if (denied) return redirectToAdmin(`error=${encodeURIComponent(denied)}`)

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const expected = request.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value || ''
  if (!code || !isOAuthStateValid(expected, state || '')) {
    return redirectToAdmin('error=invalid_oauth_state')
  }

  const config = getInstagramAppConfig()
  if (!config) return redirectToAdmin('error=instagram_not_configured')

  try {
    const shortLived = parseShortLivedToken(
      await exchangeAuthorizationCode({
        appId: config.appId,
        appSecret: config.appSecret,
        redirectUri: config.redirectUri,
        code,
      })
    )
    if (!shortLived) return redirectToAdmin('error=token_exchange_failed')

    const stored = await persistExchangedToken({
      shortLivedToken: shortLived.accessToken,
      userId: shortLived.userId,
      connectedByEmail: auth.user.email ?? null,
    })
    if (!stored.ok) return redirectToAdmin(`error=${encodeURIComponent(stored.error)}`)

    const loaded = await loadInstagramConnection()
    if (loaded.ok && loaded.connection) {
      try {
        const profile = await fetchInstagramProfile(loaded.connection.accessToken)
        await saveInstagramConnection({
          igUserId: profile.id,
          username: profile.username,
          accessToken: loaded.connection.accessToken,
          expiresInSec: secondsUntil(loaded.connection.tokenExpiresAt),
          connectedByEmail: auth.user.email ?? null,
        })
      } catch {
        // Token is saved; username can hydrate on the next dashboard load.
      }
    }

    const response = redirectToAdmin('connected=1')
    response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 })
    return response
  } catch {
    return redirectToAdmin('error=instagram_connect_failed')
  }
}
