export interface MerchantProduct {
  id: string
  title: string
  description: string
  availability: string
  link: string
  image_link: string
  price: string
  sale_price: string
  identifier_exists: string
  mpn: string
  brand: string
  product_highlight: string
  product_detail: string
  additional_image_link: string
  condition: string
  adult: string
  color: string
  size: string
  gender: string
  material: string
  age_group: string
  is_bundle: string
}

export const GOOGLE_MERCHANT_FEED_TITLE = 'Tathastu Keepsakes'
export const GOOGLE_MERCHANT_FEED_LINK = 'https://www.tathastukeepsakes.in'
export const GOOGLE_MERCHANT_FEED_DESCRIPTION =
  '3D printed home decor and organisers from Tathastu Keepsakes'

const TSV_COLUMNS: Array<keyof MerchantProduct> = [
  'id',
  'title',
  'description',
  'availability',
  'link',
  'image_link',
  'price',
  'sale_price',
  'identifier_exists',
  'mpn',
  'brand',
  'product_highlight',
  'product_detail',
  'additional_image_link',
  'condition',
  'adult',
  'color',
  'size',
  'gender',
  'material',
  'age_group',
  'is_bundle',
]

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function xmlField(name: string, value: string): string {
  if (!value) return ''
  return `      <g:${name}>${escapeXml(value)}</g:${name}>\n`
}

function parseProductDetails(raw: string): Array<{
  sectionName: string
  attributeName: string
  attributeValue: string
}> {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sectionName = '', attributeName = '', attributeValue = ''] =
        entry.split(':', 3)
      return {
        sectionName: sectionName.trim(),
        attributeName: attributeName.trim(),
        attributeValue: attributeValue.trim(),
      }
    })
    .filter(
      (detail) =>
        detail.sectionName && detail.attributeName && detail.attributeValue,
    )
}

function xmlProductDetails(raw: string): string {
  return parseProductDetails(raw)
    .map(
      (detail) =>
        `      <g:product_detail>\n` +
        `        <g:section_name>${escapeXml(detail.sectionName)}</g:section_name>\n` +
        `        <g:attribute_name>${escapeXml(detail.attributeName)}</g:attribute_name>\n` +
        `        <g:attribute_value>${escapeXml(detail.attributeValue)}</g:attribute_value>\n` +
        `      </g:product_detail>\n`,
    )
    .join('')
}

function xmlAdditionalImages(raw: string): string {
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => xmlField('additional_image_link', url))
    .join('')
}

function xmlItem(product: MerchantProduct): string {
  return (
    '    <item>\n' +
    xmlField('id', product.id) +
    xmlField('title', product.title) +
    xmlField('description', product.description) +
    xmlField('link', product.link) +
    xmlField('image_link', product.image_link) +
    xmlAdditionalImages(product.additional_image_link) +
    xmlField('availability', product.availability) +
    xmlField('price', product.price) +
    xmlField('sale_price', product.sale_price) +
    xmlField('identifier_exists', product.identifier_exists) +
    xmlField('mpn', product.mpn) +
    xmlField('brand', product.brand) +
    xmlField('condition', product.condition) +
    xmlField('adult', product.adult) +
    xmlField('color', product.color) +
    xmlField('size', product.size) +
    xmlField('gender', product.gender) +
    xmlField('material', product.material) +
    xmlField('age_group', product.age_group) +
    xmlField('is_bundle', product.is_bundle) +
    xmlField('product_highlight', product.product_highlight) +
    xmlProductDetails(product.product_detail) +
    '    </item>\n'
  )
}

export function buildGoogleMerchantXml(products: MerchantProduct[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(GOOGLE_MERCHANT_FEED_TITLE)}</title>\n` +
    `    <link>${escapeXml(GOOGLE_MERCHANT_FEED_LINK)}</link>\n` +
    `    <description>${escapeXml(GOOGLE_MERCHANT_FEED_DESCRIPTION)}</description>\n` +
    products.map(xmlItem).join('') +
    `  </channel>\n` +
    `</rss>\n`
  )
}

function tsvCell(value: string): string {
  if (/[\t\n\r"]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildGoogleMerchantTsv(products: MerchantProduct[]): string {
  const header = TSV_COLUMNS.join('\t')
  const lines = products.map((product) =>
    TSV_COLUMNS.map((column) => tsvCell(product[column] ?? '')).join('\t'),
  )
  return `${header}\n${lines.join('\n')}\n`
}
