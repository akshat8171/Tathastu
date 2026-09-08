/**
 * @jest-environment node
 */

import {
  defaultCollectedForPaymentStatus,
  deriveOrderStatus,
  derivePaymentStatus,
  lineTotal,
  orderDateToIso,
  paymentPendingAmount,
} from '@/lib/offline-orders'
import { createOfflineOrderSchema } from '@/lib/validation/offline-order'

describe('offline order mapping', () => {
  it('maps print + delivery to storefront status', () => {
    expect(deriveOrderStatus({ printStatus: 'Cancelled', itemDelivered: 'Not started' })).toBe('cancelled')
    expect(deriveOrderStatus({ printStatus: 'Not Started', itemDelivered: 'Delivered' })).toBe('delivered')
    expect(deriveOrderStatus({ printStatus: 'Completed', itemDelivered: 'Packed' })).toBe('shipped')
    expect(deriveOrderStatus({ printStatus: 'In Progress', itemDelivered: 'Not started' })).toBe('processing')
    expect(deriveOrderStatus({ printStatus: 'Not Started', itemDelivered: 'Not started' })).toBe('pending')
  })

  it('keeps the sheet Payment Recieved spelling when mapping to paid', () => {
    expect(derivePaymentStatus('Payment Recieved')).toBe('paid')
    expect(derivePaymentStatus('Payment Pending')).toBe('pending')
    expect(derivePaymentStatus('Partial')).toBe('pending')
    expect(derivePaymentStatus('Refunded')).toBe('refunded')
  })

  it('computes totals and pending cash', () => {
    expect(lineTotal(199, 2)).toBe(398)
    expect(paymentPendingAmount(500, 200)).toBe(300)
    expect(defaultCollectedForPaymentStatus({ sheetPayment: 'Payment Recieved', total: 500 })).toBe(500)
    expect(defaultCollectedForPaymentStatus({ sheetPayment: 'Payment Pending', total: 500 })).toBe(0)
  })

  it('stores order date as IST midnight', () => {
    expect(orderDateToIso('2026-09-08')).toBe('2026-09-08T00:00:00+05:30')
  })
})

describe('createOfflineOrderSchema', () => {
  const valid = {
    product_name: 'Name rakhi',
    customer_name: 'Aryan',
    order_date: '2026-09-08',
    print_status: 'Not Started',
    payment_status: 'Payment Pending',
    item_delivered: 'Not started',
    quantity: 1,
    price: 299,
  }

  it('accepts the Organized Products fields and fills Total / Payment Recieved', () => {
    const parsed = createOfflineOrderSchema.parse(valid)
    expect(parsed.total).toBe(299)
    expect(parsed.amount_collected).toBe(0)
  })

  it('defaults Payment Recieved amount to Total', () => {
    const parsed = createOfflineOrderSchema.parse({
      ...valid,
      payment_status: 'Payment Recieved',
    })
    expect(parsed.amount_collected).toBe(299)
  })

  it('rejects collected cash above Total', () => {
    const parsed = createOfflineOrderSchema.safeParse({
      ...valid,
      amount_collected: 400,
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts a valid optional phone and rejects a bad one', () => {
    expect(createOfflineOrderSchema.parse({ ...valid, customer_phone: '9876543210' }).customer_phone).toBe(
      '9876543210'
    )
    expect(createOfflineOrderSchema.safeParse({ ...valid, customer_phone: '123' }).success).toBe(false)
  })
})
