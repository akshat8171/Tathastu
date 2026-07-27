import { z } from 'zod'

/**
 * Schema for creating a Cashfree order via /api/payment/create-order.
 *
 * Cashfree requires customer_details (at minimum a phone) at order-create time,
 * unlike Razorpay which only needed the amount. Amount is sent in rupees.
 */
export const createCashfreeOrderSchema = z.object({
  amount: z
    .number({ required_error: 'amount is required', invalid_type_error: 'amount must be a number' })
    .int('amount must be an integer (rupees)')
    .gt(0, 'amount must be greater than 0')
    .lte(100_000, 'amount exceeds maximum allowed value'), // 1 lakh rupees
  currency: z.enum(['INR']).optional().default('INR'),
  customer: z.object({
    name: z.string().max(100).optional(),
    // Accept phone with or without +91; require a 10-digit Indian mobile.
    phone: z
      .string()
      .transform(v => v.replace(/\s+/g, '').replace(/^\+91/, ''))
      .pipe(z.string().regex(/^[6-9]\d{9}$/, 'phone must be a valid 10-digit Indian mobile number')),
    email: z
      .string()
      .refine(v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
        message: 'email must be a valid email address',
      })
      .optional()
      .default(''),
  }),
})

export type CreateCashfreeOrderInput = z.infer<typeof createCashfreeOrderSchema>

/**
 * Schema for a single cart item in a customer order
 */
const orderItemSchema = z.object({
  product_id: z.string().min(1, 'product_id is required'),
  product_name: z.string().min(1, 'product_name is required'),
  product_image: z.string().optional(),
  product_variant: z.string().optional(),
  // Client-sent price/quantity (server will re-price; still validated for shape)
  price: z.number().gt(0, 'price must be positive'),
  quantity: z.number().int().gt(0, 'quantity must be a positive integer'),
})

/**
 * Schema for customer information
 */
const customerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  // Accept phone with or without country code (+91); require 10 digits starting 6-9
  phone: z
    .string()
    .transform(v => v.replace(/\s+/g, '').replace(/^\+91/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'phone must be a valid 10-digit Indian mobile number')),
  // email is MANDATORY: it is the identity key that maps a (guest) order to the
  // account the customer later creates via Google or email/password. Normalized
  // to trimmed-lowercase so the same address always matches, regardless of how
  // the shopper typed it at checkout vs. how their auth provider stored it.
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email must be a valid email address'),
  address: z.string().min(1, 'address is required'),
  city: z.string().min(1, 'city is required'),
  state: z.string().min(1, 'state is required'),
  pincode: z.string().regex(/^\d{6}$/, 'pincode must be a 6-digit number'),
})

/**
 * Optional payment reference from Cashfree (included after the checkout modal
 * completes). This is NOT proof of payment — the server re-fetches the order
 * status from Cashfree before marking the order paid.
 */
const paymentSchema = z
  .object({
    cashfree_order_id: z.string().optional(),
  })
  .optional()

/**
 * Full schema for POST /api/orders
 */
export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, 'order must have at least one item'),
  // These client-sent totals are IGNORED on the server (server recomputes);
  // we keep them in the schema for documentation / shape validation only.
  subtotal: z.number().optional(),
  shipping: z.number().optional(),
  total: z.number().optional(),
  // Payment method the customer chose. 'cashfree' (default, online) carries a
  // cashfree_order_id the server re-verifies; 'cod' (Cash on Delivery) creates a
  // pending order with no proof. Anything else is rejected.
  payment_method: z.enum(['cashfree', 'cod']).optional().default('cashfree'),
  // Optional coupon code; the server re-validates and recomputes the discount
  // (client-sent discount is never trusted).
  couponCode: z.string().trim().max(50).optional(),
  payment: paymentSchema,
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
