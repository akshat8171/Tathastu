/**
 * @jest-environment node
 *
 * Tests for auth.ts token minting. A fake fetch is injected so no network is
 * touched; we assert the request shape (endpoint, Basic auth, grant body) and
 * the token/ error handling for both grant types.
 */

import {
  getAppAccessToken,
  getAccessToken,
  mintAccessToken,
  PINTEREST_API_BASE,
} from '@/scripts/pinterest/auth'

type Captured = { url: string; init: RequestInit }

/** Builds a fake fetch that records the call and returns a canned Response. */
function fakeFetch(
  responder: (url: string, init: RequestInit) => { ok: boolean; status?: number; body: unknown },
  sink: Captured[],
): typeof fetch {
  return (async (url: string, init: RequestInit = {}) => {
    sink.push({ url, init })
    const { ok, status = ok ? 200 : 400, body } = responder(url, init)
    return {
      ok,
      status,
      statusText: ok ? 'OK' : 'Bad Request',
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as unknown as Response
  }) as unknown as typeof fetch
}

function parseBody(init: RequestInit): URLSearchParams {
  return new URLSearchParams(String(init.body ?? ''))
}

describe('getAppAccessToken (client_credentials)', () => {
  it('POSTs to the oauth/token endpoint with a client_credentials grant + scopes', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 'app-tok' } }), calls)

    const token = await getAppAccessToken({
      appId: 'A',
      appSecret: 'S',
      scopes: 'pins:write,boards:write',
      fetchImpl,
    })

    expect(token).toBe('app-tok')
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe(`${PINTEREST_API_BASE}/oauth/token`)

    const body = parseBody(calls[0]!.init)
    expect(body.get('grant_type')).toBe('client_credentials')
    expect(body.get('scope')).toBe('pins:write,boards:write')
    expect(body.get('refresh_token')).toBeNull()
  })

  it('sends Basic auth built from app id:secret', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 't' } }), calls)
    await getAppAccessToken({ appId: 'A', appSecret: 'S', scopes: 'pins:write', fetchImpl })

    const headers = calls[0]!.init.headers as Record<string, string>
    const expected = `Basic ${Buffer.from('A:S').toString('base64')}`
    expect(headers.Authorization).toBe(expected)
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded')
  })

  it('throws an actionable error on a non-OK response', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: false, status: 401, body: { error: 'bad' } }), calls)
    await expect(
      getAppAccessToken({ appId: 'A', appSecret: 'S', scopes: 'pins:write', fetchImpl }),
    ).rejects.toThrow(/client_credentials token request failed \(401/)
  })

  it('throws when the response lacks an access_token', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { token_type: 'bearer' } }), calls)
    await expect(
      getAppAccessToken({ appId: 'A', appSecret: 'S', scopes: 'pins:write', fetchImpl }),
    ).rejects.toThrow(/no access_token/)
  })
})

describe('getAccessToken (refresh_token)', () => {
  it('POSTs a refresh_token grant with the refresh token in the body', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 'refreshed' } }), calls)

    const token = await getAccessToken({
      appId: 'A',
      appSecret: 'S',
      refreshToken: 'RT',
      fetchImpl,
    })

    expect(token).toBe('refreshed')
    const body = parseBody(calls[0]!.init)
    expect(body.get('grant_type')).toBe('refresh_token')
    expect(body.get('refresh_token')).toBe('RT')
  })

  it('surfaces a re-mint hint on failure', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: false, status: 400, body: 'nope' }), calls)
    await expect(
      getAccessToken({ appId: 'A', appSecret: 'S', refreshToken: 'RT', fetchImpl }),
    ).rejects.toThrow(/SETUP\.md/)
  })
})

describe('mintAccessToken (mode dispatch)', () => {
  const baseCfg = {
    pinterestAppId: 'A',
    pinterestAppSecret: 'S',
    pinterestScopes: 'pins:write',
  }

  it('uses client_credentials when authMode is client_credentials', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 'app-tok' } }), calls)
    const token = await mintAccessToken(
      { ...baseCfg, authMode: 'client_credentials', pinterestRefreshToken: undefined },
      fetchImpl,
    )
    expect(token).toBe('app-tok')
    expect(parseBody(calls[0]!.init).get('grant_type')).toBe('client_credentials')
  })

  it('uses refresh_token when authMode is refresh_token', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 'r-tok' } }), calls)
    const token = await mintAccessToken(
      { ...baseCfg, authMode: 'refresh_token', pinterestRefreshToken: 'RT' },
      fetchImpl,
    )
    expect(token).toBe('r-tok')
    expect(parseBody(calls[0]!.init).get('grant_type')).toBe('refresh_token')
  })

  it('throws if refresh_token mode is selected without a token', async () => {
    const calls: Captured[] = []
    const fetchImpl = fakeFetch(() => ({ ok: true, body: { access_token: 'x' } }), calls)
    await expect(
      mintAccessToken(
        { ...baseCfg, authMode: 'refresh_token', pinterestRefreshToken: undefined },
        fetchImpl,
      ),
    ).rejects.toThrow(/PINTEREST_REFRESH_TOKEN is not set/)
    expect(calls).toHaveLength(0) // never hit the network
  })
})
