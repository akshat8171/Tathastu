/**
 * config.ts — Environment loading + validation for the Pinterest autopilot.
 *
 * Fails fast with a single, human-readable error listing every missing secret,
 * so a misconfigured GitHub Actions run tells you exactly what to fix instead of
 * dying with an opaque `undefined` deep inside an API call.
 *
 * SECURITY: every value here is a secret or environment config. Nothing in this
 * module is ever written to disk or committed — the values come only from
 * `process.env`, populated by encrypted GitHub Actions secrets.
 *
 * AUTH MODES (see SETUP.md and the design spec §5):
 *   - client_credentials (DEFAULT, recommended): app-only token that acts on the
 *     app owner's own account. No refresh token, no token rotation — ideal for a
 *     single-account cron. Verified to support POST /v5/pins + boards on v5.
 *   - refresh_token (fallback): Authorization-Code refresh flow. Pinterest's
 *     "continuous" refresh token ROTATES on every refresh, so this mode only
 *     works statically for up to ~60 days before the seeded token must be
 *     re-minted (see SETUP.md). Kept for apps that can't post via app-only.
 */

/** How we obtain a Pinterest access token each run. */
export type AuthMode = 'client_credentials' | 'refresh_token'

export interface Config {
  /** Gemini (Google AI Studio) API key — powers the SEO metadata generation. */
  geminiApiKey: string
  /** Pinterest app credentials (from the developer portal). Both modes need these. */
  pinterestAppId: string
  pinterestAppSecret: string
  /** Which OAuth grant to use to mint the per-run access token. */
  authMode: AuthMode
  /** OAuth scopes requested for the client_credentials grant. */
  pinterestScopes: string
  /**
   * Long-lived Pinterest OAuth refresh token. Only used — and only required —
   * when authMode === 'refresh_token'.
   */
  pinterestRefreshToken?: string
  /** Public origin of the store; product images + links are built from this. */
  siteOrigin: string
}

/** Non-secret default; overridable via env for staging/preview origins. */
const DEFAULT_SITE_ORIGIN = 'https://www.tathastukeepsakes.in'

/** Least-privilege scopes needed to list/create boards and create pins. */
export const DEFAULT_SCOPES = 'boards:read,boards:write,pins:read,pins:write'

/** Default auth mode — the simpler, rotation-free app-only grant. */
export const DEFAULT_AUTH_MODE: AuthMode = 'client_credentials'

/**
 * Reads and validates all required configuration from the environment.
 * @throws Error listing every missing variable, if any are absent.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const missing: string[] = []

  const require_ = (name: string): string => {
    const value = env[name]
    if (!value || value.trim() === '') {
      missing.push(name)
      return ''
    }
    return value.trim()
  }

  // Auth mode: default to client_credentials; validate any explicit override.
  const rawMode = env.PINTEREST_AUTH_MODE?.trim().toLowerCase()
  let authMode: AuthMode = DEFAULT_AUTH_MODE
  if (rawMode) {
    if (rawMode !== 'client_credentials' && rawMode !== 'refresh_token') {
      throw new Error(
        `Invalid PINTEREST_AUTH_MODE "${rawMode}". Use "client_credentials" (default) or "refresh_token".`,
      )
    }
    authMode = rawMode
  }

  const config: Config = {
    geminiApiKey: require_('GEMINI_API_KEY'),
    pinterestAppId: require_('PINTEREST_APP_ID'),
    pinterestAppSecret: require_('PINTEREST_APP_SECRET'),
    authMode,
    pinterestScopes: env.PINTEREST_SCOPES?.trim() || DEFAULT_SCOPES,
    // Only required in refresh_token mode; requested conditionally below.
    pinterestRefreshToken:
      authMode === 'refresh_token' ? require_('PINTEREST_REFRESH_TOKEN') : undefined,
    // SITE_ORIGIN is optional — falls back to the production origin.
    siteOrigin: (env.SITE_ORIGIN?.trim() || DEFAULT_SITE_ORIGIN).replace(/\/+$/, ''),
  }

  if (missing.length > 0) {
    throw new Error(
      `Pinterest autopilot is missing required environment variables: ${missing.join(', ')}. ` +
        `Set them as encrypted GitHub Actions secrets (see scripts/pinterest/SETUP.md).`,
    )
  }

  return config
}
