/**
 * @jest-environment node
 *
 * Data integrity contract for lib/products.json.
 * These tests guard the shape of all 24 products so that components,
 * the pricing helper, and the cart can rely on it.
 */

import products from '@/lib/products.json'
import { categories } from '@/lib/categories'

// Build the set of valid category slugs from the canonical taxonomy
const validCategorySlugs = new Set(categories.map((c) => c.slug))

// The required fields on every product
interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  [key: string]: unknown
}

const catalog = products as Product[]

describe('lib/products.json — data integrity', () => {
  it('catalog is non-empty', () => {
    expect(catalog.length).toBeGreaterThan(0)
  })

  it('contains exactly 54 products', () => {
    expect(catalog).toHaveLength(54)
  })

  describe('every product has required fields', () => {
    catalog.forEach((product) => {
      describe(`product "${product.id}"`, () => {
        it('has a non-empty string id', () => {
          expect(typeof product.id).toBe('string')
          expect(product.id.trim().length).toBeGreaterThan(0)
        })

        it('has a non-empty string name', () => {
          expect(typeof product.name).toBe('string')
          expect(product.name.trim().length).toBeGreaterThan(0)
        })

        it('has a numeric price > 0', () => {
          expect(typeof product.price).toBe('number')
          expect(product.price).toBeGreaterThan(0)
        })

        it('has a non-empty images array', () => {
          expect(Array.isArray(product.images)).toBe(true)
          expect(product.images.length).toBeGreaterThan(0)
        })

        it('has a valid category slug', () => {
          expect(validCategorySlugs.has(product.category)).toBe(true)
        })

        it('has a numeric rating between 1 and 5', () => {
          expect(typeof product.rating).toBe('number')
          expect(product.rating).toBeGreaterThanOrEqual(1)
          expect(product.rating).toBeLessThanOrEqual(5)
        })

        it('has a non-negative integer reviewCount', () => {
          expect(typeof product.reviewCount).toBe('number')
          expect(product.reviewCount).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })

  describe('all product ids are unique', () => {
    it('has no duplicate ids', () => {
      const ids = catalog.map((p) => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('every category value is a valid slug', () => {
    it('all categories match taxonomy slugs', () => {
      const invalidCategories = catalog.filter(
        (p) => !validCategorySlugs.has(p.category)
      )
      expect(invalidCategories).toHaveLength(0)
    })
  })

  describe('originalPrice integrity', () => {
    it('originalPrice is always greater than price when present', () => {
      const violations = catalog.filter(
        (p) =>
          p.originalPrice !== undefined &&
          p.originalPrice !== null &&
          typeof p.originalPrice === 'number' &&
          (p.originalPrice as number) <= p.price
      )
      expect(violations).toHaveLength(0)
    })

    it('every product in this catalog has an originalPrice (all on sale)', () => {
      // Per TEAM_LOG: "All 24 products have originalPrice > price (enables % off badges)"
      const missing = catalog.filter(
        (p) => p.originalPrice === undefined || p.originalPrice === null
      )
      expect(missing).toHaveLength(0)
    })
  })

  describe('per-category counts', () => {
    it('has 8 lamps', () => {
      expect(catalog.filter((p) => p.category === 'lamps')).toHaveLength(8)
    })

    it('has 8 organizers', () => {
      expect(catalog.filter((p) => p.category === 'organizers')).toHaveLength(8)
    })

    it('has 8 planters', () => {
      expect(catalog.filter((p) => p.category === 'planters')).toHaveLength(8)
    })

    it('has 9 pooja-decor', () => {
      expect(catalog.filter((p) => p.category === 'pooja-decor')).toHaveLength(9)
    })

    it('has 14 keyrings', () => {
      expect(catalog.filter((p) => p.category === 'keyrings')).toHaveLength(14)
    })

    it('has 7 gaming', () => {
      expect(catalog.filter((p) => p.category === 'gaming')).toHaveLength(7)
    })
  })

  describe('image arrays', () => {
    it('every image path is a non-empty string', () => {
      const violations: string[] = []
      catalog.forEach((p) => {
        p.images.forEach((img) => {
          if (typeof img !== 'string' || img.trim().length === 0) {
            violations.push(`${p.id}: empty/invalid image path`)
          }
        })
      })
      expect(violations).toHaveLength(0)
    })

    it('every image path starts with /', () => {
      const violations: string[] = []
      catalog.forEach((p) => {
        p.images.forEach((img) => {
          if (!img.startsWith('/')) {
            violations.push(`${p.id}: "${img}" does not start with /`)
          }
        })
      })
      expect(violations).toHaveLength(0)
    })
  })
})
