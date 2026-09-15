import catalog from '@/lib/products.json'
import {
  buildGoogleMerchantTsv,
  buildGoogleMerchantXml,
  escapeXml,
} from '@/lib/google-merchant/feed'
import {
  buildMerchantProducts,
  merchantListings,
} from '@/lib/google-merchant/from-catalog'
import type { CatalogProduct } from '@/lib/catalog/types'

const catalogProducts = catalog as CatalogProduct[]

describe('Google Merchant Center feed', () => {
  it('enrolls 27 photoshoot SKUs that exist on the catalog', () => {
    expect(merchantListings).toHaveLength(27)
    expect(merchantListings[0].offerId).toBe('TK-P01-FS-GRN')
    expect(merchantListings[26].offerId).toBe('TK-P27-FS-MLT')
  })

  it('escapes XML special characters', () => {
    expect(escapeXml("Myra's Room & kids <3")).toBe(
      'Myra&apos;s Room &amp; kids &lt;3',
    )
  })

  it('mirrors live catalog prices, PDP links, and images', () => {
    const products = buildMerchantProducts(catalogProducts)
    const alphabet = catalogProducts.find(
      (product) => product.id === 'home-decor-alphabet-name',
    )
    expect(alphabet).toBeDefined()
    expect(products[0].id).toBe('TK-P01-FS-GRN')
    expect(products[0].sale_price).toBe(`${alphabet!.price.toFixed(2)} INR`)
    expect(products[0].price).toBe(
      `${alphabet!.originalPrice!.toFixed(2)} INR`,
    )
    expect(products[0].link).toBe(
      'https://www.tathastukeepsakes.in/products/home-decor-alphabet-name',
    )
    expect(products[0].image_link).toContain(alphabet!.images[0])
  })

  it('marks sold-out catalog items out of stock in the feed', () => {
    const soldOut = catalogProducts.map((product) =>
      product.id === 'home-decor-alphabet-name'
        ? { ...product, isSoldOut: true }
        : product,
    )
    const [first] = buildMerchantProducts(soldOut)
    expect(first.availability).toBe('out_of_stock')
  })

  it('fails loud when an enrolled product is missing from the catalog', () => {
    expect(() => buildMerchantProducts([])).toThrow(
      /TK-P01-FS-GRN.*home-decor-alphabet-name/,
    )
  })

  it('builds well-formed RSS with one item per enrolled SKU', () => {
    const xml = buildGoogleMerchantXml(buildMerchantProducts(catalogProducts))
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)

    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    expect(doc.querySelector('parsererror')).toBeNull()

    const items = [...doc.querySelectorAll('item')]
    expect(items).toHaveLength(27)
    expect(items[0].getElementsByTagName('g:id')[0]?.textContent).toBe(
      'TK-P01-FS-GRN',
    )
    expect(
      items[0].getElementsByTagName('g:additional_image_link'),
    ).toHaveLength(7)
  })

  it('builds a tab-delimited file Google can ingest as TXT', () => {
    const tsv = buildGoogleMerchantTsv(buildMerchantProducts(catalogProducts))
    const lines = tsv.trimEnd().split('\n')
    expect(lines[0]).toContain('id\ttitle\tdescription')
    expect(lines[0]).toContain('is_bundle')
    expect(lines).toHaveLength(28)
    expect(lines[1].startsWith('TK-P01-FS-GRN\t')).toBe(true)
    expect(lines.some((line) => line.includes('.xls'))).toBe(false)
  })
})
