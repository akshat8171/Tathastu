import { NextRequest, NextResponse } from 'next/server'
import { getOrderByNumberAndEmail } from '@/lib/supabase/orders'
import { grantOrderAccess } from '@/lib/auth/order-access'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/orders/lookup
 *
 * Guest order lookup — verifies that both order number AND email match.
 * Returns { found: true } on success (caller then navigates to /order-confirmation/<num>).
 * Returns { found: false, message } when no match is found.
 *
 * Requiring both fields prevents order-number enumeration attacks.
 */

const bodySchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order number is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ found: false, message }, { status: 400 })
    }

    const { orderNumber, email } = parsed.data

    const order = await getOrderByNumberAndEmail(orderNumber, email)

    if (!order) {
      return NextResponse.json(
        {
          found: false,
          message:
            'No order found with that number and email. Please check your details.',
        },
        { status: 404 }
      )
    }

    // The email gate passed — grant access so the confirmation page renders for
    // this guest without re-prompting. Best-effort; don't fail the lookup on a
    // cookie write error.
    try {
      await grantOrderAccess(order.order_number)
    } catch {
      /* ignore */
    }

    return NextResponse.json({ found: true, orderNumber: order.order_number })
  } catch (error) {
    console.error('order lookup error:', error)
    return NextResponse.json(
      { found: false, message: 'Could not look up order' },
      { status: 500 }
    )
  }
}
