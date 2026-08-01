import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrderSchema } from '@/lib/validation/order'
import { createRazorpayOrder } from '@/lib/razorpay-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createRazorpayOrderSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { amount, currency, customer } = parsed.data
    const order = await createRazorpayOrder({
      amountRupees: amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customer_phone: customer.phone,
        customer_name: customer.name || '',
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; error?: { description?: string; code?: string }; message?: string }
    const keyIdPrefix = (process.env.RAZORPAY_KEY_ID || '').trim().slice(0, 12)
    console.error('Razorpay create order error:', {
      statusCode: err.statusCode,
      code: err.error?.code,
      description: err.error?.description || err.message,
      keyIdPrefix: keyIdPrefix || '(missing)',
      hasSecret: Boolean((process.env.RAZORPAY_KEY_SECRET || '').trim()),
    })
    if (err.statusCode === 401 || /authentication failed/i.test(err.error?.description || '')) {
      return NextResponse.json(
        {
          error:
            'Razorpay authentication failed. Check RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are a matching pair, then restart npm run dev (or set the same vars on Vercel).',
        },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: err.error?.description || err.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
