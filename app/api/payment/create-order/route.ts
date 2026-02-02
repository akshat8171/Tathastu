import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface CreateOrderRequest {
  orderAmount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  orderNote?: string
}

/**
 * Create Cashfree Payment Order
 * API Documentation: https://docs.cashfree.com/reference/pgcreateorder
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json()

    // Validate required fields
    if (!body.orderAmount || !body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate environment variables
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST'

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`

    // Prepare order data
    const orderData = {
      order_id: orderId,
      order_amount: Number(body.orderAmount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`,
      },
      order_note: body.orderNote || 'Payment for order',
    }

    // Cashfree API endpoint
    const apiUrl = env === 'PROD'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders'

    // Make API call to Cashfree
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('Cashfree API Error:', responseData)
      return NextResponse.json(
        { error: responseData.message || 'Failed to create order' },
        { status: response.status }
      )
    }

    // Return order details
    return NextResponse.json({
      success: true,
      orderId: responseData.order_id,
      orderToken: responseData.payment_session_id,
      orderAmount: responseData.order_amount,
      orderStatus: responseData.order_status,
    })

  } catch (error) {
    console.error('Error creating payment order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
