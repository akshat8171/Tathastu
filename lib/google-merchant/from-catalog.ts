import listingsJson from './listings.json'
import type { CatalogProduct } from '@/lib/catalog/types'
import type { MerchantProduct } from './feed'

export const MERCHANT_SITE_ORIGIN = 'https://www.tathastukeepsakes.in'
export const MERCHANT_BRAND = 'Tathastu Keepsakes'
export const MERCHANT_TITLE_SUFFIX =
  ' | Custom 3D Printed PLA Gift | Tathastu Keepsakes'

export interface MerchantListing {
  offerId: string
  productId: string
  ageGroup: string
  productType: string
}

export const merchantListings = listingsJson as MerchantListing[]

export function toAbsoluteProductUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${MERCHANT_SITE_ORIGIN}${normalized}`
}

export function formatInrPrice(amount: number): string {
  return `${amount.toFixed(2)} INR`
}

function merchantTitle(name: string): string {
  if (name.includes('|')) return name
  return `${name}${MERCHANT_TITLE_SUFFIX}`
}

function merchantSize(product: CatalogProduct): string {
  return (product.specs?.dimensions ?? '').replace(/×/g, 'x').trim()
}

function merchantMaterial(product: CatalogProduct): string {
  const raw = product.specs?.material ?? 'PLA plastic'
  if (/PLA/i.test(raw)) return 'PLA plastic'
  return raw
}

function merchantHighlight(product: CatalogProduct): string {
  const parts = (product.benefits ?? product.keyFeatures ?? []).slice(0, 3)
  if (parts.length > 0) return parts.join('; ')
  return 'Made to order in Agra; packed in a Tathastu Keepsakes gift box'
}

function merchantProductDetail(
  listing: MerchantListing,
  product: CatalogProduct,
): string {
  const customizable = product.customizable ? 'Yes' : 'No'
  const origin = product.specs?.origin ?? 'India'
  const originValue = origin.replace(/^Made in\s+/i, '')
  return [
    `Product:Type:${listing.productType}`,
    `Dimensions:Size:${merchantSize(product) || 'See listing'}`,
    `Material:Type:${merchantMaterial(product)}`,
    `Personalisation:Customizable:${customizable}`,
    `Origin:Made in:${originValue}`,
  ].join(',')
}

function requireCatalogProduct(
  catalogById: Map<string, CatalogProduct>,
  listing: MerchantListing,
): CatalogProduct {
  const product = catalogById.get(listing.productId)
  if (!product) {
    throw new Error(
      `Merchant listing ${listing.offerId} points at missing product ${listing.productId}`,
    )
  }
  if (!product.images[0]) {
    throw new Error(
      `Merchant listing ${listing.offerId} has no images on ${listing.productId}`,
    )
  }
  return product
}

export function toMerchantProduct(
  listing: MerchantListing,
  product: CatalogProduct,
): MerchantProduct {
  const images = product.images.map(toAbsoluteProductUrl)
  const selling = product.price
  const mrp = product.originalPrice && product.originalPrice > selling
    ? product.originalPrice
    : selling

  return {
    id: listing.offerId,
    title: merchantTitle(product.name),
    description: product.description,
    availability: product.isSoldOut ? 'out_of_stock' : 'in_stock',
    link: `${MERCHANT_SITE_ORIGIN}/products/${product.id}`,
    image_link: images[0],
    price: formatInrPrice(mrp),
    sale_price: mrp > selling ? formatInrPrice(selling) : '',
    identifier_exists: 'yes',
    mpn: listing.offerId,
    brand: MERCHANT_BRAND,
    product_highlight: merchantHighlight(product),
    product_detail: merchantProductDetail(listing, product),
    additional_image_link: images.slice(1).join(','),
    condition: 'new',
    adult: 'no',
    color: product.colors?.[0] ?? '',
    size: merchantSize(product),
    gender: 'unisex',
    material: merchantMaterial(product),
    age_group: listing.ageGroup,
    is_bundle: 'no',
  }
}

export function buildMerchantProducts(
  catalog: CatalogProduct[],
  listings: MerchantListing[] = merchantListings,
): MerchantProduct[] {
  const catalogById = new Map(catalog.map((product) => [product.id, product]))
  return listings.map((listing) =>
    toMerchantProduct(listing, requireCatalogProduct(catalogById, listing)),
  )
}
