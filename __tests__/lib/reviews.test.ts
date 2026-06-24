/**
 * @jest-environment node
 *
 * Tests for lib/reviews.ts — getReviewsForProduct, featuredReviews,
 * and getAverageRating.
 */

import {
  getReviewsForProduct,
  featuredReviews,
  getAverageRating,
  type Review,
} from '@/lib/reviews'

describe('getReviewsForProduct()', () => {
  it('returns reviews for a known product', () => {
    const reviews = getReviewsForProduct('lamps-lamp1')
    expect(reviews.length).toBeGreaterThan(0)
  })

  it('returns only reviews for the requested productId', () => {
    const reviews = getReviewsForProduct('lamps-lamp1')
    reviews.forEach((r) => {
      expect(r.productId).toBe('lamps-lamp1')
    })
  })

  it('returns empty array for an unknown productId', () => {
    const reviews = getReviewsForProduct('nonexistent-product')
    expect(reviews).toHaveLength(0)
  })

  it('defaults to a maximum of 5 reviews', () => {
    // lamps-lamp1 has 3 reviews in the sample data — shouldn't exceed 5
    const reviews = getReviewsForProduct('lamps-lamp1')
    expect(reviews.length).toBeLessThanOrEqual(5)
  })

  it('respects an explicit lower limit', () => {
    const reviews = getReviewsForProduct('lamps-lamp1', 1)
    expect(reviews).toHaveLength(1)
  })

  it('respects limit=2', () => {
    const reviews = getReviewsForProduct('lamps-lamp1', 2)
    expect(reviews.length).toBeLessThanOrEqual(2)
  })

  it('returns all reviews when limit is Infinity', () => {
    const limited = getReviewsForProduct('lamps-lamp1', 5)
    const unlimited = getReviewsForProduct('lamps-lamp1', Infinity)
    expect(unlimited.length).toBeGreaterThanOrEqual(limited.length)
  })

  it('every returned review has required fields', () => {
    const reviews = getReviewsForProduct('lamps-lamp1')
    reviews.forEach((r: Review) => {
      expect(typeof r.id).toBe('string')
      expect(r.id.length).toBeGreaterThan(0)
      expect(typeof r.productId).toBe('string')
      expect(typeof r.author).toBe('string')
      expect(typeof r.rating).toBe('number')
      expect(typeof r.title).toBe('string')
      expect(typeof r.body).toBe('string')
      expect(typeof r.date).toBe('string')
      expect(typeof r.verified).toBe('boolean')
    })
  })

  it('all ratings are between 1 and 5 inclusive', () => {
    const reviews = getReviewsForProduct('lamps-lamp1', Infinity)
    reviews.forEach((r) => {
      expect(r.rating).toBeGreaterThanOrEqual(1)
      expect(r.rating).toBeLessThanOrEqual(5)
    })
  })
})

describe('featuredReviews', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(featuredReviews)).toBe(true)
    expect(featuredReviews.length).toBeGreaterThan(0)
  })

  it('contains exactly 6 featured reviews', () => {
    expect(featuredReviews).toHaveLength(6)
  })

  it('every featured review has a valid rating between 1 and 5', () => {
    featuredReviews.forEach((r) => {
      expect(r.rating).toBeGreaterThanOrEqual(1)
      expect(r.rating).toBeLessThanOrEqual(5)
    })
  })

  it('every featured review has required fields', () => {
    featuredReviews.forEach((r: Review) => {
      expect(typeof r.id).toBe('string')
      expect(r.id.length).toBeGreaterThan(0)
      expect(typeof r.author).toBe('string')
      expect(typeof r.body).toBe('string')
      expect(typeof r.productId).toBe('string')
    })
  })

  it('features reviews from multiple products (not all the same)', () => {
    const productIds = new Set(featuredReviews.map((r) => r.productId))
    expect(productIds.size).toBeGreaterThan(1)
  })

  it('all featured review ids are unique', () => {
    const ids = featuredReviews.map((r) => r.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('getAverageRating()', () => {
  it('returns 0 for a product with no reviews', () => {
    expect(getAverageRating('nonexistent-product')).toBe(0)
  })

  it('returns the correct average for lamps-lamp1 (three reviews: 5, 4, 5 → 4.7)', () => {
    // Reviews: 5 + 4 + 5 = 14, avg = 14/3 ≈ 4.666... → rounds to 4.7
    const avg = getAverageRating('lamps-lamp1')
    expect(avg).toBeCloseTo(4.7, 1)
  })

  it('returns a number between 1 and 5 for products with reviews', () => {
    const avg = getAverageRating('lamps-lamp2')
    expect(avg).toBeGreaterThanOrEqual(1)
    expect(avg).toBeLessThanOrEqual(5)
  })

  it('returns a number rounded to one decimal place', () => {
    const avg = getAverageRating('lamps-lamp1')
    // Verify it's rounded to 1 decimal: (Math.round(x * 10) / 10)
    expect(avg).toBe(Math.round(avg * 10) / 10)
  })
})
