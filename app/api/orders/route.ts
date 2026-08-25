import { NextRequest, NextResponse } from 'next/server'
import { createOrder, updateOrderPaymentStatus, logPayment, upsertCustomerByPhone } from '@/lib/supabase/orders'
import { saveAddressFromOrder } from '@/lib/supabase/account'
import { createOrderSchema } from '@/lib/validation/order'
import { grantOrderAccess } from '@/lib/auth/order-access'
import { repriceItems, applyDiscount } from '@/lib/pricing'
import { getCatalogProducts } from '@/lib/catalog/store'
import { validateCoupon, incrementCouponUsage } from '@/lib/coupons'
import {
  verifyRazorpayPaymentSignature,
  confirmRazorpayPaymentAmount,
} from '@/lib/razorpay-server'

export const runtime = 'nodejs'

/**
 * Authoritatively confirm a Razorpay payment on the order-create path.
 *
 * Trust requires BOTH:
 *   1. Valid HMAC-SHA256 signature (order_id|payment_id)
 *   2. Razorpay payment fetch showing captured/authorized for exact server total
 *
 * Fail-closed: any mismatch leaves the order pending. Webhook reconciles misses.
 */
async function confirmRazorpayPayment(
  payment: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  },
  expectedTotal: number
): Promise<{ paid: boolean; paymentMethod?: string }> {
  const signatureOk = verifyRazorpayPaymentSignature(payment)
  if (!signatureOk) {
    console.error('Razorpay signature mismatch on order-create; refusing to mark paid', {
      orderId: payment.razorpay_order_id,
    })
    return { paid: false }
  }

  // Mock payments cannot be fetched from Razorpay — leave pending (same as before).
  if (
    payment.razorpay_order_id.startsWith('order_mock_') ||
    payment.razorpay_payment_id.startsWith('pay_mock_')
  ) {
    return { paid: false }
  }

  const amountCheck = await confirmRazorpayPaymentAmount(
    payment.razorpay_payment_id,
    expectedTotal
  )
  if (!amountCheck.ok) {
    console.error('Razorpay amount/status check failed on order-create; refusing to mark paid', {
      paymentId: payment.razorpay_payment_id,
      expectedTotal,
      amountPaise: amountCheck.amountPaise,
    })
    return { paid: false }
  }

  return { paid: true, paymentMethod: amountCheck.method }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { customer, items, payment, payment_method, couponCode } = parsed.data

    const catalog = await getCatalogProducts()
    let repriced = repriceItems(
      items,
      catalog.map((product) => ({ id: product.id, price: product.price }))
    )
    if (!repriced.ok) {
      return NextResponse.json({ error: 'Invalid item in order' }, { status: 400 })
    }

    const customerId = await upsertCustomerByPhone({
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
    })

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
      payment_method: payment_method === 'cashfree' ? 'razorpay' : payment_method,
      notes: `Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
      shipping_state: customer.state,
      shipping_city: customer.city,
      shipping_pincode: customer.pincode,
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

    const isOnline =
      (payment_method === 'razorpay' || payment_method === 'cashfree') &&
      payment?.razorpay_order_id &&
      payment?.razorpay_payment_id &&
      payment?.razorpay_signature

    if (isOnline) {
      const result = await confirmRazorpayPayment(
        {
          razorpay_order_id: payment.razorpay_order_id!,
          razorpay_payment_id: payment.razorpay_payment_id!,
          razorpay_signature: payment.razorpay_signature!,
        },
        total
      )
      if (result.paid) {
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
          payment_method: result.paymentMethod || 'razorpay',
          payment_status: 'paid',
          response_data: payment,
        })
      } else {
        console.error('Razorpay confirmation FAILED on order-create; leaving order pending', {
          order_id: order.id,
          razorpay_order_id: payment.razorpay_order_id,
        })
        await logPayment({
          order_id: order.id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          amount: total,
          payment_method: 'razorpay',
          payment_status: 'failed',
          response_data: payment,
          error_message: 'Razorpay confirmation failed on order-create path',
        })
      }
    }

    if (appliedCouponCode) {
      await incrementCouponUsage(appliedCouponCode)
    }

    // Best-effort address book save. Dynamic-import session so guest checkout
    // never loads firebase-admin (jose ESM crash on Vercel). Failures here must
    // never block a successfully created order.
    try {
      const { getCurrentUser } = await import('@/lib/auth/session')
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
    } catch (err) {
      console.error('Post-order address save skipped', err)
    }

    try {
      await grantOrderAccess(order.order_number)
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentMethod: payment_method === 'cashfree' ? 'razorpay' : payment_method,
      total,
      discount,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
