import { NextRequest, NextResponse } from 'next/server'
import { createOrder, updateOrderPaymentStatus, logPayment } from '@/lib/supabase/orders'
import { createOrderSchema } from '@/lib/validation/order'
import { repriceItems } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request shape with Zod
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { customer, items, payment } = parsed.data

    // Server-side re-pricing: ignore ALL client-sent prices/totals
    const repriced = repriceItems(items)
    if (!repriced.ok) {
      return NextResponse.json({ error: 'Invalid item in order' }, { status: 400 })
    }

    const { subtotal, shipping, total, items: pricedItems } = repriced

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
      items: dbItems,
      subtotal,
      shipping,
      total,
      payment_method: 'razorpay',
      notes: `Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
    })

    if (error || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    if (payment?.razorpay_payment_id) {
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
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
