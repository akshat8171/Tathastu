import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isAdminUser } from '@/lib/auth/admin'
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
 *   - Signed in, NOT an admin  → 404. A logged-in customer poking at /admin
 *                                gets the same response as a non-existent page,
 *                                so the admin surface never confirms it exists.
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
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  if (!isAdminUser(user)) {
    notFound()
  }

  return <AdminShell>{children}</AdminShell>
}
