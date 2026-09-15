import 'server-only'

import { getCatalogProducts } from '@/lib/catalog/store'
import { buildGoogleMerchantTsv, buildGoogleMerchantXml } from './feed'
import { buildMerchantProducts } from './from-catalog'

const CACHE_CONTROL = 'public, max-age=300, s-maxage=300'

export async function getLiveMerchantProducts() {
  const catalog = await getCatalogProducts()
  return buildMerchantProducts(catalog)
}

export async function googleMerchantXmlResponse(): Promise<Response> {
  return new Response(buildGoogleMerchantXml(await getLiveMerchantProducts()), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    },
  })
}

export async function googleMerchantTsvResponse(): Promise<Response> {
  return new Response(buildGoogleMerchantTsv(await getLiveMerchantProducts()), {
    status: 200,
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    },
  })
}
