/**
 * Offline workshop orders — field names and allowed values match the
 * "Organized Products" tab on the Layerix cost sheet:
 * Product Name, Customer Name, Order Date, Print Status, Payment Status,
 * Item Delivered, Quantity, Cost, Price, Total, Payment Recieved, Payment Pending.
 *
 * "Payment Recieved" is the sheet spelling and is kept on purpose so dropdowns
 * match what the workshop already types.
 */

export const ORDER_CHANNELS = ['online', 'offline'] as const
export type OrderChannel = (typeof ORDER_CHANNELS)[number]

export const PRINT_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'Cancelled',
  'On hold',
] as const
export type PrintStatus = (typeof PRINT_STATUSES)[number]

export const SHEET_PAYMENT_STATUSES = [
  'Payment Pending',
  'Payment Recieved',
  'Partial',
  'Refunded',
] as const
export type SheetPaymentStatus = (typeof SHEET_PAYMENT_STATUSES)[number]

export const ITEM_DELIVERED_STATUSES = ['Not started', 'Delivered', 'Packed'] as const
export type ItemDeliveredStatus = (typeof ITEM_DELIVERED_STATUSES)[number]

export const OFFLINE_PRODUCT_ID = 'offline-order'
export const OFFLINE_PLACEHOLDER_PHONE = '0000000000'
export const OFFLINE_PLACEHOLDER_EMAIL = 'offline@tathastukeepsakes.in'

export type StorefrontOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export function isOrderChannel(value: string): value is OrderChannel {
  return (ORDER_CHANNELS as readonly string[]).includes(value)
}

export function lineTotal(price: number, quantity: number): number {
  return Math.round(price * quantity * 100) / 100
}

export function paymentPendingAmount(total: number, collected: number): number {
  return Math.round(Math.max(0, total - collected) * 100) / 100
}

export function defaultCollectedForPaymentStatus(input: {
  sheetPayment: SheetPaymentStatus
  total: number
  collected?: number
}): number {
  if (typeof input.collected === 'number') return input.collected
  if (input.sheetPayment === 'Payment Recieved') return input.total
  return 0
}

export function deriveOrderStatus(input: {
  printStatus: PrintStatus
  itemDelivered: ItemDeliveredStatus
}): StorefrontOrderStatus {
  if (input.printStatus === 'Cancelled') return 'cancelled'
  if (input.itemDelivered === 'Delivered') return 'delivered'
  if (input.itemDelivered === 'Packed') return 'shipped'
  if (input.printStatus === 'In Progress' || input.printStatus === 'Completed') return 'processing'
  return 'pending'
}

export function derivePaymentStatus(sheetPayment: SheetPaymentStatus): StorefrontPaymentStatus {
  if (sheetPayment === 'Payment Recieved') return 'paid'
  if (sheetPayment === 'Refunded') return 'refunded'
  return 'pending'
}

export function orderDateToIso(orderDate: string): string {
  return `${orderDate}T00:00:00+05:30`
}

export function channelBadgeClass(channel: string | null | undefined): string {
  if (channel === 'offline') return 'bg-amber-100 text-amber-800'
  return 'bg-sky-100 text-sky-800'
}
