/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment/webhook/route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(true)
const mockLogPayment = jest.fn().mockResolvedValue(true)
const mockGetOrderByPaymentOrderId = jest.fn()
const mockHasPaymentBeenLogged = jest.fn()

jest.mock('@/lib/supabase/orders', () => ({
  updateOrderPaymentStatus: (...args: unknown[]) => mockUpdateOrderPaymentStatus(...args),
  logPayment: (...args: unknown[]) => mockLogPayment(...args),
  getOrderByPaymentOrderId: (...args: unknown[]) => mockGetOrderByPaymentOrderId(...args),
  hasPaymentBeenLogged: (...args: unknown[]) => mockHasPaymentBeenLogged(...args),
}))

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

function makeCapturedEvent() {
  return {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_987654',
          order_id: 'order_xyz',
          amount: 229900,
          method: 'upi',
          status: 'captured',
        },
      },
    },
  }
}

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

  it('processes payment.captured and updates order', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue({ id: 'db-order-uuid', order_number: 'ORDER_1_1' })

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'db-order-uuid',
      'paid',
      'pay_987654',
      'order_xyz'
    )
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'db-order-uuid',
        razorpay_order_id: 'order_xyz',
        razorpay_payment_id: 'pay_987654',
        amount: 2299,
      })
    )
  })

  it('skips update when payment was already logged (idempotency)', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(true)

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).not.toHaveBeenCalled()
  })

  it('does not update when order lookup finds nothing', async () => {
    mockHasPaymentBeenLogged.mockResolvedValue(false)
    mockGetOrderByPaymentOrderId.mockResolvedValue(null)

    const req = makeWebhookRequest(makeCapturedEvent())
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
  })

  it('ignores non-captured events', async () => {
    const event = { event: 'payment.failed', payload: { payment: { entity: {} } } }
    const req = makeWebhookRequest(event)
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
  })
})
