/**
 * @jest-environment node
 */

import { slugifyCatalogId, isValidCatalogId } from '@/lib/catalog/slug'
import { mergeCatalog, listCatalogForAdmin } from '@/lib/catalog/merge'
import { mergeHomepageSettings } from '@/lib/catalog/homepage'
import { normalizeCatalogPayload } from '@/lib/catalog/validate'
import { DEFAULT_HOMEPAGE_SETTINGS } from '@/lib/catalog/homepage-defaults'
import type { CatalogProduct } from '@/lib/catalog/types'

const seed: CatalogProduct[] = [
  {
    id: 'keyrings-name',
    name: 'Name Keychain',
    description: 'A personalised name keychain.',
    price: 299,
    images: ['/images/products/keyrings/name.jpg'],
    category: 'keyrings',
    rating: 4.9,
    reviewCount: 12,
  },
]

describe('slugifyCatalogId', () => {
  it('builds a lowercase hyphenated id', () => {
    expect(slugifyCatalogId('Pooja Decor', 'Golden Ganesha!')).toBe('pooja-decor-golden-ganesha')
  })

  it('rejects invalid ids', () => {
    expect(isValidCatalogId('ab')).toBe(false)
    expect(isValidCatalogId('Valid-sku-1')).toBe(false)
    expect(isValidCatalogId('valid-sku-1')).toBe(true)
  })
})

describe('mergeCatalog', () => {
  it('keeps JSON products when there are no admin rows', () => {
    expect(mergeCatalog(seed, [])).toHaveLength(1)
  })

  it('overlays the same id and can hide a seed SKU', () => {
    const live = mergeCatalog(seed, [
      { id: 'keyrings-name', payload: { ...seed[0], price: 349 }, published: true },
    ])
    expect(live[0].price).toBe(349)

    const hidden = mergeCatalog(seed, [
      { id: 'keyrings-name', payload: seed[0], published: false },
    ])
    expect(hidden).toHaveLength(0)
  })

  it('adds a published admin-only SKU', () => {
    const added: CatalogProduct = {
      ...seed[0],
      id: 'gaming-custom-dragon',
      name: 'Dragon',
      category: 'gaming',
    }
    const live = mergeCatalog(seed, [{ id: added.id, payload: added, published: true }])
    expect(live.map((p) => p.id).sort()).toEqual(['gaming-custom-dragon', 'keyrings-name'])
  })
})

describe('listCatalogForAdmin', () => {
  it('marks overlays as admin source', () => {
    const items = listCatalogForAdmin(seed, [
      { id: 'keyrings-name', payload: { ...seed[0], price: 1 }, published: false },
    ])
    expect(items[0].source).toBe('admin')
    expect(items[0].published).toBe(false)
  })
})

describe('normalizeCatalogPayload', () => {
  it('accepts a complete SKU', () => {
    const result = normalizeCatalogPayload({
      id: 'lamps-moon-glow',
      name: 'Moon Glow Lamp',
      description: 'A soft lunar lamp for bedside tables.',
      price: 1499,
      originalPrice: 1799,
      images: ['https://example.com/lamp.jpg'],
      category: 'lamps',
      rating: 5,
      reviewCount: 0,
    })
    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.price).toBe(1499)
  })

  it('rejects a missing photo', () => {
    const result = normalizeCatalogPayload({
      id: 'lamps-moon-glow',
      name: 'Moon Glow Lamp',
      description: 'A soft lunar lamp for bedside tables.',
      price: 1499,
      images: [],
      category: 'lamps',
      rating: 5,
      reviewCount: 0,
    })
    expect('error' in result).toBe(true)
  })
})

describe('mergeHomepageSettings', () => {
  it('falls back to defaults', () => {
    expect(mergeHomepageSettings(null).heroSlides).toHaveLength(
      DEFAULT_HOMEPAGE_SETTINGS.heroSlides.length
    )
  })

  it('keeps an admin-disabled section off', () => {
    const merged = mergeHomepageSettings({
      sections: { instagram: false },
    })
    expect(merged.sections.instagram).toBe(false)
    expect(merged.sections.hero).toBe(true)
  })
})
