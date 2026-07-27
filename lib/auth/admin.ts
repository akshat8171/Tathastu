import 'server-only'

import { NextResponse } from 'next/server'
import { getCurrentUser, type AppUser } from '@/lib/auth/session'

/**
 * Server-side admin authorization.
 *
 * WHY THIS EXISTS
 * ---------------
 * The admin area previously "authenticated" purely on the client by reading
 * `localStorage.admin_phone` — trivially forged, and the `/api/admin/*` routes
 * (which use the RLS-bypassing service-role key) had NO server-side gate at all.
 * Anyone could `curl` the full customer database.
 *
 * This module is the real boundary. It authorizes off the SAME
 * cryptographically-verified session the rest of the app uses:
 * `getCurrentUser()` resolves the Supabase email/password (or Google OAuth)
 * session and reports whether the address is verified. An admin is simply a
 * user whose VERIFIED email is on the allowlist. No new credential, no new login
 * flow — the admin signs in through the normal `/login` email path and is
 * recognized here.
 *
 * WHY VERIFIED EMAIL (not just a string match)
 * --------------------------------------------
 * Email is now the primary identity, so authorization keys on it. But a raw
 * string match is not enough: anyone could register an email/password account
 * claiming the admin address. We therefore require `emailVerified` — Google
 * OAuth is verified instantly, and email/password only after the user clicks the
 * link sent to the real inbox. Proven ownership, not a typed string, is the gate.
 *
 * DEPLOYMENT PRECONDITION (load-bearing): Supabase "Confirm email" MUST be ON.
 * With it OFF, Supabase sets email_confirmed_at at sign-up AND lets
 * auth.updateUser({ email }) take effect without re-verification — so a customer
 * could repoint their account to the admin address and inherit admin. With it
 * ON, both a fresh sign-up and an email change require clicking a link sent to
 * that inbox. See DEPLOYMENT.md → Auth configuration.
 *
 * Runs SERVER-SIDE ONLY (imports session.ts, which is `server-only` and uses
 * firebase-admin, a Node module). MUST NOT be imported by Edge middleware or any
 * Client Component.
 */

/**
 * Fallback allowlist used only when ADMIN_EMAILS is not configured, so a
 * misconfigured deploy does not lock the store owner out of their own admin.
 * Prefer setting ADMIN_EMAILS (comma-separated) in the environment.
 */
const FALLBACK_ADMIN_EMAILS = ['tathastukeepsakes@gmail.com']

/** Normalize an email for case-insensitive comparison. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Parse ADMIN_EMAILS (comma-separated, e.g. "a@x.com,b@y.com"), normalized. */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  const source = raw
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const list = source.length > 0 ? source : FALLBACK_ADMIN_EMAILS
  return list.map(normalizeEmail)
}

/**
 * True when the user is present, their email is VERIFIED, and that email is on
 * the admin allowlist. The `emailVerified` requirement is load-bearing security —
 * see the module header. Phone-only sessions (no verified email) are never admin.
 */
export function isAdminUser(user: AppUser | null): boolean {
  if (!user?.email || !user.emailVerified) return false
  return getAdminEmails().includes(normalizeEmail(user.email))
}

/**
 * Resolve the current user and return them only if they are an admin;
 * otherwise null. Use in Server Components to gate admin pages.
 */
export async function getAdminUser(): Promise<AppUser | null> {
  const user = await getCurrentUser()
  return isAdminUser(user) ? user : null
}

/**
 * Route-handler guard. Call at the very top of every `/api/admin/*` handler,
 * BEFORE any supabaseAdmin access:
 *
 *   const auth = await requireAdmin()
 *   if (!auth.ok) return auth.response
 *   // ...auth.user is a verified admin
 *
 * Returns a 401 JSON response for unauthenticated/non-admin callers so the
 * service-role data is never exposed.
 */
export async function requireAdmin(): Promise<
  { ok: true; user: AppUser } | { ok: false; response: NextResponse }
> {
  const user = await getAdminUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { ok: true, user }
}
