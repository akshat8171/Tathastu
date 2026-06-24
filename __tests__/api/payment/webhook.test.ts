/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/webhook/route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// Mock supabase/orders module
// ---------------------------------------------------------------------------
const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(true)
const mockLogPayment = jest.fn().mockResolvedValue(true)
const mockGetOrderByPaymentOrderId = jest.fn()
const mockHasPaymentBeenLogged = jest.fn()

jest.mock('@/lib/supabase/orders', () => ({
  updateOrderPaymentStatus: (...args: any[]) => mockUpdateOrderPaymentStatus(...args),
  logPayment: (...args: any[]) => mockLogPayment(...args),
  getOrderByPaymentOrderId: (...args: any[]) => mockGetOrderByPaymentOrderId(...args),
  hasPaymentBeenLogged: (...args: any[]) => mockHasPaymentBeenLogged(...args),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const WEBHOOK_SECRET = 'webhook_secret_test'

function makeWebhookRequest(payload: object, secret = WEBHOOK_SECRET) {
  const body = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': sig,
    },
    body,
  })
}

function makeCapturedEvent(overrides: Record<string, any> = {}) {
  return {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_abc',
          order_id: 'order_rzp_xyz',
          amount: 229900, // paise
          method: 'upi',
          notes: {},
          ...overrides,
        },
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/payment/webhook', () => {
  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects request with missing signature', async () => {
    const body = JSON.stringify(makeCapturedEvent())
    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects request with invalid signature', async () => {
    const body = JSON.stringify(makeCapturedEvent())
    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_signature',
      },
      body,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('processes payment.captured and updates order by razorpay order id', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue({
      id: 'db-order-uuid',
      order_number: 'ORDER_1_1',
    })

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)

    // Should have called updateOrderPaymentStatus with the DB order id
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'db-order-uuid',
      'paid',
      'pay_test_abc',
      'order_rzp_xyz'
    )

    // Should have logged the payment
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'db-order-uuid',
        razorpay_order_id: 'order_rzp_xyz',
        razorpay_payment_id: 'pay_test_abc',
        amount: 2299,
      })
    )
  })

  it('skips update when payment was already logged (idempotency)', async () => {
    // hasPaymentBeenLogged returns true → already processed
    mockHasPaymentBeenLogged.mockResolvedValue(true)

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)

    // Must NOT update or log again
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
    expect(mockGetOrderByPaymentOrderId).not.toHaveBeenCalled()
  })

  it('uses notes.internal_order_id when present (skips getOrderByPaymentOrderId)', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)

    const event = makeCapturedEvent({ notes: { internal_order_id: 'direct-db-id' } })
    const req = makeWebhookRequest(event)
    const res = await POST(req)

    expect(res.status).toBe(200)
    // Should NOT have needed to look up by razorpay order id
    expect(mockGetOrderByPaymentOrderId).not.toHaveBeenCalled()
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'direct-db-id',
      'paid',
      'pay_test_abc',
      'order_rzp_xyz'
    )
  })

  it('does not update order when razorpay order id lookup finds nothing', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue(null)

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
  })

  it('ignores non-captured events (returns received: true without side effects)', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)

    const event = { event: 'payment.failed', payload: { payment: { entity: {} } } }
    const req = makeWebhookRequest(event)
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
  })
})
