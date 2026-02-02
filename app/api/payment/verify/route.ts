import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify Cashfree Payment Status
 * API Documentation: https://docs.cashfree.com/reference/pgfetchorder
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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

    // Cashfree API endpoint
    const apiUrl = env === 'PROD'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`

    // Make API call to Cashfree
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const orderData = await response.json()

    if (!response.ok) {
      console.error('Cashfree Verify Error:', orderData)
      return NextResponse.json(
        { error: orderData.message || 'Failed to verify order' },
        { status: response.status }
      )
    }

    // Return payment status
    return NextResponse.json({
      success: true,
      orderId: orderData.order_id,
      orderStatus: orderData.order_status,
      orderAmount: orderData.order_amount,
      paymentMethod: orderData.payment_method,
      customerDetails: orderData.customer_details,
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
