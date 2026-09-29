/**
 * @jest-environment node
 */

// Mock the products catalogue for isolated testing
jest.mock('@/lib/products.json', () => [
  { id: 'lamps-lamp1', price: 2299 },
  { id: 'lamps-lamp2', price: 2499 },
  { id: 'organizers-organizer1', price: 1899 },
])

import {
  repriceItems,
  applyDiscount,
  shippingForSubtotal,
  amountUntilFreeShipping,
  SHIPPING_FEE,
} from '@/lib/pricing'

describe('repriceItems', () => {
  it('returns server-authoritative price, ignoring client price', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.items[0].serverPrice).toBe(2299)
  })

  it('computes subtotal correctly for multiple items', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp 1', quantity: 2 }, // 2 × 2299 = 4598
      { product_id: 'organizers-organizer1', product_name: 'Organizer', quantity: 1 }, // 1899
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.subtotal).toBe(4598 + 1899) // 6497
  })

  it('applies free shipping when subtotal is above ₹1500', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 }, // 2299
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.shipping).toBe(0)
    expect(result.total).toBe(result.subtotal)
  })

  it('charges shipping at ₹1500 and waives it above ₹1500', () => {
    const atThreshold = repriceItems(
      [{ product_id: 'small-piece', product_name: 'Small', quantity: 1 }],
      [{ id: 'small-piece', price: 1500 }]
    )
    const above = repriceItems(
      [{ product_id: 'small-piece', product_name: 'Small', quantity: 1 }],
      [{ id: 'small-piece', price: 1501 }]
    )

    expect(atThreshold.ok).toBe(true)
    expect(above.ok).toBe(true)
    if (!atThreshold.ok || !above.ok) return
    expect(atThreshold.shipping).toBe(SHIPPING_FEE)
    expect(atThreshold.total).toBe(1500 + SHIPPING_FEE)
    expect(above.shipping).toBe(0)
    expect(above.total).toBe(1501)
    expect(amountUntilFreeShipping(1500)).toBe(1)
    expect(amountUntilFreeShipping(1499)).toBe(2)
    expect(shippingForSubtotal(1501)).toBe(0)
  })

  it('returns error for unknown product_id', () => {
    const result = repriceItems([
      { product_id: 'nonexistent-product', product_name: 'Ghost', quantity: 1 },
    ])

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.unknownId).toBe('nonexistent-product')
  })

  it('returns error if ANY item has an unknown product_id (mixed list)', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 },
      { product_id: 'fake-product', product_name: 'Fake', quantity: 1 },
    ])

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.unknownId).toBe('fake-product')
  })

  it('correctly computes total = subtotal + shipping', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.total).toBe(result.subtotal + result.shipping)
  })

  it('initializes discount=0 and couponCode=null with no coupon', () => {
    const result = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.discount).toBe(0)
    expect(result.couponCode).toBeNull()
  })
})

describe('applyDiscount', () => {
  function base() {
    const r = repriceItems([
      { product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 }, // 2299, free shipping
    ])
    if (!r.ok) throw new Error('setup failed')
    return r
  }

  it('subtracts discount from subtotal, leaves shipping intact', () => {
    const r = applyDiscount(base(), 300, 'SAVE300')
    expect(r.discount).toBe(300)
    expect(r.couponCode).toBe('SAVE300')
    expect(r.total).toBe(2299 - 300 + r.shipping) // shipping 0 here
  })

  it('clamps discount to subtotal (never negative total)', () => {
    const r = applyDiscount(base(), 99999, 'HUGE')
    expect(r.discount).toBe(2299)
    expect(r.total).toBe(r.shipping) // subtotal fully discounted
    expect(r.total).toBeGreaterThanOrEqual(0)
  })

  it('treats a zero discount as no coupon applied', () => {
    const r = applyDiscount(base(), 0, 'NOOP')
    expect(r.discount).toBe(0)
    expect(r.couponCode).toBeNull()
    expect(r.total).toBe(2299 + r.shipping)
  })
})

describe('repriceItems extra catalog overlay', () => {
  it('prices admin-created SKUs from extraProducts', () => {
    const result = repriceItems(
      [{ product_id: 'admin-new-sku', product_name: 'New', quantity: 2 }],
      [{ id: 'admin-new-sku', price: 499 }]
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.items[0].serverPrice).toBe(499)
    expect(result.subtotal).toBe(998)
  })

  it('lets extraProducts overlay a JSON price', () => {
    const result = repriceItems(
      [{ product_id: 'lamps-lamp1', product_name: 'Lamp', quantity: 1 }],
      [{ id: 'lamps-lamp1', price: 1999 }]
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.items[0].serverPrice).toBe(1999)
  })
})
