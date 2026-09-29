import { quoteIdFromNotes } from '@/lib/supabase/quote-order-notes'
import { shippingForSubtotal } from '@/lib/pricing'

const MAX_UNIT_PRICE = 1_000_000

/** Custom-quote orders are created without a selling price until an admin confirms them. */
export function isCustomQuoteOrder(notes?: string | null, itemNames: string[] = []): boolean {
  if (quoteIdFromNotes(notes)) return true
  return itemNames.some((name) => /^custom\b/i.test(name))
}

/** Whole-rupee unit price, or null when the value cannot be charged. */
export function parseConfirmedUnitPrice(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_UNIT_PRICE) return null
  return Math.round(amount)
}

export function totalsForConfirmedUnitPrice(input: {
  unitPrice: number
  quantity: number
  discount: number
  tax: number
  otherSubtotal?: number
}): { subtotal: number; shipping: number; discount: number; total: number } {
  const lineSubtotal = Math.round(input.unitPrice * input.quantity)
  const subtotal = lineSubtotal + Math.max(0, Math.round(input.otherSubtotal ?? 0))
  const shipping = shippingForSubtotal(subtotal)
  const discount = Math.min(Math.max(0, Math.round(input.discount || 0)), subtotal)
  const tax = Math.max(0, Math.round(input.tax || 0))
  const total = Math.max(0, subtotal - discount + tax + shipping)
  return { subtotal, shipping, discount, total }
}
