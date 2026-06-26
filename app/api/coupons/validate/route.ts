import { NextRequest, NextResponse } from 'next/server'
import { repriceItems } from '@/lib/pricing'
import { validateCoupon } from '@/lib/coupons'
import { getCurrentUser } from '@/lib/auth/session'
import { getCustomerIdByPhone } from '@/lib/supabase/orders'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/coupons/validate
 *
 * Body: { code: string, items: [{ product_id, product_name, quantity, ... }] }
 *
 * Re-prices the cart server-side (never trusts client prices), then validates
 * the coupon against the trusted subtotal and returns the computed discount.
 * The checkout UI uses this to show the discount line BEFORE the order is
 * placed; /api/orders re-validates independently at write time.
 *
 * For first-order gating (FIRST20 etc.) we resolve the caller's REAL
 * customers.id from their phone — the same id orders.customer_id is keyed by —
 * so this advisory check matches the authoritative re-check in /api/orders.
 * Unknown/guest callers resolve to null and are allowed through here; the money
 * path re-checks with the correct id at order time.
 */

const bodySchema = z.object({
  code: z.string().trim().min(1, 'Enter a coupon code').max(50),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        product_name: z.string().min(1),
        product_image: z.string().optional(),
        product_variant: z.string().optional(),
        quantity: z.number().int().gt(0),
      })
    )
    .min(1, 'Your cart is empty'),
})

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ valid: false, discount: 0, message }, { status: 400 })
    }

    const { code, items } = parsed.data

    const repriced = repriceItems(items)
    if (!repriced.ok) {
      return NextResponse.json(
        { valid: false, discount: 0, message: 'Your cart has an invalid item' },
        { status: 400 }
      )
    }

    // Resolve the caller's customers.id for first-order gating (null for guests
    // or email-only users without a phone). We map phone → customers.id so this
    // matches the id orders.customer_id is keyed by; passing the raw auth id
    // would never match and silently disable gating.
    const user = await getCurrentUser().catch(() => null)
    const customerId = user?.phone ? await getCustomerIdByPhone(user.phone) : null

    const result = await validateCoupon(code, repriced.subtotal, undefined, customerId)

    return NextResponse.json({
      valid: result.valid,
      discount: result.discount,
      code: result.code,
      message: result.message,
      // Echo the trusted subtotal so the UI can recompute the displayed total.
      subtotal: repriced.subtotal,
    })
  } catch (error) {
    console.error('coupon validate error:', error)
    return NextResponse.json(
      { valid: false, discount: 0, message: 'Could not validate coupon' },
      { status: 500 }
    )
  }
}
