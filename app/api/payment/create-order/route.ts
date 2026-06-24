import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrderSchema } from '@/lib/validation/order'

export const dynamic = 'force-dynamic'

async function getRazorpay() {
  const Razorpay = (await import('razorpay')).default
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request shape with Zod
    const parsed = createRazorpayOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { amount, currency, receipt, notes } = parsed.data

    const razorpay = await getRazorpay()
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert rupees → paise
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
