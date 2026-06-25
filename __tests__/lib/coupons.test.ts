/**
 * @jest-environment node
 */
import { computeCouponDiscount, normalizeCouponCode, type CouponRow } from '@/lib/coupons'

// A baseline valid percentage coupon; tests override fields as needed.
function coupon(overrides: Partial<CouponRow> = {}): CouponRow {
  return {
    code: 'SAVE10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    usage_count: 0,
    valid_from: null,
    valid_until: null,
    is_active: true,
    ...overrides,
  }
}

const NOW = '2026-06-25T00:00:00.000Z'

describe('normalizeCouponCode', () => {
  it('trims and uppercases', () => {
    expect(normalizeCouponCode('  save10 ')).toBe('SAVE10')
  })
  it('handles null/undefined', () => {
    expect(normalizeCouponCode(undefined as unknown as string)).toBe('')
  })
})

describe('computeCouponDiscount', () => {
  it('applies a percentage discount on subtotal', () => {
    const r = computeCouponDiscount(coupon({ discount_value: 10 }), 2000, NOW)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(200) // 10% of 2000
  })

  it('applies a fixed discount', () => {
    const r = computeCouponDiscount(
      coupon({ discount_type: 'fixed', discount_value: 150 }),
      2000,
      NOW
    )
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(150)
  })

  it('clamps a percentage discount to max_discount_amount', () => {
    const r = computeCouponDiscount(
      coupon({ discount_value: 50, max_discount_amount: 300 }),
      2000,
      NOW
    )
    // 50% of 2000 = 1000, but capped at 300
    expect(r.discount).toBe(300)
  })

  it('never discounts more than the subtotal', () => {
    const r = computeCouponDiscount(
      coupon({ discount_type: 'fixed', discount_value: 5000 }),
      2000,
      NOW
    )
    expect(r.discount).toBe(2000)
  })

  it('rejects when below min_order_amount', () => {
    const r = computeCouponDiscount(coupon({ min_order_amount: 3000 }), 2000, NOW)
    expect(r.valid).toBe(false)
    expect(r.discount).toBe(0)
    expect(r.message).toMatch(/more to use/i)
  })

  it('rejects an inactive coupon', () => {
    const r = computeCouponDiscount(coupon({ is_active: false }), 2000, NOW)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/no longer active/i)
  })

  it('rejects an expired coupon', () => {
    const r = computeCouponDiscount(
      coupon({ valid_until: '2026-01-01T00:00:00.000Z' }),
      2000,
      NOW
    )
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/expired/i)
  })

  it('rejects a not-yet-active coupon', () => {
    const r = computeCouponDiscount(
      coupon({ valid_from: '2026-12-01T00:00:00.000Z' }),
      2000,
      NOW
    )
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/not active yet/i)
  })

  it('rejects when usage limit is reached', () => {
    const r = computeCouponDiscount(
      coupon({ usage_limit: 100, usage_count: 100 }),
      2000,
      NOW
    )
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/usage limit/i)
  })

  it('rounds the discount to whole rupees', () => {
    // 33% of 1000 = 330 exactly; use a value that produces a fraction
    const r = computeCouponDiscount(coupon({ discount_value: 7 }), 999, NOW)
    // 7% of 999 = 69.93 → 70
    expect(r.discount).toBe(70)
  })
})
