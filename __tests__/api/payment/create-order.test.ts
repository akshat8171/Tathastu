/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/create-order/route'
import { NextRequest } from 'next/server'

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 249900,
        currency: 'INR',
      }),
    },
  }))
})

describe('POST /api/payment/create-order', () => {
  beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_123'
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_456'
  })

  it('creates order with valid amount', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499 }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.orderId).toBe('order_test123')
  })

  it('rejects invalid amount', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: -100 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects missing amount', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
