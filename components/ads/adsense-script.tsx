import {
  resolveAdsenseClientId,
  shouldLoadAdsense,
} from '@/lib/ads/adsense'

/**
 * Google AdSense (Auto ads) integration.
 *
 * Renders the standard adsbygoogle.js loader in the root layout `<head>`
 * so Google's site scanner can detect the tag. Loads only when:
 * - `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is a valid `ca-pub-…` ID, and
 * - the deployment is production (same gate as GA4).
 *
 * Until the Director pastes a real publisher ID into Vercel Production env,
 * this component returns null — no ads, no accidental invalid claims.
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
