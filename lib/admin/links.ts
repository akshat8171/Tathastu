import { Config } from '@/lib/config'
import { waLink } from '@/lib/site'

export function getSiteUrl(): string {
  return Config.appUrl
}

export function orderConfirmationUrl(orderNumber: string): string {
  return `${getSiteUrl()}/order-confirmation/${encodeURIComponent(orderNumber)}`
}

export function adminOrderUrl(orderId: string): string {
  return `${getSiteUrl()}/admin/orders/${encodeURIComponent(orderId)}`
}

export function customerWhatsAppUrl(phone: string | null | undefined, text: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (digits.length < 10) return null
  const e164 = digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, '')
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`
}

export function orderCustomerWhatsAppText(orderNumber: string, status: string): string {
  return `Hi, this is Tathastu Keepsakes regarding your order ${orderNumber} (status: ${status}). ${orderConfirmationUrl(orderNumber)}`
}

export function customerTrackingWhatsAppText(orderNumber: string, trackingNumber: string): string {
  return `Your Tathastu Keepsakes order ${orderNumber} has shipped. Tracking number: ${trackingNumber}`
}

export function shopWhatsAppForOrder(orderNumber: string): string {
  return waLink(`Internal note: follow up on order ${orderNumber}`)
}

export function quoteCustomerWhatsAppText(name: string, type: string): string {
  return `Hi ${name}, this is Tathastu Keepsakes. We received your ${type.replace(/_/g, ' ')} request and will share a quote shortly.`
}
