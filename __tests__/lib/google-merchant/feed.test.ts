import {
  buildGoogleMerchantTsv,
  buildGoogleMerchantXml,
  escapeXml,
  merchantProducts,
} from '@/lib/google-merchant/feed'

describe('Google Merchant Center feed', () => {
  it('covers the 27 photoshoot SKUs', () => {
    expect(merchantProducts).toHaveLength(27)
    expect(merchantProducts[0].id).toBe('TK-P01-FS-GRN')
    expect(merchantProducts[26].id).toBe('TK-P27-FS-MLT')
  })

  it('escapes XML special characters', () => {
    expect(escapeXml("Myra's Room & kids <3")).toBe(
      'Myra&apos;s Room &amp; kids &lt;3',
    )
  })

  it('builds well-formed RSS with one item per SKU', () => {
    const xml = buildGoogleMerchantXml()
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)

    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    expect(doc.querySelector('parsererror')).toBeNull()

    const items = [...doc.querySelectorAll('item')]
    expect(items).toHaveLength(27)

    const first = items[0]
    expect(first.getElementsByTagName('g:id')[0]?.textContent).toBe(
      'TK-P01-FS-GRN',
    )
    expect(first.getElementsByTagName('g:image_link')[0]?.textContent).toContain(
      '/01-hero.png',
    )
    expect(first.getElementsByTagName('g:additional_image_link')).toHaveLength(7)
    expect(first.getElementsByTagName('g:link')[0]?.textContent).toBe(
      'https://www.tathastukeepsakes.in/products/home-decor-alphabet-name',
    )
  })

  it('builds a tab-delimited file Google can ingest as TXT', () => {
    const tsv = buildGoogleMerchantTsv()
    const lines = tsv.trimEnd().split('\n')
    expect(lines[0]).toContain('id\ttitle\tdescription')
    expect(lines[0]).toContain('is_bundle')
    expect(lines).toHaveLength(28)
    expect(lines[1].startsWith('TK-P01-FS-GRN\t')).toBe(true)
    expect(lines.some((line) => line.includes('.xls'))).toBe(false)
  })
})
