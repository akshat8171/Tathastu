import { NextRequest, NextResponse } from 'next/server'
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree-server'
import {
  updateOrderPaymentStatus,
  logPayment,
  getOrderByPaymentOrderId,
  hasPaymentBeenLogged,
} from '@/lib/supabase/orders'

export const dynamic = 'force-dynamic'

/**
 * Cashfree webhook — the authoritative, out-of-band reconciliation path.
 *
 * Cashfree signs `x-webhook-timestamp + rawBody` with HMAC-SHA256 (base64) in
 * `x-webhook-signature`. We verify against the RAW body (never the parsed JSON)
 * before trusting anything, then process PAYMENT_SUCCESS_WEBHOOK events
 * idempotently so a redelivered webhook never double-marks an order.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    const timestamp = request.headers.get('x-webhook-timestamp')

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })
    }

    if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const cashfreeOrderId: string | undefined = event.data?.order?.order_id
      const paymentEntity = event.data?.payment
      const cfPaymentId = paymentEntity?.cf_payment_id
        ? String(paymentEntity.cf_payment_id)
        : undefined
      const paidAmount = Number(paymentEntity?.payment_amount ?? event.data?.order?.order_amount)

      // Idempotency: skip if this payment was already processed.
      if (cfPaymentId) {
        const alreadyLogged = await hasPaymentBeenLogged(cfPaymentId)
        if (alreadyLogged) {
          return NextResponse.json({ received: true })
        }
      }

      // Resolve the DB order by the Cashfree order id we stored at create time.
      if (cashfreeOrderId) {
        const order = await getOrderByPaymentOrderId(cashfreeOrderId)
        if (order) {
          await updateOrderPaymentStatus(order.id, 'paid', cfPaymentId, cashfreeOrderId)
          await logPayment({
            order_id: order.id,
            cashfree_order_id: cashfreeOrderId,
            cashfree_payment_id: cfPaymentId,
            amount: paidAmount,
            payment_method: paymentEntity?.payment_group || 'cashfree',
            payment_status: 'paid',
            response_data: paymentEntity ?? event.data,
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
