import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, Users, LayoutDashboard, LogOut } from 'lucide-react'

// Simple admin auth check - checks if user is admin based on phone
// In a production app, this would check a proper session/JWT
async function checkAdminAuth() {
  // For now, we'll implement client-side check in the pages
  // This layout is just the UI structure
  return true
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: Package, label: 'Orders' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col fixed inset-y-0 left-0">
        {/* Logo */}
        <div className="p-6 border-b border-ink-soft">
          <Link href="/admin" className="text-2xl font-display font-bold text-white hover:text-brand-200 transition-colors">
            Layerix Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-ink-soft hover:text-white transition-colors"
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
      <div className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
