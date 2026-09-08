import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getInstagramAppConfig } from '@/lib/instagram/config'
import { INSTAGRAM_OAUTH_STATE_COOKIE, INSTAGRAM_OAUTH_STATE_MAX_AGE_SEC } from '@/lib/instagram/constants'
import { buildAuthorizeUrl, createOAuthState } from '@/lib/instagram/oauth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const config = getInstagramAppConfig()
  if (!config) {
    return NextResponse.json(
      { error: 'Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET first' },
      { status: 400 }
    )
  }

  const state = createOAuthState()
  const url = buildAuthorizeUrl({
    appId: config.appId,
    redirectUri: config.redirectUri,
    state,
  })
  const response = NextResponse.redirect(url)
  response.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: INSTAGRAM_OAUTH_STATE_MAX_AGE_SEC,
  })
  return response
}
