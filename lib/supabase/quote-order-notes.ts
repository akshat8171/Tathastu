export const CUSTOM_QUOTE_PRODUCT_ID = 'custom-quote'
export const QUOTE_ID_NOTE_PREFIX = 'quote_id='
const PLACEHOLDER_PHONE = '0000000000'
const MIN_QUOTED_PRICE_RUPEES = 1
const MAX_QUOTED_PRICE_RUPEES = 1_000_000

export function parseQuotedPriceRupees(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/[,₹\s]/g, ''))
  if (!Number.isFinite(numeric)) return null
  const rupees = Math.round(numeric)
  if (rupees < MIN_QUOTED_PRICE_RUPEES || rupees > MAX_QUOTED_PRICE_RUPEES) return null
  return rupees
}

export function requireQuotedPrice(
  raw: unknown
): { ok: true; price: number } | { ok: false; error: string } {
  const price = parseQuotedPriceRupees(raw)
  if (price === null) {
    return { ok: false, error: 'Enter a quote of at least ₹1 before creating the order' }
  }
  return { ok: true, price }
}

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
