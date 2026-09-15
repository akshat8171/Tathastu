import { googleMerchantTsvResponse } from '@/lib/google-merchant/load-feed'

/**
 * Google Merchant Center tab-delimited product feed, built from the live catalog.
 */
export async function GET(): Promise<Response> {
  return googleMerchantTsvResponse()
}
