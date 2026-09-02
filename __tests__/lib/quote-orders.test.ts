/**
 * @jest-environment node
 */

import {
  customQuoteProductName,
  quoteCustomerPhone,
  quoteIdFromNotes,
  quoteOrderNotes,
} from '@/lib/supabase/quote-order-notes'

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
