import { z } from 'zod'
import {
  ITEM_DELIVERED_STATUSES,
  PRINT_STATUSES,
  SHEET_PAYMENT_STATUSES,
  defaultCollectedForPaymentStatus,
  lineTotal,
} from '@/lib/offline-orders'

const optionalPhone = z
  .string()
  .optional()
  .transform((value) => (value ?? '').replace(/\s+/g, '').replace(/^\+91/, ''))
  .transform((value) => (value === '' ? undefined : value))
  .pipe(
    z
      .string()
      .regex(/^[6-9]\d{9}$/, 'phone must be a valid 10-digit Indian mobile number')
      .optional()
  )

export const createOfflineOrderSchema = z
  .object({
    product_name: z.string().trim().min(1, 'Product Name is required').max(255),
    customer_name: z.string().trim().min(1, 'Customer Name is required').max(255),
    order_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Order Date must be YYYY-MM-DD'),
    print_status: z.enum(PRINT_STATUSES),
    payment_status: z.enum(SHEET_PAYMENT_STATUSES),
    item_delivered: z.enum(ITEM_DELIVERED_STATUSES),
    quantity: z.number().int().gt(0, 'Quantity must be at least 1').lte(10_000),
    cost: z.number().min(0).max(1_000_000).optional(),
    price: z.number().gt(0, 'Price must be positive').lte(1_000_000),
    total: z.number().gt(0).lte(1_000_000).optional(),
    amount_collected: z.number().min(0).max(1_000_000).optional(),
    customer_phone: optionalPhone,
    notes: z.string().trim().max(2000).optional(),
  })
  .transform((input) => {
    const total = input.total ?? lineTotal(input.price, input.quantity)
    const amount_collected = defaultCollectedForPaymentStatus({
      sheetPayment: input.payment_status,
      total,
      collected: input.amount_collected,
    })
    return { ...input, total, amount_collected }
  })
  .refine((input) => input.amount_collected <= input.total, {
    message: 'Payment Recieved cannot exceed Total',
    path: ['amount_collected'],
  })

export type CreateOfflineOrderInput = z.infer<typeof createOfflineOrderSchema>
