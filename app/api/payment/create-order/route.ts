import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error('Razorpay create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
