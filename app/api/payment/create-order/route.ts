import { NextRequest, NextResponse } from 'next/server'
import { createCashfreeOrderSchema } from '@/lib/validation/order'
import { createCashfreeOrder } from '@/lib/cashfree-server'

export const dynamic = 'force-dynamic'

/**
 * Generate a unique, Cashfree-safe order id.
 * Cashfree order ids must be alphanumeric (plus _ and -) and <= 50 chars.
 */
function makeOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `cf_${Date.now()}_${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = createCashfreeOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { amount, currency, customer } = parsed.data
    const orderId = makeOrderId()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const order = await createCashfreeOrder({
      orderId,
      amount,
      currency,
      customer: {
        // Cashfree needs a stable customer id; derive it from the phone so the
        // same shopper reuses one Cashfree customer profile across orders.
        id: `cust_${customer.phone}`,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      notifyUrl: appUrl ? `${appUrl}/api/payment/webhook` : undefined,
      returnUrl: appUrl ? `${appUrl}/checkout?cf_order_id=${orderId}` : undefined,
    })

    if (!order.payment_session_id) {
      return NextResponse.json({ error: 'Cashfree did not return a payment session' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      amount: order.order_amount,
      currency: order.order_currency,
    })
  } catch (error: any) {
    console.error('Cashfree create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
