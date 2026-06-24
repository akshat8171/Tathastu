/**
 * Server-side authoritative pricing helper.
 *
 * Prices are sourced exclusively from lib/products.json (the same file the
 * product pages use). Client-supplied prices are NEVER trusted.
 */

import productsData from '@/lib/products.json'

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
}

export interface RepriceError {
  ok: false
  unknownId: string
}

/**
 * Looks up each item's price from products.json and recomputes order totals.
 *
 * Returns { ok: false, unknownId } if any product_id is not found.
 * Shipping rule: FREE when subtotal > 999, else ₹99 (matches checkout-form).
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
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + shipping

  return { ok: true, items: pricedItems, subtotal, shipping, total }
}
