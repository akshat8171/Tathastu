/**
 * Where to send a user after a successful login.
 *
 * Admin allowlist members always land on /admin, unless `next` is already an
 * admin deep-link (/admin/orders/…). Customers keep the sanitized `next`
 * (usually /account).
 *
 * Safe to import from Client Components — no emails, no secrets.
 */
export function getPostLoginPath(isAdmin: boolean, next: string): string {
  if (!isAdmin) return next
  if (next.startsWith('/admin')) return next
  return '/admin'
}
