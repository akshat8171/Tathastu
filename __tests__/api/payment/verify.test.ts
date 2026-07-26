/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/verify/route'
import { NextRequest } from 'next/server'

const mockFetchCashfreeOrder = jest.fn()

jest.mock('@/lib/cashfree-server', () => ({
  fetchCashfreeOrder: (...args: any[]) => mockFetchCashfreeOrder(...args),
  // Keep the real business rule for what counts as paid.
  isCashfreeOrderPaid: (status: string) => status === 'PAID',
}))

describe('POST /api/payment/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('confirms a PAID order', async () => {
    mockFetchCashfreeOrder.mockResolvedValue({ order_id: 'cf_1', order_status: 'PAID' })
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ cashfree_order_id: 'cf_1' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
  })

  it('reports an unpaid (ACTIVE) order as not verified', async () => {
    mockFetchCashfreeOrder.mockResolvedValue({ order_id: 'cf_1', order_status: 'ACTIVE' })
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ cashfree_order_id: 'cf_1' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(false)
    expect(data.verified).toBe(false)
  })

  it('rejects a missing cashfree_order_id', async () => {
    const request = new NextRequest('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
