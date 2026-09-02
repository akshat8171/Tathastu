export const CUSTOM_QUOTE_PRODUCT_ID = 'custom-quote'
export const QUOTE_ID_NOTE_PREFIX = 'quote_id='
const PLACEHOLDER_PHONE = '0000000000'

export function customQuoteProductName(type: string): string {
  const label = type.replace(/_/g, ' ').trim() || 'print'
  return `Custom ${label}`
}

export function quoteOrderNotes(quoteId: string, type: string, description?: string | null): string {
  const body = [`${QUOTE_ID_NOTE_PREFIX}${quoteId}`, `Custom ${type} request`]
  if (description?.trim()) body.push(description.trim())
  return body.join('\n').slice(0, 2000)
}

export function quoteIdFromNotes(notes: string | null | undefined): string | null {
  const match = (notes ?? '').match(/quote_id=([0-9a-f-]{36})/i)
  return match?.[1] ?? null
}

export function quoteCustomerPhone(phone?: string | null): string {
  const trimmed = phone?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : PLACEHOLDER_PHONE
}
