/**
 * @jest-environment node
 *
 * Tests for config.ts — env validation + auth-mode selection. Pure (no network);
 * every case passes an explicit `env` object so we never touch process.env.
 */

import { loadConfig, DEFAULT_SCOPES, DEFAULT_AUTH_MODE } from '@/scripts/pinterest/config'

// Cast via `unknown`: Next.js augments NodeJS.ProcessEnv with a required
// NODE_ENV, which a partial test literal deliberately omits.
const BASE = {
  GEMINI_API_KEY: 'gemini-test-key',
  PINTEREST_APP_ID: 'app-123',
  PINTEREST_APP_SECRET: 'secret-abc',
} as unknown as NodeJS.ProcessEnv

describe('loadConfig — defaults', () => {
  it('defaults authMode to client_credentials and needs no refresh token', () => {
    const cfg = loadConfig({ ...BASE })
    expect(cfg.authMode).toBe('client_credentials')
    expect(cfg.authMode).toBe(DEFAULT_AUTH_MODE)
    expect(cfg.pinterestRefreshToken).toBeUndefined()
  })

  it('defaults scopes and site origin', () => {
    const cfg = loadConfig({ ...BASE })
    expect(cfg.pinterestScopes).toBe(DEFAULT_SCOPES)
    expect(cfg.siteOrigin).toBe('https://www.tathastukeepsakes.in')
  })

  it('strips a trailing slash from an overridden SITE_ORIGIN', () => {
    const cfg = loadConfig({ ...BASE, SITE_ORIGIN: 'https://staging.example.in/' })
    expect(cfg.siteOrigin).toBe('https://staging.example.in')
  })

  it('honors a custom PINTEREST_SCOPES', () => {
    const cfg = loadConfig({ ...BASE, PINTEREST_SCOPES: 'pins:write' })
    expect(cfg.pinterestScopes).toBe('pins:write')
  })
})

describe('loadConfig — required vars', () => {
  it('throws listing every missing required var', () => {
    expect(() => loadConfig({} as unknown as NodeJS.ProcessEnv)).toThrow(
      /GEMINI_API_KEY.*PINTEREST_APP_ID.*PINTEREST_APP_SECRET/s,
    )
  })

  it('treats whitespace-only values as missing', () => {
    expect(() => loadConfig({ ...BASE, PINTEREST_APP_ID: '   ' })).toThrow(/PINTEREST_APP_ID/)
  })

  it('does NOT require a refresh token in client_credentials mode', () => {
    expect(() => loadConfig({ ...BASE })).not.toThrow()
  })
})

describe('loadConfig — refresh_token mode', () => {
  it('requires PINTEREST_REFRESH_TOKEN when mode is refresh_token', () => {
    expect(() =>
      loadConfig({ ...BASE, PINTEREST_AUTH_MODE: 'refresh_token' }),
    ).toThrow(/PINTEREST_REFRESH_TOKEN/)
  })

  it('accepts refresh_token mode when the token is provided', () => {
    const cfg = loadConfig({
      ...BASE,
      PINTEREST_AUTH_MODE: 'refresh_token',
      PINTEREST_REFRESH_TOKEN: 'refresh-xyz',
    })
    expect(cfg.authMode).toBe('refresh_token')
    expect(cfg.pinterestRefreshToken).toBe('refresh-xyz')
  })

  it('is case-insensitive for the mode value', () => {
    const cfg = loadConfig({
      ...BASE,
      PINTEREST_AUTH_MODE: 'Client_Credentials',
    })
    expect(cfg.authMode).toBe('client_credentials')
  })

  it('rejects an unknown auth mode', () => {
    expect(() => loadConfig({ ...BASE, PINTEREST_AUTH_MODE: 'password' })).toThrow(
      /Invalid PINTEREST_AUTH_MODE/,
    )
  })
})
