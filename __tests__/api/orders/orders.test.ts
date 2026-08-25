/**
 * @jest-environment node
 */
import { POST } from '@/app/api/orders/route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

jest.mock('@/lib/products.json', () => [
  { id: 'lamps-lamp1', price: 2299 },
  { id: 'organizers-organizer1', price: 1899 },
])

jest.mock('@/lib/catalog/store', () => ({
  getCatalogProducts: jest.fn().mockResolvedValue([
    { id: 'lamps-lamp1', price: 2299 },
    { id: 'organizers-organizer1', price: 1899 },
  ]),
}))

const mockCreateOrder = jest.fn()
const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(true)
const mockLogPayment = jest.fn().mockResolvedValue(true)
const mockUpsertCustomerByPhone = jest.fn().mockResolvedValue('customer-uuid-789')

jest.mock('@/lib/supabase/orders', () => ({
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
  updateOrderPaymentStatus: (...args: unknown[]) => mockUpdateOrderPaymentStatus(...args),
  logPayment: (...args: unknown[]) => mockLogPayment(...args),
  upsertCustomerByPhone: (...args: unknown[]) => mockUpsertCustomerByPhone(...args),
}))

const mockVerifySignature = jest.fn()
const mockConfirmAmount = jest.fn()

jest.mock('@/lib/razorpay-server', () => ({
  verifyRazorpayPaymentSignature: (...args: unknown[]) => mockVerifySignature(...args),
  confirmRazorpayPaymentAmount: (...args: unknown[]) => mockConfirmAmount(...args),
}))

jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
}))

const SECRET = 'test_secret'
const VALID_CUSTOMER = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  email: 'rahul@example.com',
  address: '12 Main Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
}

function makePayment(orderId = 'order_test', paymentId = 'pay_test') {
  const signature = crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex')
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  }
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RAZORPAY_KEY_SECRET = SECRET
    mockCreateOrder.mockResolvedValue({
      order: { id: 'order-uuid-123', order_number: 'ORDER_123_456', total: 2299 },
      error: null,
    })
    mockVerifySignature.mockReturnValue(true)
    mockConfirmAmount.mockResolvedValue({ ok: true, method: 'upi', amountPaise: 229900 })
  })

  it('creates an order and overrides tampered client price with server price', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        {
          product_id: 'lamps-lamp1',
          product_name: 'Rustic Charm Lamp',
          price: 1,
          quantity: 1,
        },
      ],
      payment_method: 'cod',
    })

    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 2299,
        items: [expect.objectContaining({ price: 2299 })],
      })
    )
  })

  it('still creates the order when customer upsert fails (never blocks a sale)', async () => {
    mockUpsertCustomerByPhone.mockResolvedValueOnce(null)
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
      payment_method: 'cod',
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockCreateOrder).toHaveBeenCalledWith(expect.objectContaining({ customer_id: null }))
  })

  it('marks paid and logs payment when Razorpay signature + amount confirm', async () => {
    const payment = makePayment('order_test', 'pay_55501')
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
      payment_method: 'razorpay',
      payment,
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'order-uuid-123',
      'paid',
      'pay_55501',
      'order_test'
    )
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-uuid-123',
        razorpay_order_id: 'order_test',
        razorpay_payment_id: 'pay_55501',
        payment_status: 'paid',
      })
    )
  })

  it('SECURITY: leaves order pending when signature is invalid', async () => {
    mockVerifySignature.mockReturnValueOnce(false)
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
      payment_method: 'razorpay',
      payment: makePayment(),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-uuid-123',
        payment_status: 'failed',
      })
    )
  })

  it('SECURITY: leaves order pending when amount does not match', async () => {
    mockConfirmAmount.mockResolvedValueOnce({ ok: false, amountPaise: 100 })
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
      payment_method: 'razorpay',
      payment: makePayment(),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({ order_id: 'order-uuid-123', payment_status: 'failed' })
    )
  })
})
