/**
 * Login identifier detection + phone normalization — the single source of truth.
 *
 * The login form accepts ONE field that is either an email or an Indian mobile
 * number. The whole app must agree on:
 *   - how to tell which one a string is (drives "Login with Password" vs
 *     "Login with OTP"), and
 *   - the canonical stored phone format (E.164 "+91XXXXXXXXXX"), so Firebase's
 *     phone identity and the customers.phone dedup key line up exactly.
 *
 * This file is dependency-free and safe to import from client components,
 * server routes, Edge middleware, and tests.
 */

export type IdentifierKind = 'email' | 'phone' | 'unknown'

/** RFC-pragmatic email check (matches lib/validation/order.ts). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Indian mobile: 10 digits starting 6-9, after stripping +91 / spaces. */
const INDIAN_MOBILE_10_RE = /^[6-9]\d{9}$/

/**
 * Strip everything but digits, then drop a leading 91 country code if the
 * result is 12 digits (i.e. "+91 98765 43210" → "9876543210").
 */
function toLocal10(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits
}

/** True if `value` is a valid email address. */
export function isEmail(value: string): boolean {
  return EMAIL_RE.test((value ?? '').trim())
}

/** True if `value` is a valid 10-digit Indian mobile (any common formatting). */
export function isIndianMobile(value: string): boolean {
  return INDIAN_MOBILE_10_RE.test(toLocal10(value))
}

/**
 * Classify a login identifier. An '@' anywhere routes to the email branch
 * (so a typo'd email isn't misread as a phone); otherwise we test the phone
 * shape; anything else is 'unknown' (form shows a validation hint).
 */
export function detectIdentifier(value: string): IdentifierKind {
  const v = (value ?? '').trim()
  if (v.includes('@')) return 'email'
  if (isIndianMobile(v)) return 'phone'
  return 'unknown'
}

/**
 * Canonical E.164 phone for storage + Firebase ("+91XXXXXXXXXX").
 * Returns null if the input isn't a valid Indian mobile.
 */
export function toE164(value: string): string | null {
  const local = toLocal10(value)
  if (!INDIAN_MOBILE_10_RE.test(local)) return null
  return `+91${local}`
}

/**
 * Canonical local 10-digit phone (no country code), or null if invalid.
 * Used where the existing schema/UX expects the bare 10 digits.
 */
export function toLocalMobile(value: string): string | null {
  const local = toLocal10(value)
  return INDIAN_MOBILE_10_RE.test(local) ? local : null
}
