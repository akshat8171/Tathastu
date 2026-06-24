/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/verify/route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

describe('POST /api/payment/verify', () => {
  const secret = 'test_secret_456'

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = secret
  })

  it('verifies valid signature', async () => {
    const orderId = 'order_test123'
    const paymentId = 'pay_test456'
    const body = `${orderId}|${paymentId}`
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
  })

  it('rejects invalid signature', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'order_x',
        razorpay_payment_id: 'pay_x',
        razorpay_signature: 'invalid_sig',
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id: 'order_x' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
