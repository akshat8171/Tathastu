import { NextRequest, NextResponse } from 'next/server'
import { repriceItems } from '@/lib/pricing'
import { validateCoupon } from '@/lib/coupons'
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

    const result = await validateCoupon(code, repriced.subtotal)

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
