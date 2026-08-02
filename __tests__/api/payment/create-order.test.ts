/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/create-order/route'
import { NextRequest } from 'next/server'

const mockCreateRazorpayOrder = jest.fn()

jest.mock('@/lib/razorpay-server', () => ({
  createRazorpayOrder: (...args: unknown[]) => mockCreateRazorpayOrder(...args),
}))

const VALID_CUSTOMER = { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com' }

describe('POST /api/payment/create-order', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateRazorpayOrder.mockResolvedValue({
      id: 'order_test_123',
      amount: 249900,
      currency: 'INR',
      receipt: 'rcpt_1',
    })
  })

  it('creates order and returns order id + amount in paise', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499, customer: VALID_CUSTOMER }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.orderId).toBe('order_test_123')
    expect(data.amount).toBe(249900)
    expect(data.currency).toBe('INR')
  })

  it('rejects invalid amount', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: -100, customer: VALID_CUSTOMER }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects missing customer phone', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499, customer: { name: 'No Phone' } }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 500 when Razorpay create fails', async () => {
    mockCreateRazorpayOrder.mockRejectedValueOnce(new Error('gateway down'))
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499, customer: VALID_CUSTOMER }),
    })
    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
