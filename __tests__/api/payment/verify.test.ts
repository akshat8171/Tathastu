/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/verify/route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

const SECRET = 'test_secret_456'

describe('POST /api/payment/verify', () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = SECRET
  })

  function sign(orderId: string, paymentId: string): string {
    return crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex')
  }

  it('accepts a valid signature', async () => {
    const orderId = 'order_abc'
    const paymentId = 'pay_xyz'
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(orderId, paymentId),
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
  })

  it('rejects an invalid signature with 400', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'order_abc',
        razorpay_payment_id: 'pay_xyz',
        razorpay_signature: 'not_a_real_signature',
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects missing fields with 400', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id: 'order_abc' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
