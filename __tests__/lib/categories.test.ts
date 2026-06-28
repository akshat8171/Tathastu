/**
 * @jest-environment node
 *
 * Tests for lib/categories.ts — taxonomy shape + lookup helpers.
 */

import {
  categories,
  getCategoryBySlug,
  getProductCategories,
  type Category,
} from '@/lib/categories'

describe('categories taxonomy', () => {
  describe('shape', () => {
    it('exports a non-empty array', () => {
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
    })

    it('contains exactly 7 entries (6 product categories + 1 CTA)', () => {
      expect(categories).toHaveLength(7)
    })

    it('every category has required fields', () => {
      const requiredFields: (keyof Category)[] = [
        'slug',
        'name',
        'displayName',
        'description',
        'image',
      ]
      categories.forEach((cat) => {
        requiredFields.forEach((field) => {
          expect(cat[field]).toBeTruthy()
        })
      })
    })

    it('every slug is a non-empty string with no whitespace', () => {
      categories.forEach((cat) => {
        expect(typeof cat.slug).toBe('string')
        expect(cat.slug.trim().length).toBeGreaterThan(0)
        expect(/\s/.test(cat.slug)).toBe(false)
      })
    })

    it('every image path starts with /', () => {
      categories.forEach((cat) => {
        expect(cat.image.startsWith('/')).toBe(true)
      })
    })

    it('contains the three product-backed slugs: lamps, organizers, planters', () => {
      const slugs = categories.map((c) => c.slug)
      expect(slugs).toContain('lamps')
      expect(slugs).toContain('organizers')
      expect(slugs).toContain('planters')
    })

    it('contains the customise CTA slug', () => {
      const slugs = categories.map((c) => c.slug)
      expect(slugs).toContain('customise')
    })

    it('customise category has isCta: true', () => {
      const customise = categories.find((c) => c.slug === 'customise')
      expect(customise?.isCta).toBe(true)
    })

    it('product categories do NOT have isCta: true', () => {
      const productCats = categories.filter((c) => c.slug !== 'customise')
      productCats.forEach((cat) => {
        expect(cat.isCta).not.toBe(true)
      })
    })
  })

  describe('getCategoryBySlug()', () => {
    it('returns the correct category for "lamps"', () => {
      const cat = getCategoryBySlug('lamps')
      expect(cat).toBeDefined()
      expect(cat?.slug).toBe('lamps')
      expect(cat?.displayName).toBe('Lamps & Lighting')
    })

    it('returns the correct category for "organizers"', () => {
      const cat = getCategoryBySlug('organizers')
      expect(cat).toBeDefined()
      expect(cat?.slug).toBe('organizers')
      expect(cat?.displayName).toBe('Desk & Workspace')
    })

    it('returns the correct category for "planters"', () => {
      const cat = getCategoryBySlug('planters')
      expect(cat).toBeDefined()
      expect(cat?.slug).toBe('planters')
      expect(cat?.displayName).toBe('Planters & Garden')
    })

    it('returns the correct category for "customise"', () => {
      const cat = getCategoryBySlug('customise')
      expect(cat).toBeDefined()
      expect(cat?.slug).toBe('customise')
      expect(cat?.isCta).toBe(true)
    })

    it('returns undefined for an unknown slug', () => {
      expect(getCategoryBySlug('unknown-slug')).toBeUndefined()
    })

    it('returns undefined for an empty string', () => {
      expect(getCategoryBySlug('')).toBeUndefined()
    })

    it('is case-sensitive — "Lamps" returns undefined', () => {
      expect(getCategoryBySlug('Lamps')).toBeUndefined()
    })
  })

  describe('getProductCategories()', () => {
    it('returns only the 6 product-backed categories (no CTA)', () => {
      const productCats = getProductCategories()
      expect(productCats).toHaveLength(6)
    })

    it('does NOT include the customise CTA category', () => {
      const productCats = getProductCategories()
      const customise = productCats.find((c) => c.slug === 'customise')
      expect(customise).toBeUndefined()
    })

    it('includes lamps, organizers, and planters', () => {
      const productCats = getProductCategories()
      const slugs = productCats.map((c) => c.slug)
      expect(slugs).toContain('lamps')
      expect(slugs).toContain('organizers')
      expect(slugs).toContain('planters')
    })

    it('returns categories that all have isCta !== true', () => {
      const productCats = getProductCategories()
      productCats.forEach((cat) => {
        expect(cat.isCta).not.toBe(true)
      })
    })
  })
})
