import Script from 'next/script'
import { resolveGaId, shouldLoadAnalytics } from '@/lib/analytics/ga'

/**
 * Google Analytics 4 (GA4) integration.
 *
 * Loads gtag.js and initialises the GA4 property with the `afterInteractive`
 * strategy, so it never blocks first paint. Mounted once from the root layout.
 *
 * Renders nothing (no hits sent) when analytics is disabled for the current
 * environment or when no valid Measurement ID is configured — keeping dev,
 * preview and test traffic out of the production property.
 *
 * The Measurement ID is validated (`^G-[A-Z0-9]+$`) before interpolation, so
 * the inline bootstrap script has no injection surface.
 */
export function GoogleAnalytics() {
  const gaId = resolveGaId()

  if (!shouldLoadAnalytics() || !gaId) {
    return null
  }

  return (
    <>
      <Script
        id="ga4-lib"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
