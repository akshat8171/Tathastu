import 'server-only'

import { cookies } from 'next/headers'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAdminAuth } from '@/lib/firebase/admin'
import { FIREBASE_SESSION_COOKIE } from './cookies'

/**
 * Unified, provider-agnostic session layer.
 *
 * The app now has TWO ways to be logged in:
 *   - PHONE users  → Firebase (httpOnly session cookie, verified by firebase-admin)
 *   - EMAIL users  → Supabase email+password (@supabase/ssr cookies)
 *
 * Every consumer (account page, auth-helpers, middleware-adjacent checks) should
 * depend on THIS normalized shape, not on either provider's user object. That
 * keeps the UI and route guards from caring which backend authenticated the
 * visitor.
 *
 * Runs server-side only (reads httpOnly cookies, uses firebase-admin).
 */

export type AuthProvider = 'firebase' | 'supabase'

export interface AppUser {
  /** Stable provider-scoped id (Firebase uid or Supabase user id). */
  id: string
  provider: AuthProvider
  /** E.164 phone for Firebase phone users; may be undefined for email users. */
  phone?: string
  /** Email for Supabase users; may be undefined for phone users. */
  email?: string
  /** ISO timestamp of account creation, when the provider exposes it. */
  createdAt?: string
}

/**
 * Resolve the current user from EITHER session type.
 *
 * Order: Firebase session cookie first (cheap, self-contained verify), then
 * Supabase. Returns null when neither is present/valid.
 *
 * Firebase verification uses `verifySessionCookie(cookie, true)` — the `true`
 * checks the token hasn't been revoked. If firebase-admin isn't configured
 * (local dev without a service account), Firebase resolution is skipped.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  // 1) Firebase phone session
  const fbCookie = cookies().get(FIREBASE_SESSION_COOKIE)?.value
  if (fbCookie) {
    const adminAuth = getAdminAuth()
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifySessionCookie(fbCookie, true)
        return {
          id: decoded.uid,
          provider: 'firebase',
          phone: decoded.phone_number ?? undefined,
          // Firebase exposes auth_time/iat (seconds); not the account creation
          // date. We surface the token issue time as a best-effort "since".
          createdAt: decoded.auth_time
            ? new Date(decoded.auth_time * 1000).toISOString()
            : undefined,
        }
      } catch {
        // Invalid/expired/revoked cookie → fall through to Supabase.
      }
    }
  }

  // 2) Supabase email+password session
  try {
    const supabase = createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      return {
        id: user.id,
        provider: 'supabase',
        email: user.email ?? undefined,
        phone: user.phone || undefined,
        createdAt: user.created_at,
      }
    }
  } catch {
    // No Supabase session / not configured.
  }

  return null
}
