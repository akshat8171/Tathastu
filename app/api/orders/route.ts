import { NextRequest, NextResponse } from 'next/server'
import { createOrder, updateOrderPaymentStatus, logPayment, upsertCustomerByPhone } from '@/lib/supabase/orders'
import { getCurrentUser } from '@/lib/auth/session'
import { saveAddressFromOrder } from '@/lib/supabase/account'
import { createOrderSchema } from '@/lib/validation/order'
import { grantOrderAccess } from '@/lib/auth/order-access'
import { repriceItems, applyDiscount } from '@/lib/pricing'
import { validateCoupon, incrementCouponUsage } from '@/lib/coupons'
import {
  fetchCashfreeOrder,
  fetchCashfreeOrderPayments,
  isCashfreeOrderPaid,
  isCashfreePaymentSuccess,
} from '@/lib/cashfree-server'

/**
 * Authoritatively confirm a Cashfree payment on the order-create path.
 *
 * Unlike Razorpay (which hands the browser a signature to forward), Cashfree
 * gives the client only a payment_session_id. Trust therefore comes from the
 * SERVER asking Cashfree for the order status — never from client-supplied data.
 * We require BOTH:
 *   1. order_status === 'PAID'
 *   2. the captured amount matches our server-computed total (defence against a
 *      tampered/under-paid order being marked fully paid)
 *
 * Fail-closed: any error, non-PAID status, or amount mismatch returns
 * { paid: false } so the order is left 'pending'. A genuinely-captured payment
 * that we miss here is still reconciled by the HMAC-verified idempotent webhook.
 */
async function confirmCashfreePayment(
  cashfreeOrderId: string,
  expectedTotal: number
): Promise<{ paid: boolean; cfPaymentId?: string; paymentMethod?: string }> {
  try {
    const order = await fetchCashfreeOrder(cashfreeOrderId)
    if (!isCashfreeOrderPaid(order.order_status)) {
      return { paid: false }
    }
    // Amount check: Cashfree order_amount is in rupees, same unit as our total.
    if (Math.round(Number(order.order_amount)) !== Math.round(expectedTotal)) {
      console.error('Cashfree amount mismatch on order-create; refusing to mark paid', {
        cashfreeOrderId,
        cashfreeAmount: order.order_amount,
        expectedTotal,
      })
      return { paid: false }
    }
    // Recover the successful payment's cf_payment_id for a complete record.
    const payments = await fetchCashfreeOrderPayments(cashfreeOrderId)
    const success = payments.find(p => isCashfreePaymentSuccess(p.payment_status))
    return {
      paid: true,
      cfPaymentId: success ? String(success.cf_payment_id) : undefined,
      paymentMethod: success?.payment_group,
    }
  } catch (error) {
    console.error('Cashfree confirmation failed on order-create; leaving order pending', {
      cashfreeOrderId,
      error,
    })
    return { paid: false }
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
      email: customer.email,
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
      customer_email: customer.email,
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
      // Full structured address (migration-001 JSONB) so the account address
      // book can be backfilled from this order without parsing `notes`.
      shipping_address: {
        name: customer.name,
        phone: customer.phone,
        address_line: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      },
    })

    if (error || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Cash on Delivery: no payment proof, order stays pending until delivery.
    // Online (cashfree): mark paid + log the payment ONLY when Cashfree itself
    // confirms the order is PAID for the expected amount.
    //
    // SECURITY (money path): we must NEVER mark an order 'paid' on the strength
    // of a client-supplied id alone — that would let anyone forge a "paid" order
    // for free. Cashfree does not hand the browser a signature, so we ask
    // Cashfree's API directly for the order status and require an exact amount
    // match. If confirmation fails (unpaid/tampered/error), the order is left
    // 'pending' and the failed attempt is logged for audit. A genuinely-captured
    // payment we miss here is still reconciled to 'paid' out-of-band by the
    // HMAC-verified, idempotent webhook — so failing closed never drops a sale.
    if (payment_method === 'cashfree' && payment?.cashfree_order_id) {
      const result = await confirmCashfreePayment(payment.cashfree_order_id, total)
      if (result.paid) {
        await updateOrderPaymentStatus(
          order.id,
          'paid',
          result.cfPaymentId,
          payment.cashfree_order_id
        )
        await logPayment({
          order_id: order.id,
          cashfree_order_id: payment.cashfree_order_id,
          cashfree_payment_id: result.cfPaymentId,
          amount: total,
          payment_method: result.paymentMethod || 'cashfree',
          payment_status: 'paid',
          response_data: payment,
        })
      } else {
        console.error(
          'Cashfree confirmation FAILED on order-create; leaving order pending',
          { order_id: order.id, cashfree_order_id: payment.cashfree_order_id }
        )
        await logPayment({
          order_id: order.id,
          cashfree_order_id: payment.cashfree_order_id,
          amount: total,
          payment_method: 'cashfree',
          payment_status: 'failed',
          response_data: payment,
          error_message: 'Cashfree confirmation failed on order-create path',
        })
      }
    }

    // Record coupon redemption so usage_limit is actually enforceable.
    // Best-effort: a failure here must never roll back a successfully placed
    // order, so incrementCouponUsage swallows its own errors (graceful degrade).
    if (appliedCouponCode) {
      await incrementCouponUsage(appliedCouponCode)
    }

    // Save the delivery address to the buyer's account address book.
    // Only for authenticated buyers — a guest has no account yet, so their
    // address is instead backfilled from this order the first time they sign in
    // (see backfillAddressesFromOrders). Best-effort and de-duplicated; never
    // blocks the order (saveAddressFromOrder swallows its own errors).
    const appUser = await getCurrentUser()
    if (appUser) {
      await saveAddressFromOrder(appUser.id, {
        name: customer.name,
        phone: customer.phone,
        address_line: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      })
    }

    // Grant this (possibly guest) buyer access to view the order-confirmation
    // page for the order they just placed. Best-effort — never fail the order
    // response over a cookie write.
    try {
      await grantOrderAccess(order.order_number)
    } catch {
      /* ignore */
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
