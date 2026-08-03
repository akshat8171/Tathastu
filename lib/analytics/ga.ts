/**
 * Google Analytics 4 (GA4) configuration helpers.
 *
 * Pure, dependency-free logic kept separate from the React component in
 * `components/analytics/google-analytics.tsx` so it can be unit-tested
 * without rendering `next/script`.
 */

/**
 * Built-in GA4 Measurement ID for Tathastu Keepsakes.
 *
 * A GA4 Measurement ID is a PUBLIC identifier (GA is designed to expose it in
 * client-side code), NOT a secret — so shipping a default here is safe and
 * keeps analytics working even when the env override is not set on the deploy.
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID to target a different property.
 */
export const DEFAULT_GA_MEASUREMENT_ID = 'G-X8RL0R1YNH'

/**
 * A GA4 Measurement ID looks like `G-XXXXXXXXXX` — the `G-` prefix followed by
 * uppercase-alphanumeric characters. We validate it before interpolating into
 * the inline gtag bootstrap script, which removes any script-injection surface
 * (a valid ID can contain no quotes, whitespace or markup).
 */
export function isValidGaId(id: string | undefined | null): id is string {
  return typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id)
}

/**
 * Resolve the effective GA Measurement ID.
 *
 * - Uses the env override when it is a non-empty, valid ID.
 * - Falls back to {@link DEFAULT_GA_MEASUREMENT_ID} when the override is
 *   absent/blank.
 * - Returns `null` when the resolved candidate is malformed, so a typo in an
 *   explicit override fails safe (no hits) rather than silently polluting the
 *   default property.
 */
export function resolveGaId(
  envId: string | undefined = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
): string | null {
  const trimmed = typeof envId === 'string' ? envId.trim() : ''
  const candidate = trimmed !== '' ? trimmed : DEFAULT_GA_MEASUREMENT_ID
  return isValidGaId(candidate) ? candidate : null
}

/**
 * Whether analytics should load in the current environment.
 *
 * Goal: send hits ONLY from the real production site — never from dev, test, or
 * Vercel *preview* deployments (which also run with `NODE_ENV === 'production'`,
 * so a NODE_ENV-only gate would pollute the production property with preview
 * traffic).
 *
 * - On Vercel, `VERCEL_ENV` distinguishes `production` from `preview`/
 *   `development`. Vercel auto-exposes it to the browser bundle as
 *   `NEXT_PUBLIC_VERCEL_ENV` for Next.js apps, so we gate on that when present.
 * - Off Vercel (e.g. self-hosted `next start`), fall back to `NODE_ENV`.
 * - Kill-switch: `NEXT_PUBLIC_ANALYTICS_DISABLED=true` force-disables analytics
 *   in every environment. Note this is a `NEXT_PUBLIC_` var, so it is inlined at
 *   build time — flipping it takes effect on the next build/redeploy, not
 *   instantly on a live deployment.
 */
export function shouldLoadAnalytics(
  env: { nodeEnv?: string; vercelEnv?: string; disabled?: string } = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    disabled: process.env.NEXT_PUBLIC_ANALYTICS_DISABLED,
  },
): boolean {
  if (env.disabled === 'true') return false
  // When running on Vercel, trust VERCEL_ENV — it is the only signal that
  // separates production from preview (both build with NODE_ENV=production).
  if (typeof env.vercelEnv === 'string' && env.vercelEnv !== '') {
    return env.vercelEnv === 'production'
  }
  // Not on Vercel: fall back to the standard build mode.
  return env.nodeEnv === 'production'
}
