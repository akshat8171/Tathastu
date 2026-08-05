import {
  resolveAdsenseClientId,
  shouldLoadAdsense,
} from '@/lib/ads/adsense'

/**
 * Google AdSense (Auto ads) integration.
 *
 * Renders the standard adsbygoogle.js loader in the root layout `<head>`
 * so Google's site scanner can detect the tag. One script covers mobile and
 * desktop — Auto ads places responsive units. Loads only on production
 * (same gate as GA4) when a valid `ca-pub-…` ID resolves (built-in default
 * or `NEXT_PUBLIC_ADSENSE_CLIENT_ID` override).
 */
export function AdSenseScript() {
  const clientId = resolveAdsenseClientId()

  if (!shouldLoadAdsense() || !clientId) {
    return null
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  )
}
