import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getAdminUser } from '@/lib/auth/admin'
import { AdminShell } from '@/components/admin/admin-shell'

/**
 * Server-side gate for the ENTIRE /admin subtree.
 *
 * Runs on the server before any admin HTML is streamed, so authorization no
 * longer depends on client-side JavaScript or per-page fetch bounces. Two
 * distinct outcomes, deliberately different:
 *
 *   - NOT signed in            → redirect to /login (the owner can sign in and
 *                                come back). `next` returns them here after.
 *   - Signed in, NOT an admin  → back to /login with `switch=admin`, which
 *                                tells them this account has no admin access and
 *                                lets them sign in with the admin account. (It
 *                                used to 404, which left the owner stuck when an
 *                                old customer/phone login was still active.)
 *
 * The allowlist + verified-email check lives in lib/auth/admin.ts; this layout
 * only decides redirect-vs-hide. The API routes still call requireAdmin()
 * independently — defense in depth, so the data is safe even if this layout is
 * ever bypassed.
 */
export const metadata: Metadata = {
  // Admin routes must never be indexed or followed by search engines.
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminUser()

  if (!admin) {
    const user = await getCurrentUser()
    redirect(user ? '/login?next=/admin&switch=admin' : '/login?next=/admin')
  }

  return <AdminShell>{children}</AdminShell>
}
