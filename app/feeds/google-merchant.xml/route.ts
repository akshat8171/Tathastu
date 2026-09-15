import { buildGoogleMerchantXml } from '@/lib/google-merchant/feed'

/**
 * Google Merchant Center RSS 2.0 product feed.
 *
 * Merchant Center rejects .xls/.xlsx and Google Sheets edit URLs as XML.
 * Point a scheduled fetch at this URL with file type XML.
 */
export function GET(): Response {
  return new Response(buildGoogleMerchantXml(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
