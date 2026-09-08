import 'server-only'

import { createOrder, upsertCustomerByPhone } from './orders'
import type { Order } from './client'
import {
  OFFLINE_PLACEHOLDER_EMAIL,
  OFFLINE_PLACEHOLDER_PHONE,
  OFFLINE_PRODUCT_ID,
  deriveOrderStatus,
  derivePaymentStatus,
  orderDateToIso,
  paymentPendingAmount,
} from '@/lib/offline-orders'
import type { CreateOfflineOrderInput } from '@/lib/validation/offline-order'

export async function createOfflineOrder(
  input: CreateOfflineOrderInput
): Promise<{ order: Order | null; error: unknown }> {
  const phone = input.customer_phone ?? OFFLINE_PLACEHOLDER_PHONE
  const customerId = input.customer_phone
    ? await upsertCustomerByPhone({
        phone: input.customer_phone,
        name: input.customer_name,
      })
    : null

  const status = deriveOrderStatus({
    printStatus: input.print_status,
    itemDelivered: input.item_delivered,
  })
  const paymentStatus = derivePaymentStatus(input.payment_status)
  const pending = paymentPendingAmount(input.total, input.amount_collected)
  const notes = [
    input.notes?.trim(),
    pending > 0 ? `Payment Pending: ₹${pending}` : null,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 2000)

  return createOrder({
    customer_name: input.customer_name,
    customer_email: OFFLINE_PLACEHOLDER_EMAIL,
    customer_phone: phone,
    customer_id: customerId,
    items: [
      {
        product_id: OFFLINE_PRODUCT_ID,
        product_name: input.product_name,
        price: input.price,
        quantity: input.quantity,
      },
    ],
    subtotal: input.total,
    total: input.total,
    payment_method: 'cod',
    payment_status: paymentStatus,
    status,
    channel: 'offline',
    print_status: input.print_status,
    item_delivered: input.item_delivered,
    cost: input.cost ?? null,
    amount_collected: input.amount_collected,
    offline_payment_status: input.payment_status,
    created_at: orderDateToIso(input.order_date),
    notes: notes || undefined,
  })
}
