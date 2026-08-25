/**
 * @jest-environment node
 */

import { getPostLoginPath } from '@/lib/auth/post-login-path'
import { isAllowlistedAdminEmail, normalizeAdminEmail } from '@/lib/auth/admin-emails'
import {
  customerWhatsAppUrl,
  getSiteUrl,
  orderConfirmationUrl,
  quoteCustomerWhatsAppText,
  customerTrackingWhatsAppText,
} from '@/lib/admin/links'
import { isQuoteStorageDisabled } from '@/lib/supabase/quote-storage-flag'

describe('getPostLoginPath', () => {
  it('sends admins to /admin by default', () => {
    expect(getPostLoginPath(true, '/account')).toBe('/admin')
  })

  it('honors admin deep links', () => {
    expect(getPostLoginPath(true, '/admin/orders/abc')).toBe('/admin/orders/abc')
  })

  it('leaves customers on next', () => {
    expect(getPostLoginPath(false, '/account')).toBe('/account')
    expect(getPostLoginPath(false, '/checkout')).toBe('/checkout')
  })
})

describe('isAllowlistedAdminEmail', () => {
  const previous = process.env.ADMIN_EMAILS

  afterEach(() => {
    if (previous === undefined) delete process.env.ADMIN_EMAILS
    else process.env.ADMIN_EMAILS = previous
  })

  it('falls back to the store owner address', () => {
    delete process.env.ADMIN_EMAILS
    expect(isAllowlistedAdminEmail('tathastukeepsakes@gmail.com')).toBe(true)
    expect(isAllowlistedAdminEmail('customer@example.com')).toBe(false)
  })

  it('is case-insensitive', () => {
    delete process.env.ADMIN_EMAILS
    expect(normalizeAdminEmail('  Owner@X.com ')).toBe('owner@x.com')
    expect(isAllowlistedAdminEmail('TathastuKeepsakes@gmail.com')).toBe(true)
  })
})

describe('admin links', () => {
  it('builds a confirmation URL', () => {
    expect(orderConfirmationUrl('TK-1001')).toContain('/order-confirmation/TK-1001')
  })

  it('builds a customer WhatsApp link from a 10-digit Indian number', () => {
    const url = customerWhatsAppUrl('9154892790', 'Hello')
    expect(url).toBe('https://wa.me/919154892790?text=Hello')
  })

  it('returns null for incomplete phones', () => {
    expect(customerWhatsAppUrl('123', 'Hi')).toBeNull()
  })

  it('includes the customer name in quote WhatsApp copy', () => {
    expect(quoteCustomerWhatsAppText('Sanskrati', 'portrait')).toContain('Sanskrati')
  })

  it('builds shipped tracking copy', () => {
    expect(customerTrackingWhatsAppText('TK-9', 'AWB123')).toContain('AWB123')
  })

  it('strips trailing slash from site URL', () => {
    expect(getSiteUrl().endsWith('/')).toBe(false)
  })
})

describe('isQuoteStorageDisabled', () => {
  const previous = process.env.QUOTE_STORAGE_ENABLED

  afterEach(() => {
    if (previous === undefined) delete process.env.QUOTE_STORAGE_ENABLED
    else process.env.QUOTE_STORAGE_ENABLED = previous
  })

  it('defaults to enabled when unset', () => {
    delete process.env.QUOTE_STORAGE_ENABLED
    expect(isQuoteStorageDisabled()).toBe(false)
  })

  it('is disabled only for explicit falsey values', () => {
    process.env.QUOTE_STORAGE_ENABLED = 'false'
    expect(isQuoteStorageDisabled()).toBe(true)
    process.env.QUOTE_STORAGE_ENABLED = 'true'
    expect(isQuoteStorageDisabled()).toBe(false)
  })
})
