/**
 * auth.ts — Pinterest OAuth token minting.
 *
 * We NEVER store an access token (they're short-lived, ~30 days). Instead we
 * mint a fresh one at the start of every daily run. Two grant types are
 * supported; see config.ts / SETUP.md for how to choose.
 *
 * 1. CLIENT CREDENTIALS (default, recommended for a single-account cron)
 *      POST https://api.pinterest.com/v5/oauth/token
 *      Authorization: Basic base64(APP_ID:APP_SECRET)
 *      Content-Type: application/x-www-form-urlencoded
 *      body: grant_type=client_credentials&scope=<space/comma-separated>
 *    App-only token acting on the app owner's own account. No refresh token, no
 *    rotation — the linchpin of hands-off autonomy. Verified (Pinterest v5 ref)
 *    to support POST /v5/pins, POST /v5/boards, GET /v5/boards.
 *
 * 2. REFRESH TOKEN (fallback)
 *      body: grant_type=refresh_token&refresh_token=<token>
 *    Authorization-Code refresh flow. NOTE: Pinterest's "continuous" refresh
 *    token ROTATES on every refresh and the old one expires within ~60 days, so
 *    a statically-seeded token here is NOT indefinitely autonomous — re-mint per
 *    SETUP.md. Prefer client_credentials unless your app truly can't post
 *    app-only.
 *
 * Endpoints verified against Pinterest API v5 docs.
 */

import type { AuthMode, Config } from './config'

export const PINTEREST_API_BASE = 'https://api.pinterest.com/v5'

interface TokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  scope?: string
  /** Present on refresh_token grants; the (rotated) continuous refresh token. */
  refresh_token?: string
  refresh_token_expires_at?: number
}

/** Common OAuth token POST with Basic auth + form body; parses + validates. */
async function requestToken(params: {
  appId: string
  appSecret: string
  body: URLSearchParams
  grantLabel: string
  fetchImpl: typeof fetch
}): Promise<TokenResponse> {
  const { appId, appSecret, body, grantLabel, fetchImpl } = params
  const basic = Buffer.from(`${appId}:${appSecret}`).toString('base64')

  const res = await fetchImpl(`${PINTEREST_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const detail = await safeReadBody(res)
    throw new Error(
      `Pinterest ${grantLabel} token request failed (${res.status} ${res.statusText}). ` +
        `Check your PINTEREST_APP_ID/PINTEREST_APP_SECRET (and refresh token if using that mode) ` +
        `— see scripts/pinterest/SETUP.md. Response: ${detail}`,
    )
  }

  const json = (await res.json()) as TokenResponse
  if (!json.access_token) {
    throw new Error(`Pinterest ${grantLabel} token request returned no access_token.`)
  }
  return json
}

/**
 * Mints an app-only access token via the Client Credentials grant.
 * No refresh token involved — the recommended path for a single-account cron.
 */
export async function getAppAccessToken(params: {
  appId: string
  appSecret: string
  scopes: string
  fetchImpl?: typeof fetch
}): Promise<string> {
  const { appId, appSecret, scopes, fetchImpl = fetch } = params
  const body = new URLSearchParams({ grant_type: 'client_credentials', scope: scopes })
  const json = await requestToken({
    appId,
    appSecret,
    body,
    grantLabel: 'client_credentials',
    fetchImpl,
  })
  return json.access_token
}

/**
 * Exchanges a refresh token for a fresh access token (Authorization-Code flow).
 *
 * @throws a clear, actionable error if Pinterest rejects the refresh (e.g. the
 *         refresh token was revoked, rotated, or expired — see SETUP.md).
 */
export async function getAccessToken(params: {
  appId: string
  appSecret: string
  refreshToken: string
  fetchImpl?: typeof fetch
}): Promise<string> {
  const { appId, appSecret, refreshToken, fetchImpl = fetch } = params
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  const json = await requestToken({
    appId,
    appSecret,
    body,
    grantLabel: 'refresh_token',
    fetchImpl,
  })
  return json.access_token
}

/**
 * Mints an access token according to the configured auth mode. This is the
 * single entry point run.ts uses; it hides the grant-type branching.
 */
export async function mintAccessToken(
  config: Pick<
    Config,
    'authMode' | 'pinterestAppId' | 'pinterestAppSecret' | 'pinterestScopes' | 'pinterestRefreshToken'
  >,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const mode: AuthMode = config.authMode
  if (mode === 'refresh_token') {
    if (!config.pinterestRefreshToken) {
      throw new Error(
        'authMode is "refresh_token" but PINTEREST_REFRESH_TOKEN is not set (see SETUP.md).',
      )
    }
    return getAccessToken({
      appId: config.pinterestAppId,
      appSecret: config.pinterestAppSecret,
      refreshToken: config.pinterestRefreshToken,
      fetchImpl,
    })
  }
  return getAppAccessToken({
    appId: config.pinterestAppId,
    appSecret: config.pinterestAppSecret,
    scopes: config.pinterestScopes,
    fetchImpl,
  })
}

/** Reads a response body defensively for error reporting; never throws. */
async function safeReadBody(res: Response): Promise<string> {
  try {
    const text = await res.text()
    return text.slice(0, 500)
  } catch {
    return '<unreadable response body>'
  }
}
