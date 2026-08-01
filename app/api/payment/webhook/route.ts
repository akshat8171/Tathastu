import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay-server'
import {
  updateOrderPaymentStatus,
  logPayment,
  getOrderByPaymentOrderId,
  hasPaymentBeenLogged,
} from '@/lib/supabase/orders'

export const dynamic = 'force-dynamic'

/**
 * Razorpay webhook — out-of-band reconciliation for payment.captured.
 *
 * Signature: HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET) in x-razorpay-signature.
 * Idempotent via hasPaymentBeenLogged so redeliveries never double-mark.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      const razorpayOrderId: string | undefined = payment?.order_id
      const razorpayPaymentId: string | undefined = payment?.id
      const paidAmountPaise = Number(payment?.amount ?? 0)

      if (razorpayPaymentId) {
        const alreadyLogged = await hasPaymentBeenLogged(razorpayPaymentId)
        if (alreadyLogged) {
          return NextResponse.json({ received: true })
        }
      }

      if (razorpayOrderId) {
        const order = await getOrderByPaymentOrderId(razorpayOrderId)
        if (order) {
          await updateOrderPaymentStatus(order.id, 'paid', razorpayPaymentId, razorpayOrderId)
          await logPayment({
            order_id: order.id,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            amount: paidAmountPaise / 100,
            payment_method: payment?.method || 'razorpay',
            payment_status: 'paid',
            response_data: payment,
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
