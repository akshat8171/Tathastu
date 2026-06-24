import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  updateOrderPaymentStatus,
  logPayment,
  getOrderByPaymentOrderId,
  hasPaymentBeenLogged,
} from '@/lib/supabase/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity

      // Idempotency: skip if this payment was already processed
      const alreadyLogged = await hasPaymentBeenLogged(payment.id)
      if (alreadyLogged) {
        return NextResponse.json({ received: true })
      }

      // Resolve the DB order:
      // 1. Try notes.internal_order_id (direct DB order UUID, if set)
      // 2. Fall back to reconciling by Razorpay order id
      let orderId: string | undefined = payment.notes?.internal_order_id

      if (!orderId) {
        const order = await getOrderByPaymentOrderId(payment.order_id)
        if (order) {
          orderId = order.id
        }
      }

      if (orderId) {
        await updateOrderPaymentStatus(orderId, 'paid', payment.id, payment.order_id)
        await logPayment({
          order_id: orderId,
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
          amount: payment.amount / 100,
          payment_method: payment.method,
          payment_status: 'paid',
          response_data: payment,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
