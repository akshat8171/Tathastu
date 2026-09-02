'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Users, LayoutDashboard, LogOut, BarChart3, FileBox, Tags, Home } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Interactive admin chrome (sidebar + active-nav highlighting).
 *
 * This is the CLIENT half of the admin layout. Authorization is handled by the
 * SERVER component in app/admin/layout.tsx — by the time this renders, the
 * viewer is already a verified admin, so nothing here performs any auth. Keeping
 * the gate in the server layout means non-admins never receive this markup at
 * all (no flash of admin UI, no reliance on client-side redirects).
 */

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/catalog', icon: Tags, label: 'Catalog' },
  { href: '/admin/homepage', icon: Home, label: 'Landing page' },
  { href: '/admin/orders', icon: Package, label: 'Orders' },
  { href: '/admin/quotes', icon: FileBox, label: 'Quotes' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div
      className="flex h-dvh min-h-screen bg-gray-50 overflow-hidden"
      data-testid="admin-shell"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col">
        <div className="p-6 border-b border-ink-soft">
          <Link
            href="/admin"
            className="text-2xl font-display font-bold text-white hover:text-brand-200 transition-colors"
          >
            Tathastu Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : 'text-gray-300 hover:bg-ink-soft hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-ink-soft">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-ink-soft hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
