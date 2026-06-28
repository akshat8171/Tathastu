import 'server-only'

/**
 * PII redaction helpers for server-side logging.
 *
 * Principle: raw PII (email, phone) must NEVER land in console logs — those go
 * to the hosting provider's log store (e.g. Vercel) and are broadly readable.
 * Full PII is allowed to flow only to (a) the persisted DB row and (b) a real
 * notification provider (email/SMS) — the intended, access-controlled channels.
 *
 * Everything here is pure string manipulation; redaction is applied
 * unconditionally (in dev and prod alike) so a dev machine's logs are clean too.
 */

/** `rahul@gmail.com` → `r****@gmail.com`. Keeps the domain (useful for triage). */
export function redactEmail(email?: string | null): string {
  if (!email) return '(none)'
  const trimmed = String(email).trim()
  const at = trimmed.indexOf('@')
  if (at <= 0) return '***'
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const head = local.slice(0, 1)
  return `${head}${'*'.repeat(Math.max(1, local.length - 1))}@${domain}`
}

/** `+91 91548 92790` → `*******2790`. Keeps the last 4 digits only. */
export function redactPhone(phone?: string | null): string {
  if (!phone) return '(none)'
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`
}

/**
 * Return a shallow copy of `obj` with any value whose key looks like an email or
 * phone field redacted. Used to log a notification body without leaking PII.
 */
export function redactPII<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /e-?mail/i.test(key)) {
      out[key] = redactEmail(value)
    } else if (typeof value === 'string' && /phone|mobile|tel/i.test(key)) {
      out[key] = redactPhone(value)
    } else {
      out[key] = value
    }
  }
  return out
}
