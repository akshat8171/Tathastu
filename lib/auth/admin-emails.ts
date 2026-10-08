/**
 * Admin email allowlist — no Firebase, no session.
 *
 * Used by middleware (Edge) and by lib/auth/admin.ts. Must stay free of
 * firebase-admin and of getCurrentUser() so the Edge bundle never pulls
 * Node-only modules.
 *
 * Do not import this from Client Components: ADMIN_EMAILS is a server env
 * var, and the fallback address would otherwise ship in the browser bundle.
 */

/** The store owner. Always an admin, so a typo in ADMIN_EMAILS can never lock them out. */
const OWNER_ADMIN_EMAILS = ['tathastukeepsakes@gmail.com']

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  const source = raw
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  // ADMIN_EMAILS adds people (staff, a partner); it never removes the owner.
  return [...new Set([...OWNER_ADMIN_EMAILS, ...source].map(normalizeAdminEmail))]
}

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(normalizeAdminEmail(email))
}
