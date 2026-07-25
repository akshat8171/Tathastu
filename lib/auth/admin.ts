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
 * `getCurrentUser()` validates the Firebase httpOnly session cookie via
 * firebase-admin (`verifySessionCookie(cookie, true)` — revocation-checked) and
 * returns the E.164 `phone`. An admin is simply a verified user whose phone is
 * on the allowlist. No new credential, no new login flow — the admin signs in
 * through the normal `/login` phone-OTP path and is recognized here.
 *
 * Runs SERVER-SIDE ONLY (imports session.ts, which is `server-only` and uses
 * firebase-admin, a Node module). MUST NOT be imported by Edge middleware or any
 * Client Component.
 */

/**
 * Fallback allowlist used only when ADMIN_PHONES is not configured, so a
 * misconfigured deploy does not lock the store owner out of their own admin.
 * Prefer setting ADMIN_PHONES (comma-separated E.164) in the environment.
 */
const FALLBACK_ADMIN_PHONES = ['+919154892790']

/** Parse ADMIN_PHONES (comma-separated E.164, e.g. "+9198...,+9199...") */
function getAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONES
  if (!raw) return FALLBACK_ADMIN_PHONES
  const parsed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return parsed.length > 0 ? parsed : FALLBACK_ADMIN_PHONES
}

/** True when the user is present, phone-verified, and on the admin allowlist. */
export function isAdminUser(user: AppUser | null): boolean {
  if (!user?.phone) return false
  return getAdminPhones().includes(user.phone)
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
