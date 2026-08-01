import { z } from 'zod'

/**
 * Schema for creating a Razorpay order via /api/payment/create-order.
 *
 * Amount is in whole rupees (checkout UI). The server converts to paise
 * (×100) before calling Razorpay. Minimum charge is ₹1 (100 paise).
 */
export const createRazorpayOrderSchema = z.object({
  amount: z
    .number({ required_error: 'amount is required', invalid_type_error: 'amount must be a number' })
    .int('amount must be an integer (rupees)')
    .gte(1, 'amount must be at least ₹1 (100 paise)')
    .lte(100_000, 'amount exceeds maximum allowed value'),
  currency: z.enum(['INR']).optional().default('INR'),
  customer: z.object({
    name: z.string().max(100).optional(),
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

/** @deprecated Use createRazorpayOrderSchema — kept as alias during Cashfree→Razorpay cutover. */
export const createCashfreeOrderSchema = createRazorpayOrderSchema

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>

/**
 * Schema for a single cart item in a customer order
 */
const orderItemSchema = z.object({
  product_id: z.string().min(1, 'product_id is required'),
  product_name: z.string().min(1, 'product_name is required'),
  product_image: z.string().optional(),
  product_variant: z.string().optional(),
  price: z.number().gt(0, 'price must be positive'),
  quantity: z.number().int().gt(0, 'quantity must be a positive integer'),
})

/**
 * Schema for customer information
 */
const customerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  phone: z
    .string()
    .transform(v => v.replace(/\s+/g, '').replace(/^\+91/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'phone must be a valid 10-digit Indian mobile number')),
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
 * Payment proof from Razorpay Standard Checkout.
 * Signature is re-verified server-side before marking paid.
 */
const paymentSchema = z
  .object({
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    // Legacy Cashfree field — accepted but ignored by the Razorpay money path.
    cashfree_order_id: z.string().optional(),
  })
  .optional()

/**
 * Full schema for POST /api/orders
 */
export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, 'order must have at least one item'),
  subtotal: z.number().optional(),
  shipping: z.number().optional(),
  total: z.number().optional(),
  payment_method: z.enum(['razorpay', 'cashfree', 'cod']).optional().default('razorpay'),
  couponCode: z.string().trim().max(50).optional(),
  payment: paymentSchema,
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
