import 'server-only'
import { supabaseAdmin } from './supabase/admin'

/**
 * Server-side coupon lookup + validation.
 *
 * Validates a coupon code against the existing `coupons` table (see
 * supabase/schema.sql §8). Discount is computed SERVER-SIDE against the
 * server-trusted subtotal — never trust a client-sent discount, same principle
 * as repriceItems(). All access via the service-role client.
 *
 * The coupons table shape we rely on:
 *   code, discount_type ('percentage'|'fixed'), discount_value,
 *   min_order_amount, max_discount_amount, usage_limit, usage_count,
 *   valid_from, valid_until, is_active
 *
 * Never throws: a missing table / DB error degrades to "invalid coupon".
 */

export interface CouponRow {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  usage_count: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean | null
}

export interface CouponValidation {
  valid: boolean
  /** Discount amount in rupees (>= 0), already clamped to subtotal + max_discount. */
  discount: number
  /** Normalized (uppercased) code when valid, else the input. */
  code: string
  /** Human-readable reason — shown to the user. */
  message: string
}

/** Normalize a user-typed code: trim + uppercase. */
export function normalizeCouponCode(raw: string): string {
  return (raw ?? '').trim().toUpperCase()
}

/**
 * Validate a coupon against a server-trusted subtotal (rupees) and compute the
 * discount. Returns { valid:false, discount:0 } with a reason for any failure.
 *
 * `nowIso` is injectable for deterministic tests; defaults to current time.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  nowIso?: string
): Promise<CouponValidation> {
  const code = normalizeCouponCode(rawCode)

  if (!code) {
    return { valid: false, discount: 0, code, message: 'Enter a coupon code' }
  }

  let row: CouponRow | null = null
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select(
        'code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, is_active'
      )
      // case-insensitive exact match so "save10" matches "SAVE10"
      .ilike('code', code)
      .maybeSingle()

    if (error) {
      console.error('validateCoupon: DB error', error)
      return { valid: false, discount: 0, code, message: 'Could not validate coupon' }
    }
    row = (data as CouponRow) ?? null
  } catch (err) {
    console.error('validateCoupon: unexpected error', err)
    return { valid: false, discount: 0, code, message: 'Could not validate coupon' }
  }

  if (!row) {
    return { valid: false, discount: 0, code, message: 'Invalid coupon code' }
  }

  return computeCouponDiscount(row, subtotal, nowIso)
}

/**
 * Pure discount computation from a coupon row + subtotal. Exported so it can be
 * unit-tested without a DB. `nowIso` defaults to current time at call.
 */
export function computeCouponDiscount(
  row: CouponRow,
  subtotal: number,
  nowIso?: string
): CouponValidation {
  const code = (row.code ?? '').toUpperCase()
  const now = nowIso ? new Date(nowIso).getTime() : new Date().getTime()

  if (row.is_active === false) {
    return { valid: false, discount: 0, code, message: 'This coupon is no longer active' }
  }

  if (row.valid_from && now < new Date(row.valid_from).getTime()) {
    return { valid: false, discount: 0, code, message: 'This coupon is not active yet' }
  }

  if (row.valid_until && now > new Date(row.valid_until).getTime()) {
    return { valid: false, discount: 0, code, message: 'This coupon has expired' }
  }

  if (
    row.usage_limit != null &&
    row.usage_count != null &&
    row.usage_count >= row.usage_limit
  ) {
    return { valid: false, discount: 0, code, message: 'This coupon has reached its usage limit' }
  }

  const minOrder = row.min_order_amount ?? 0
  if (subtotal < minOrder) {
    return {
      valid: false,
      discount: 0,
      code,
      message: `Add ₹${Math.ceil(minOrder - subtotal).toLocaleString('en-IN')} more to use this coupon`,
    }
  }

  // Compute raw discount.
  let discount =
    row.discount_type === 'percentage'
      ? (subtotal * row.discount_value) / 100
      : row.discount_value

  // Clamp to max_discount_amount (if set) then to the subtotal itself.
  if (row.max_discount_amount != null) {
    discount = Math.min(discount, row.max_discount_amount)
  }
  discount = Math.min(discount, subtotal)

  // Round to whole rupees (the rest of the app uses integer rupees).
  discount = Math.round(Math.max(0, discount))

  if (discount <= 0) {
    return { valid: false, discount: 0, code, message: 'This coupon gives no discount on your order' }
  }

  return { valid: true, discount, code, message: `Coupon ${code} applied` }
}
