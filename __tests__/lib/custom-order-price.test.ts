/**
 * @jest-environment node
 */

import {
  isCustomQuoteOrder,
  parseConfirmedUnitPrice,
  totalsForConfirmedUnitPrice,
} from '@/lib/admin/custom-order-price'
import { SHIPPING_FEE } from '@/lib/pricing'

describe('custom order confirmation price', () => {
  it('recognises a quote order and a custom line name', () => {
    expect(isCustomQuoteOrder('quote_id=11111111-1111-1111-1111-111111111111')).toBe(true)
    expect(isCustomQuoteOrder(null, ['Custom keychain'])).toBe(true)
    expect(isCustomQuoteOrder(null, ['Lunar Night Lamp'])).toBe(false)
  })

  it('accepts a whole-rupee price and rejects empty or zero', () => {
    expect(parseConfirmedUnitPrice('1800')).toBe(1800)
    expect(parseConfirmedUnitPrice(1499.4)).toBe(1499)
    expect(parseConfirmedUnitPrice('')).toBeNull()
    expect(parseConfirmedUnitPrice(0)).toBeNull()
    expect(parseConfirmedUnitPrice(-10)).toBeNull()
  })

  it('adds shipping at ₹1500 and drops it above ₹1500', () => {
    expect(totalsForConfirmedUnitPrice({
      unitPrice: 1500,
      quantity: 1,
      discount: 0,
      tax: 0,
    })).toEqual({
      subtotal: 1500,
      shipping: SHIPPING_FEE,
      discount: 0,
      total: 1500 + SHIPPING_FEE,
    })

    expect(totalsForConfirmedUnitPrice({
      unitPrice: 1600,
      quantity: 1,
      discount: 100,
      tax: 0,
    })).toEqual({
      subtotal: 1600,
      shipping: 0,
      discount: 100,
      total: 1500,
    })
  })
})
