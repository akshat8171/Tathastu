'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Users, LayoutDashboard, LogOut } from 'lucide-react'
import { useEffect, ReactNode } from 'react'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  // Hide the main layout elements for admin routes
  useEffect(() => {
    // Add a class to body to identify admin pages
    document.body.classList.add('admin-page')
    return () => {
      document.body.classList.remove('admin-page')
    }
  }, [])

  // Don't render sidebar for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/orders', icon: Package, label: 'Orders' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-ink-soft">
          <Link href="/admin" className="text-2xl font-display font-bold text-white hover:text-brand-200 transition-colors">
            Layerix Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
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

        {/* Logout */}
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
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
