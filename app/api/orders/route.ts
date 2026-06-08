import { NextRequest, NextResponse } from 'next/server'
import { createOrder, updateOrderPaymentStatus, logPayment } from '@/lib/supabase/orders'

export async function POST(request: NextRequest) {
  try {
    const { customer, items, subtotal, shipping, total, payment } = await request.json()

    if (!customer || !items || !items.length || !total) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
    }

    const { order, error } = await createOrder({
      customer_name: customer.name,
      customer_email: customer.email || '',
      customer_phone: customer.phone,
      items,
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
      await updateOrderPaymentStatus(order.id, 'paid', payment.razorpay_payment_id, payment.razorpay_order_id)
      await logPayment({
        order_id: order.id,
        cashfree_order_id: payment.razorpay_order_id,
        cashfree_payment_id: payment.razorpay_payment_id,
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
