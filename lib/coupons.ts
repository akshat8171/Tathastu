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
 *   valid_from, valid_until, is_active, is_first_order_only
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
  /** When true, the coupon is only valid for customers with zero prior orders.
   *  Optional so that older test fixtures without this field still satisfy CouponRow. */
  is_first_order_only?: boolean | null
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
 * Check whether a given customer has any prior orders. Returns true when the
 * customer has NO prior orders (so they qualify for a first-order coupon).
 * Degrades gracefully to `true` (allow) when the table is missing or DB errors
 * occur — see constraint §6 in SHARED-CONSTRAINTS.
 *
 * IMPORTANT — id semantics: `customerId` MUST be the `customers.id` UUID (the
 * value written to `orders.customer_id`), i.e. the return of
 * upsertCustomerByPhone — NOT the auth/session user id from getCurrentUser().
 * Those two ids differ. The authoritative caller is the order-creation route,
 * which resolves the customer row first and passes that id straight through, so
 * the `.eq('customer_id', customerId)` match below is exact. The advisory
 * /api/coupons/validate path may pass a session id it cannot map to a customer
 * row; that simply fails open here (returns true) and the real gate runs again
 * on the money path with the correct id.
 */
async function isFirstOrder(customerId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('customer_id', customerId)
      .limit(1)

    if (error) {
      console.warn('isFirstOrder: DB query failed, defaulting to allow', error)
      return true // fail-open: let the coupon through on error
    }

    return (data ?? []).length === 0
  } catch (err) {
    console.warn('isFirstOrder: unexpected error, defaulting to allow', err)
    return true
  }
}

/**
 * Record a redemption of `rawCode` by bumping coupons.usage_count, so that the
 * usage_limit guard in computeCouponDiscount() actually becomes enforceable.
 *
 * Called once from the order-creation route AFTER an order with this coupon is
 * successfully persisted. Best-effort and never throws: a failure here must not
 * roll back a placed order. Prefers an atomic server-side increment via the
 * `increment_coupon_usage` RPC (see supabase/migration-007-coupon-usage.sql);
 * if that function has not been applied to the database yet it falls back to a
 * read-then-write, which is non-atomic but acceptable at this order volume.
 */
export async function incrementCouponUsage(rawCode: string): Promise<void> {
  const code = normalizeCouponCode(rawCode)
  if (!code) return

  try {
    const { error: rpcError } = await supabaseAdmin.rpc('increment_coupon_usage', {
      coupon_code: code,
    })
    if (!rpcError) return // atomic path succeeded

    // Fallback: read current count then write +1. Logged at debug only — an
    // unapplied RPC is an expected state, not an error.
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('usage_count')
      .ilike('code', code)
      .maybeSingle()

    if (error || !data) return
    const next = (data.usage_count ?? 0) + 1
    await supabaseAdmin.from('coupons').update({ usage_count: next }).ilike('code', code)
  } catch (err) {
    console.warn('incrementCouponUsage: failed (non-fatal)', err)
  }
}

/**
 * Validate a coupon against a server-trusted subtotal (rupees) and compute the
 * discount. Returns { valid:false, discount:0 } with a reason for any failure.
 *
 * `nowIso` is injectable for deterministic tests; defaults to current time.
 * `customerId` is the `customers.id` UUID (orders.customer_id), used to enforce
 * first-order gating on coupons with `is_first_order_only = true`. The money
 * path (/api/orders) resolves this from upsertCustomerByPhone and passes it in;
 * the advisory validate path may pass null/a session id and fails open.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  nowIso?: string,
  customerId?: string | null
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
        'code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, is_active, is_first_order_only'
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

  // ── First-order gating ────────────────────────────────────────────────────
  // Enforce that the coupon is only redeemable on the customer's first order.
  // If is_first_order_only is true but no customerId is provided (guest, or the
  // advisory validate path before a customer row exists), we treat them as
  // eligible since we cannot verify order history. The authoritative re-check
  // happens on the money path (/api/orders), which resolves the real
  // customers.id via upsertCustomerByPhone before calling this again.
  if (row.is_first_order_only) {
    if (customerId) {
      const firstOrder = await isFirstOrder(customerId)
      if (!firstOrder) {
        return {
          valid: false,
          discount: 0,
          code,
          message: 'This coupon is only valid on your first order',
        }
      }
    }
    // no customerId: allow at this stage — the money path re-checks with the
    // correct customers.id, and usage_count/usage_limit catches repeat redemption.
  }

  return computeCouponDiscount(row, subtotal, nowIso)
}

/**
 * Pure discount computation from a coupon row + subtotal. Exported so it can be
 * unit-tested without a DB. `nowIso` defaults to current time at call.
 * Note: first-order gating (is_first_order_only) is NOT checked here since it
 * requires an async DB call; it is handled in validateCoupon() above.
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
