import { buildGoogleMerchantTsv } from '@/lib/google-merchant/feed'

/**
 * Google Merchant Center tab-delimited product feed.
 *
 * Use this if Merchant Center is set to TXT/TSV instead of XML.
 */
export function GET(): Response {
  return new Response(buildGoogleMerchantTsv(), {
    status: 200,
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
