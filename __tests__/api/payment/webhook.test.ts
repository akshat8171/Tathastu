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
// Helpers — Cashfree signs base64(HMAC_SHA256(timestamp + rawBody)) with the secret
// ---------------------------------------------------------------------------
const WEBHOOK_SECRET = 'webhook_secret_test'
const TIMESTAMP = '1700000000000'

function makeWebhookRequest(payload: object, secret = WEBHOOK_SECRET, timestamp = TIMESTAMP) {
  const body = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(`${timestamp}${body}`).digest('base64')
  return new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': sig,
      'x-webhook-timestamp': timestamp,
    },
    body,
  })
}

function makeSuccessEvent(overrides: { order?: Record<string, any>; payment?: Record<string, any> } = {}) {
  return {
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: { order_id: 'cf_order_xyz', order_amount: 2299, order_currency: 'INR', ...overrides.order },
      payment: {
        cf_payment_id: 987654,
        payment_status: 'SUCCESS',
        payment_amount: 2299,
        payment_group: 'upi',
        ...overrides.payment,
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/payment/webhook', () => {
  beforeAll(() => {
    process.env.CASHFREE_SECRET_KEY = WEBHOOK_SECRET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects request with missing signature headers', async () => {
    const body = JSON.stringify(makeSuccessEvent())
    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects request with invalid signature', async () => {
    const body = JSON.stringify(makeSuccessEvent())
    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'invalid_signature',
        'x-webhook-timestamp': TIMESTAMP,
      },
      body,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('processes PAYMENT_SUCCESS_WEBHOOK and updates order by cashfree order id', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue({ id: 'db-order-uuid', order_number: 'ORDER_1_1' })

    const req = makeWebhookRequest(makeSuccessEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)

    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'db-order-uuid',
      'paid',
      '987654',
      'cf_order_xyz'
    )
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'db-order-uuid',
        cashfree_order_id: 'cf_order_xyz',
        cashfree_payment_id: '987654',
        amount: 2299,
      })
    )
  })

  it('skips update when payment was already logged (idempotency)', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(true)

    const req = makeWebhookRequest(makeSuccessEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
    expect(mockGetOrderByPaymentOrderId).not.toHaveBeenCalled()
  })

  it('does not update when the cashfree order id lookup finds nothing', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue(null)

    const req = makeWebhookRequest(makeSuccessEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
  })

  it('ignores non-success events (returns received: true without side effects)', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)

    const event = { type: 'PAYMENT_FAILED_WEBHOOK', data: { order: {}, payment: {} } }
    const req = makeWebhookRequest(event)
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
  })
})
