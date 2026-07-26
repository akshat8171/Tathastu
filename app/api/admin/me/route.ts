import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

/**
 * Admin session probe.
 *
 * Returns 200 `{ admin: true, email }` when the caller holds a valid,
 * cryptographically-verified session whose VERIFIED email is on the admin
 * allowlist; otherwise 401 (via requireAdmin). The /admin subtree is now gated
 * server-side in app/admin/layout.tsx (redirect if logged out, 404 if not an
 * admin); this probe remains for any client-side session checks that want it.
 *
 * Exposes no customer data — only whether the current session is an admin.
 */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  return NextResponse.json({ admin: true, email: auth.user.email ?? null })
}
