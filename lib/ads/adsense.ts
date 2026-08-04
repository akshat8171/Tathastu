/**
 * Google AdSense configuration helpers.
 *
 * Pure, dependency-free logic kept separate from the React component in
 * `components/ads/adsense-script.tsx` so it can be unit-tested without
 * rendering the layout.
 */

/**
 * A Client / Publisher ID looks like `ca-pub-1234567890123456` — the
 * `ca-pub-` prefix followed by digits only. Validating before interpolating
 * into script `src` / `ads.txt` removes any injection surface (no quotes,
 * whitespace, or markup in a valid ID).
 */
export function isValidAdsenseClientId(
  id: string | undefined | null,
): id is string {
  return typeof id === 'string' && /^ca-pub-\d+$/.test(id)
}

/**
 * Strip the `ca-` prefix for `ads.txt` (Google expects `pub-XXXXXXXX`).
 */
export function toAdsTxtPublisherId(clientId: string): string {
  return clientId.replace(/^ca-/, '')
}

/**
 * Resolve the AdSense client ID from env.
 *
 * Returns `null` when unset/blank/malformed so the script and `ads.txt`
 * fail closed — never invent a publisher ID.
 */
export function resolveAdsenseClientId(
  envId: string | undefined = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
): string | null {
  const trimmed = typeof envId === 'string' ? envId.trim() : ''
  if (trimmed === '') return null
  return isValidAdsenseClientId(trimmed) ? trimmed : null
}

/**
 * Whether AdSense should load in the current environment.
 *
 * Same production-only gate as GA: never load on dev, test, or Vercel
 * preview. Kill-switch: `NEXT_PUBLIC_ADSENSE_DISABLED=true`.
 */
export function shouldLoadAdsense(
  env: { nodeEnv?: string; vercelEnv?: string; disabled?: string } = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    disabled: process.env.NEXT_PUBLIC_ADSENSE_DISABLED,
  },
): boolean {
  if (env.disabled === 'true') return false
  if (typeof env.vercelEnv === 'string' && env.vercelEnv !== '') {
    return env.vercelEnv === 'production'
  }
  return env.nodeEnv === 'production'
}

/**
 * Build the canonical ads.txt body for this publisher.
 *
 * `f08c47fec0942fa0` is Google's fixed certification authority ID for
 * AdSense (documented in Google ads.txt guidance).
 */
export function buildAdsTxtBody(clientId: string): string {
  const publisherId = toAdsTxtPublisherId(clientId)
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
}
