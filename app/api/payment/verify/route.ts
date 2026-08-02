import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay-server'

export const dynamic = 'force-dynamic'

/**
 * Verify a Razorpay payment signature from the browser checkout callback.
 *
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) compared to
 * razorpay_signature. This is a fast client-facing check; /api/orders re-verifies
 * the same signature (and amount) before marking an order paid.
 */
export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const isValid = verifyRazorpayPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    console.error('Razorpay verify error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
