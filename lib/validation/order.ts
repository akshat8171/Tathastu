import { z } from 'zod'

/**
 * Schema for creating a Razorpay order via /api/payment/create-order
 */
export const createRazorpayOrderSchema = z.object({
  // amount in rupees (client sends rupees; the route multiplies by 100 when calling Razorpay)
  amount: z
    .number({ required_error: 'amount is required', invalid_type_error: 'amount must be a number' })
    .int('amount must be an integer (rupees)')
    .gt(0, 'amount must be greater than 0')
    .lte(100_000, 'amount exceeds maximum allowed value'), // 1 lakh rupees
  currency: z.enum(['INR']).optional().default('INR'),
  receipt: z.string().max(40).optional(),
  notes: z.record(z.string()).optional(),
})

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>

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
  // email is optional; if provided must be empty string or valid email
  email: z
    .string()
    .refine(v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'email must be a valid email address',
    })
    .optional()
    .default(''),
  address: z.string().min(1, 'address is required'),
  city: z.string().min(1, 'city is required'),
  state: z.string().min(1, 'state is required'),
  pincode: z.string().regex(/^\d{6}$/, 'pincode must be a 6-digit number'),
})

/**
 * Optional payment proof from Razorpay (included after successful payment)
 */
const paymentSchema = z
  .object({
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
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
  // Payment method the customer chose. 'razorpay' (default, online) requires a
  // payment proof; 'cod' (Cash on Delivery) creates a pending order with no
  // proof. Anything else is rejected.
  payment_method: z.enum(['razorpay', 'cod']).optional().default('razorpay'),
  // Optional coupon code; the server re-validates and recomputes the discount
  // (client-sent discount is never trusted).
  couponCode: z.string().trim().max(50).optional(),
  payment: paymentSchema,
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
