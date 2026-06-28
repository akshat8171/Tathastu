/**
 * Server-side authoritative pricing helper.
 *
 * Prices are sourced exclusively from lib/products.json (the same file the
 * product pages use). Client-supplied prices are NEVER trusted.
 */

import productsData from '@/lib/products.json'

// ── Shipping constants (FROZEN CONTRACT §2) ──────────────────────────────────
/** Orders with subtotal ABOVE this threshold qualify for free shipping. */
export const FREE_SHIPPING_THRESHOLD = 199 // was 999 — reference parity

/** Flat shipping fee in rupees when subtotal does not qualify for free shipping. */
export const SHIPPING_FEE = 99

interface ProductRecord {
  id: string
  price: number
  [key: string]: unknown
}

// Build a lookup map once at module load (server-side singleton).
const productMap = new Map<string, ProductRecord>(
  (productsData as ProductRecord[]).map(p => [p.id, p])
)

export interface PricedItem {
  product_id: string
  product_name: string
  product_image?: string
  product_variant?: string
  quantity: number
  /** Authoritative unit price in rupees (from products.json) */
  serverPrice: number
}

export interface RepriceResult {
  ok: true
  items: PricedItem[]
  subtotal: number
  shipping: number
  total: number
  /** Coupon discount in rupees applied to this order (0 when none). */
  discount: number
  /** Normalized coupon code when one was applied, else null. */
  couponCode: string | null
}

export interface RepriceError {
  ok: false
  unknownId: string
}

/**
 * Looks up each item's price from products.json and recomputes order totals.
 *
 * Returns { ok: false, unknownId } if any product_id is not found.
 * Shipping rule: FREE when subtotal > FREE_SHIPPING_THRESHOLD, else SHIPPING_FEE.
 */
export function repriceItems(
  items: Array<{
    product_id: string
    product_name: string
    product_image?: string
    product_variant?: string
    quantity: number
  }>
): RepriceResult | RepriceError {
  const pricedItems: PricedItem[] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product) {
      return { ok: false, unknownId: item.product_id }
    }
    pricedItems.push({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      product_variant: item.product_variant,
      quantity: item.quantity,
      serverPrice: product.price,
    })
  }

  const subtotal = pricedItems.reduce((sum, i) => sum + i.serverPrice * i.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  return { ok: true, items: pricedItems, subtotal, shipping, total, discount: 0, couponCode: null }
}

/**
 * Apply a server-validated coupon discount to a RepriceResult.
 *
 * Kept separate from repriceItems() so the synchronous, DB-free repricing path
 * (and its tests) stay untouched. The caller validates the coupon server-side
 * (lib/coupons.validateCoupon) against `result.subtotal`, then passes the
 * resulting discount here.
 *
 * Discount applies to the subtotal; total = subtotal - discount + shipping,
 * floored at 0. Shipping is NOT discounted.
 */
export function applyDiscount(
  result: RepriceResult,
  discount: number,
  couponCode: string | null
): RepriceResult {
  const safeDiscount = Math.min(Math.max(0, Math.round(discount || 0)), result.subtotal)
  const total = Math.max(0, result.subtotal - safeDiscount + result.shipping)
  return {
    ...result,
    discount: safeDiscount,
    couponCode: safeDiscount > 0 ? couponCode : null,
    total,
  }
}
