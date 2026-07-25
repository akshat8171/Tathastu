import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createOrder, updateOrderPaymentStatus, logPayment, upsertCustomerByPhone } from '@/lib/supabase/orders'
import { createOrderSchema } from '@/lib/validation/order'
import { repriceItems, applyDiscount } from '@/lib/pricing'
import { validateCoupon, incrementCouponUsage } from '@/lib/coupons'

/**
 * Verify a Razorpay payment signature on the order-create path.
 *
 * Razorpay returns `razorpay_signature = HMAC_SHA256(order_id | payment_id)`
 * keyed with RAZORPAY_KEY_SECRET. This is the SAME scheme /api/payment/verify
 * uses. Without this check, a forged POST containing any razorpay_payment_id
 * would mark an order 'paid' for free — the core go-live money-path bug.
 *
 * Fail-closed: returns false if the secret or any field is missing, malformed,
 * or the digests do not match. Uses timingSafeEqual so a mismatch does not leak
 * the expected signature via response timing.
 */
function verifyRazorpaySignature(payment: {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment
  if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false
  }
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(razorpay_signature, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request shape with Zod
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { customer, items, payment, payment_method, couponCode } = parsed.data

    // Server-side re-pricing: ignore ALL client-sent prices/totals
    let repriced = repriceItems(items)
    if (!repriced.ok) {
      return NextResponse.json({ error: 'Invalid item in order' }, { status: 400 })
    }

    // Resolve the customer FIRST (keyed by phone) so we can enforce
    // first-order coupon gating against the SAME id the order is written with.
    // On failure the result is null and the order proceeds with customer_id = null.
    // This must never block a sale: any error is logged inside upsertCustomerByPhone.
    const customerId = await upsertCustomerByPhone({
      phone: customer.phone,
      name: customer.name,
      email: customer.email || undefined,
    })

    // Server-validated coupon: recompute the discount against the trusted
    // subtotal. An invalid/expired coupon is silently ignored (discount stays 0)
    // so it can never block a sale; the checkout UI validates separately and
    // shows the reason before the user reaches this point.
    //
    // SECURITY: this is the authoritative money path. We pass `customerId`
    // (the value stored in orders.customer_id) so first-order-only coupons like
    // FIRST20 are gated here — NOT just on the advisory /api/coupons/validate
    // path. A repeat customer (same phone → same customerId → has prior orders)
    // is correctly denied the discount even if the client re-sends couponCode.
    let appliedCouponCode: string | null = null
    if (couponCode) {
      const couponResult = await validateCoupon(
        couponCode,
        repriced.subtotal,
        undefined,
        customerId
      )
      if (couponResult.valid) {
        repriced = applyDiscount(repriced, couponResult.discount, couponResult.code)
        appliedCouponCode = couponResult.code
      }
    }

    const { subtotal, shipping, total, discount, items: pricedItems } = repriced

    // Build DB items using server-trusted prices
    const dbItems = pricedItems.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
      product_image: i.product_image,
      product_variant: i.product_variant,
      price: i.serverPrice,
      quantity: i.quantity,
    }))

    const { order, error } = await createOrder({
      customer_name: customer.name,
      customer_email: customer.email || '',
      customer_phone: customer.phone,
      customer_id: customerId,
      items: dbItems,
      subtotal,
      discount,
      shipping,
      total,
      payment_method,
      notes: `Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
      // Structured geography for analytics (migration-008). `notes` above stays
      // as the human-readable address and the migration's backfill source.
      shipping_state: customer.state,
      shipping_city: customer.city,
      shipping_pincode: customer.pincode,
    })

    if (error || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Cash on Delivery: no payment proof, order stays pending until delivery.
    // Online (razorpay): mark paid + log the payment ONLY when the signature is
    // cryptographically valid.
    //
    // SECURITY (money path): we must NEVER mark an order 'paid' on the strength
    // of a client-supplied payment id alone — that would let anyone forge a
    // "paid" order for free. Razorpay signs every real payment; we recompute the
    // HMAC and require an exact match before trusting it. If verification fails
    // (forged/missing/tampered), the order is left 'pending' and the failed
    // attempt is logged for audit. A genuinely-captured payment is still
    // reconciled to 'paid' out-of-band by the HMAC-verified, idempotent webhook
    // at /api/payment/webhook — so failing closed here never drops a real sale.
    if (payment_method === 'razorpay' && payment?.razorpay_payment_id) {
      if (verifyRazorpaySignature(payment)) {
        await updateOrderPaymentStatus(
          order.id,
          'paid',
          payment.razorpay_payment_id,
          payment.razorpay_order_id
        )
        await logPayment({
          order_id: order.id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          amount: total,
          payment_method: 'razorpay',
          payment_status: 'paid',
          response_data: payment,
        })
      } else {
        console.error(
          'Razorpay signature verification FAILED on order-create; leaving order pending',
          { order_id: order.id, razorpay_order_id: payment.razorpay_order_id }
        )
        await logPayment({
          order_id: order.id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          amount: total,
          payment_method: 'razorpay',
          payment_status: 'failed',
          response_data: payment,
          error_message: 'Signature verification failed on order-create path',
        })
      }
    }

    // Record coupon redemption so usage_limit is actually enforceable.
    // Best-effort: a failure here must never roll back a successfully placed
    // order, so incrementCouponUsage swallows its own errors (graceful degrade).
    if (appliedCouponCode) {
      await incrementCouponUsage(appliedCouponCode)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentMethod: payment_method,
      total,
      discount,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
