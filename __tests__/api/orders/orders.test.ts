/**
 * @jest-environment node
 */
import crypto from 'crypto'
import { POST } from '@/app/api/orders/route'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mock products.json to use a controlled catalogue
// ---------------------------------------------------------------------------
jest.mock('@/lib/products.json', () => [
  { id: 'lamps-lamp1', price: 2299 },
  { id: 'organizers-organizer1', price: 1899 },
])

// ---------------------------------------------------------------------------
// Mock Supabase orders module directly (avoids complex Supabase client chaining)
// ---------------------------------------------------------------------------
const mockCreateOrder = jest.fn()
const mockUpdateOrderPaymentStatus = jest.fn().mockResolvedValue(true)
const mockLogPayment = jest.fn().mockResolvedValue(true)
const mockUpsertCustomerByPhone = jest.fn().mockResolvedValue('customer-uuid-789')

jest.mock('@/lib/supabase/orders', () => ({
  createOrder: (...args: any[]) => mockCreateOrder(...args),
  updateOrderPaymentStatus: (...args: any[]) => mockUpdateOrderPaymentStatus(...args),
  logPayment: (...args: any[]) => mockLogPayment(...args),
  upsertCustomerByPhone: (...args: any[]) => mockUpsertCustomerByPhone(...args),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_CUSTOMER = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  email: 'rahul@example.com',
  address: '12 Main Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
}

// The order-create route verifies the Razorpay signature with HMAC-SHA256 keyed
// on RAZORPAY_KEY_SECRET before it will mark an order 'paid'. Tests must sign
// with the SAME secret to exercise the genuine (secure) success path.
const TEST_RAZORPAY_SECRET = 'test_razorpay_key_secret'

/** Produce a valid Razorpay signature = HMAC_SHA256(order_id|payment_id). */
function signRazorpay(orderId: string, paymentId: string): string {
  return crypto
    .createHmac('sha256', TEST_RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // The route reads RAZORPAY_KEY_SECRET at request time to verify the payment
    // signature; set it so signRazorpay() produces a signature the route accepts.
    process.env.RAZORPAY_KEY_SECRET = TEST_RAZORPAY_SECRET
    mockCreateOrder.mockResolvedValue({
      order: { id: 'order-uuid-123', order_number: 'ORDER_123_456', total: 2299 },
      error: null,
    })
  })

  it('creates an order and overrides tampered client price with server price', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        {
          product_id: 'lamps-lamp1',
          product_name: 'Rustic Charm Lamp',
          price: 1, // tampered — server should use 2299
          quantity: 1,
        },
      ],
      subtotal: 1,
      shipping: 99,
      total: 100,
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.orderNumber).toBe('ORDER_123_456')

    // Verify the server-computed price was passed to createOrder, NOT the tampered price
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        // subtotal should be 2299 (server price for lamps-lamp1 × 1), not client's 1
        subtotal: 2299,
        total: 2299, // free shipping since 2299 > 999
        shipping: 0,
        items: expect.arrayContaining([
          expect.objectContaining({
            product_id: 'lamps-lamp1',
            price: 2299, // server-authoritative price
          }),
        ]),
      })
    )
  })

  it('rejects unknown product_id', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        {
          product_id: 'non-existent-product',
          product_name: 'Fake Product',
          price: 999,
          quantity: 1,
        },
      ],
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Invalid item in order')
    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('rejects missing customer name (Zod validation)', async () => {
    const req = makeRequest({
      customer: { phone: '9876543210', address: 'Test', city: 'Mumbai', state: 'MH', pincode: '400001' },
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('rejects phone not starting with 6-9', async () => {
    const req = makeRequest({
      customer: { ...VALID_CUSTOMER, phone: '1234567890' },
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects pincode that is not 6 digits', async () => {
    const req = makeRequest({
      customer: { ...VALID_CUSTOMER, pincode: '1234' },
      items: [{ product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 }],
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects empty items array', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [],
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('computes free shipping for subtotal > 999', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        {
          product_id: 'lamps-lamp1',
          product_name: 'Rustic Charm Lamp',
          price: 1,   // tampered
          quantity: 1,
        },
      ],
    })

    await POST(req)

    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ shipping: 0 }) // 2299 > 999 → free shipping
    )
  })

  it('upserts the customer by phone and links customer_id onto the order', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        { product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 },
      ],
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    // Customer is upserted from the order's contact details
    expect(mockUpsertCustomerByPhone).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '9876543210',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
      })
    )
    // The resolved customer id is linked onto the order
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ customer_id: 'customer-uuid-789' })
    )
  })

  it('still creates the order when customer upsert fails (never blocks a sale)', async () => {
    mockUpsertCustomerByPhone.mockResolvedValueOnce(null)
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        { product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 },
      ],
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ customer_id: null })
    )
  })

  it('marks paid and logs payment when the Razorpay signature is VALID', async () => {
    const signature = signRazorpay('order_rzp_test', 'pay_rzp_test')
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        { product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 },
      ],
      payment_method: 'razorpay',
      payment: {
        razorpay_order_id: 'order_rzp_test',
        razorpay_payment_id: 'pay_rzp_test',
        razorpay_signature: signature,
      },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith(
      'order-uuid-123',
      'paid',
      'pay_rzp_test',
      'order_rzp_test'
    )
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-uuid-123',
        razorpay_payment_id: 'pay_rzp_test',
        razorpay_order_id: 'order_rzp_test',
        razorpay_signature: signature,
        payment_status: 'paid',
      })
    )
  })

  it('SECURITY: leaves the order pending on a FORGED signature and logs it as failed', async () => {
    // A client-supplied signature that is NOT a valid HMAC of order|payment must
    // never mark an order paid — otherwise anyone could forge a free "paid" order.
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        { product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 },
      ],
      payment_method: 'razorpay',
      payment: {
        razorpay_order_id: 'order_rzp_test',
        razorpay_payment_id: 'pay_rzp_test',
        razorpay_signature: 'forged_signature_not_a_real_hmac',
      },
    })

    const res = await POST(req)
    // The order is still created (200) — it just stays 'pending' until the
    // HMAC-verified webhook reconciles a genuinely-captured payment.
    expect(res.status).toBe(200)
    expect(mockUpdateOrderPaymentStatus).not.toHaveBeenCalled()
    expect(mockLogPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-uuid-123',
        payment_status: 'failed',
      })
    )
  })
})
