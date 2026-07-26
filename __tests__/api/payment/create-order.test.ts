/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/create-order/route'
import { NextRequest } from 'next/server'

const mockCreateCashfreeOrder = jest.fn()

jest.mock('@/lib/cashfree-server', () => ({
  createCashfreeOrder: (...args: any[]) => mockCreateCashfreeOrder(...args),
}))

const VALID_CUSTOMER = { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com' }

describe('POST /api/payment/create-order', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateCashfreeOrder.mockResolvedValue({
      order_id: 'cf_test_123',
      order_amount: 2499,
      order_currency: 'INR',
      order_status: 'ACTIVE',
      payment_session_id: 'session_test_abc',
    })
  })

  it('creates order and returns a payment session id', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499, customer: VALID_CUSTOMER }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.orderId).toBe('cf_test_123')
    expect(data.paymentSessionId).toBe('session_test_abc')
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

  it('returns 502 when Cashfree omits a payment session', async () => {
    mockCreateCashfreeOrder.mockResolvedValueOnce({
      order_id: 'cf_test_123',
      order_amount: 2499,
      order_currency: 'INR',
      order_status: 'ACTIVE',
    })
    const request = new NextRequest('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 2499, customer: VALID_CUSTOMER }),
    })
    const response = await POST(request)
    expect(response.status).toBe(502)
  })
})
