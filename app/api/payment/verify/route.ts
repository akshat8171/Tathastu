import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Constant-time verification of a Razorpay payment signature.
 *
 * Razorpay signs `order_id|payment_id` with HMAC-SHA256 keyed on
 * RAZORPAY_KEY_SECRET. We recompute the digest and compare it with
 * crypto.timingSafeEqual rather than `===`. A plain string `===` on the hex
 * digest short-circuits on the first differing byte, so an attacker able to
 * measure response timing could recover the expected signature one character
 * at a time and forge a "verified" payment without knowing the secret.
 * timingSafeEqual always compares the full buffer in constant time.
 *
 * Fail-closed: a missing secret, missing field, or length mismatch returns
 * false (never throws). Mirrors verifyRazorpaySignature() in app/api/orders.
 */
function isValidRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    console.error('Razorpay verify: RAZORPAY_KEY_SECRET is not set; failing closed')
    return false
  }
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signature, 'utf8')
    // Length check first: timingSafeEqual throws if the buffers differ in length.
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    if (!isValidRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error('Razorpay verify error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
