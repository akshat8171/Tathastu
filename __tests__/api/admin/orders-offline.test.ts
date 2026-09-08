/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/orders/route'

const mockRequireAdmin = jest.fn()
const mockCreateOfflineOrder = jest.fn()

jest.mock('@/lib/auth/admin', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}))

jest.mock('@/lib/supabase/offline-orders', () => ({
  createOfflineOrder: (...args: unknown[]) => mockCreateOfflineOrder(...args),
}))

jest.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {},
}))

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { email: 'admin@tathastukeepsakes.in' } })
    mockCreateOfflineOrder.mockResolvedValue({
      order: { id: 'order-1', order_number: 'ORDER_1', channel: 'offline' },
      error: null,
    })
  })

  it('rejects callers who are not admin', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    })
    const response = await POST(makeRequest({ product_name: 'Rakhi' }))
    expect(response.status).toBe(401)
    expect(mockCreateOfflineOrder).not.toHaveBeenCalled()
  })

  it('creates an offline order from sheet fields', async () => {
    const response = await POST(
      makeRequest({
        product_name: 'Name rakhi',
        customer_name: 'Aryan',
        order_date: '2026-09-08',
        print_status: 'In Progress',
        payment_status: 'Payment Recieved',
        item_delivered: 'Not started',
        quantity: 2,
        price: 150,
        cost: 80,
      })
    )
    expect(response.status).toBe(201)
    expect(mockCreateOfflineOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        product_name: 'Name rakhi',
        customer_name: 'Aryan',
        print_status: 'In Progress',
        payment_status: 'Payment Recieved',
        quantity: 2,
        total: 300,
        amount_collected: 300,
        cost: 80,
      })
    )
  })

  it('returns 400 when Product Name is missing', async () => {
    const response = await POST(
      makeRequest({
        customer_name: 'Aryan',
        order_date: '2026-09-08',
        print_status: 'Not Started',
        payment_status: 'Payment Pending',
        item_delivered: 'Not started',
        quantity: 1,
        price: 100,
      })
    )
    expect(response.status).toBe(400)
    expect(mockCreateOfflineOrder).not.toHaveBeenCalled()
  })
})
