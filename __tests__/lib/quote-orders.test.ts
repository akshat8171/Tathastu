/**
 * @jest-environment node
 */

import {
  customQuoteProductName,
  quoteCustomerPhone,
  quoteIdFromNotes,
  quoteOrderNotes,
  requireQuotedPrice,
} from '@/lib/supabase/quote-order-notes'
import { quotePriceWhatsAppText } from '@/lib/admin/links'

describe('customQuoteProductName', () => {
  it('turns a quote type into a customer-facing line item', () => {
    expect(customQuoteProductName('keychain')).toBe('Custom keychain')
    expect(customQuoteProductName('bulk_order')).toBe('Custom bulk order')
  })
})

describe('quoteOrderNotes', () => {
  it('embeds the quote id so backfill can find an existing order', () => {
    const notes = quoteOrderNotes('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'portrait', 'A photo rakhi')
    expect(quoteIdFromNotes(notes)).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
    expect(notes).toContain('A photo rakhi')
  })

  it('returns null when notes have no quote id', () => {
    expect(quoteIdFromNotes('plain checkout notes')).toBeNull()
  })
})

describe('quoteCustomerPhone', () => {
  it('keeps a provided phone and uses a placeholder when missing', () => {
    expect(quoteCustomerPhone('9876543210')).toBe('9876543210')
    expect(quoteCustomerPhone('')).toBe('0000000000')
    expect(quoteCustomerPhone(undefined)).toBe('0000000000')
  })
})

describe('requireQuotedPrice', () => {
  it('rejects missing, zero, and non-numeric values', () => {
    expect(requireQuotedPrice(null).ok).toBe(false)
    expect(requireQuotedPrice(0).ok).toBe(false)
    expect(requireQuotedPrice('abc').ok).toBe(false)
  })

  it('accepts whole rupees from numbers or formatted strings', () => {
    expect(requireQuotedPrice(499)).toEqual({ ok: true, price: 499 })
    expect(requireQuotedPrice('1,299')).toEqual({ ok: true, price: 1299 })
    expect(requireQuotedPrice('₹ 350')).toEqual({ ok: true, price: 350 })
  })
})

describe('quotePriceWhatsAppText', () => {
  it('includes the rupee amount for the customer', () => {
    expect(quotePriceWhatsAppText('Aryan', 'keychain', 499)).toContain('₹499')
    expect(quotePriceWhatsAppText('Aryan', 'keychain', 499)).toContain('keychain')
  })
})
