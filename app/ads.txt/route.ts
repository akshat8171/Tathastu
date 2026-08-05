import {
  buildAdsTxtBody,
  resolveAdsenseClientId,
} from '@/lib/ads/adsense'

/**
 * Serves `/ads.txt` for Authorized Digital Sellers.
 *
 * AdSense reviewers and ad exchanges fetch this at the site root. We only
 * emit a line when a valid publisher ID is configured — otherwise 404 so we
 * never claim a wrong `pub-` ID.
 */
export function GET(): Response {
  const clientId = resolveAdsenseClientId()

  if (!clientId) {
    return new Response('Not Found\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  return new Response(buildAdsTxtBody(clientId), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Short cache so flipping the env + redeploy propagates quickly.
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
