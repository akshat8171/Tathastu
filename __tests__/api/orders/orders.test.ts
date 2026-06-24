/**
 * @jest-environment node
 */
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

jest.mock('@/lib/supabase/orders', () => ({
  createOrder: (...args: any[]) => mockCreateOrder(...args),
  updateOrderPaymentStatus: (...args: any[]) => mockUpdateOrderPaymentStatus(...args),
  logPayment: (...args: any[]) => mockLogPayment(...args),
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

  it('logs payment when razorpay_payment_id is provided', async () => {
    const req = makeRequest({
      customer: VALID_CUSTOMER,
      items: [
        { product_id: 'lamps-lamp1', product_name: 'Lamp', price: 2299, quantity: 1 },
      ],
      payment: {
        razorpay_order_id: 'order_rzp_test',
        razorpay_payment_id: 'pay_rzp_test',
        razorpay_signature: 'sig_test',
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
        razorpay_signature: 'sig_test',
      })
    )
  })
})
