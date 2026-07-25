import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

/**
 * Admin session probe.
 *
 * Returns 200 `{ admin: true, phone }` when the caller holds a valid,
 * cryptographically-verified session whose phone is on the admin allowlist;
 * otherwise 401 (via requireAdmin). The admin UI uses this to decide whether to
 * render the dashboard or bounce to /admin/login — replacing the old, forgeable
 * `localStorage.admin_phone` check with a real server-verified gate.
 *
 * Exposes no customer data — only whether the current session is an admin.
 */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  return NextResponse.json({ admin: true, phone: auth.user.phone ?? null })
}
