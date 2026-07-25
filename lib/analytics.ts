import { track } from '@vercel/analytics'

type Scalar = string | number | boolean | null
const clip = (s: string) => (s.length > 255 ? s.slice(0, 255) : s)

function emit(name: string, props: Record<string, Scalar | undefined>) {
  try {
    const clean: Record<string, Scalar> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined) continue
      clean[k] = typeof v === 'string' ? clip(v) : v
    }
    track(name, clean) // no-ops in dev / off-Vercel
  } catch {
    /* analytics must never break commerce */
  }
}

export const trackViewProduct = (p: { productId: string; productName: string; category: string; price: number }) =>
  emit('view_product', { product_id: p.productId, product_name: p.productName, category: p.category, price: p.price })

export const trackAddToCart = (p: { productId: string; productName: string; price: number; quantity: number; variant?: string }) =>
  emit('add_to_cart', { product_id: p.productId, product_name: p.productName, price: p.price, quantity: p.quantity, variant: p.variant ?? 'Default' })

export const trackBeginCheckout = (p: { value: number; itemCount: number; coupon?: string | null }) =>
  emit('begin_checkout', { value: p.value, item_count: p.itemCount, coupon: p.coupon ?? null })

export const trackPurchase = (p: { orderNumber: string; value: number; itemCount: number; paymentMethod: string; coupon?: string | null; discount: number }) =>
  emit('purchase', { order_number: p.orderNumber, value: p.value, item_count: p.itemCount, payment_method: p.paymentMethod, coupon: p.coupon ?? null, discount: p.discount })
