/**
 * Server-side authoritative pricing helper.
 *
 * Prices are sourced from lib/products.json plus published admin catalog SKUs.
 * Client-supplied prices are NEVER trusted.
 */

import productsData from '@/lib/products.json'

// ── Shipping constants ───────────────────────────────────────────────────────
/** Free delivery applies only when the merchandise subtotal is above this amount. */
export const FREE_SHIPPING_THRESHOLD = 1500

/** Flat shipping fee in rupees when the subtotal does not qualify for free delivery. */
export const SHIPPING_FEE = 99

/** True when the merchandise subtotal qualifies for free delivery. */
export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal > FREE_SHIPPING_THRESHOLD
}

/** Shipping charge for a merchandise subtotal. Discount does not change this. */
export function shippingForSubtotal(subtotal: number): number {
  return qualifiesForFreeShipping(subtotal) ? 0 : SHIPPING_FEE
}

/**
 * Rupees still needed before delivery is free.
 * The rule is strict: ₹1500 still pays shipping; ₹1501 does not.
 */
export function amountUntilFreeShipping(subtotal: number): number {
  if (qualifiesForFreeShipping(subtotal)) return 0
  return FREE_SHIPPING_THRESHOLD - subtotal + 1
}

/** Progress toward free delivery, complete only once the order is above the threshold. */
export function freeShippingProgressPercent(subtotal: number): number {
  if (subtotal <= 0) return 0
  const goal = FREE_SHIPPING_THRESHOLD + 1
  return Math.min(100, Math.round((subtotal / goal) * 100))
}

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
 * Looks up each item's price from products.json (plus optional live catalog
 * rows from admin) and recomputes order totals.
 *
 * Returns { ok: false, unknownId } if any product_id is not found.
 * Shipping rule: FREE when subtotal is above FREE_SHIPPING_THRESHOLD, else SHIPPING_FEE.
 *
 * `extraProducts` overlays/extends the JSON map so admin-created SKUs can
 * check out. JSON-only tests keep calling this with one argument.
 */
export function repriceItems(
  items: Array<{
    product_id: string
    product_name: string
    product_image?: string
    product_variant?: string
    quantity: number
  }>,
  extraProducts?: Array<{ id: string; price: number }>
): RepriceResult | RepriceError {
  const lookup = new Map(productMap)
  extraProducts?.forEach((product) => lookup.set(product.id, product))

  const pricedItems: PricedItem[] = []

  for (const item of items) {
    const product = lookup.get(item.product_id)
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
  const shipping = shippingForSubtotal(subtotal)
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
