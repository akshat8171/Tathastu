import { resolveGaId, shouldLoadAnalytics } from '@/lib/analytics/ga'

/**
 * Google Analytics 4 (GA4) integration.
 *
 * Renders the standard gtag.js snippet as real <script> tags so it is present
 * in the server-rendered HTML — this is what Google's tag detector (and site
 * scanners) look for, and it starts loading a beat earlier for users. Mounted
 * once from the root layout's <head>, mirroring the existing JSON-LD pattern.
 *
 * The loader uses `async` so it never blocks parsing/first paint. The inline
 * bootstrap queues into `dataLayer`; gtag.js drains the queue when it arrives,
 * so load order between the two scripts does not matter.
 *
 * Returns null (no hits sent) when analytics is disabled for the current
 * environment or when no valid Measurement ID is configured — keeping dev,
 * preview and test traffic out of the production property.
 *
 * The Measurement ID is validated (`^G-[A-Z0-9]+$`) before interpolation, so
 * the inline bootstrap contains only `G`, `-`, digits and uppercase letters —
 * no quotes, whitespace or markup — leaving no script-injection surface.
 */
export function GoogleAnalytics() {
  const gaId = resolveGaId()

  if (!shouldLoadAnalytics() || !gaId) {
    return null
  }

  const bootstrap =
    'window.dataLayer = window.dataLayer || [];' +
    'function gtag(){dataLayer.push(arguments);}' +
    "gtag('js', new Date());" +
    `gtag('config', '${gaId}');`

  return (
    <>
      {/* Google tag (gtag.js) */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script>{bootstrap}</script>
    </>
  )
}
