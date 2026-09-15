import { googleMerchantXmlResponse } from '@/lib/google-merchant/load-feed'

/**
 * Google Merchant Center RSS 2.0 product feed, built from the live catalog.
 */
export async function GET(): Promise<Response> {
  return googleMerchantXmlResponse()
}
