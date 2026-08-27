'use client'

import { useEffect, useState } from 'react'
import { Package, TrendingUp, DollarSign, ShoppingBag, FileBox } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatInr, formatAdminDate, statusBadgeClass } from '@/lib/admin/format'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersToday: number
  ordersThisWeek: number
  recentOrders: Array<{
    id: string
    order_number: string
    customer_name: string
    total: number
    status: string
    created_at: string
    thumbnail?: string | null
    item_summary?: string
  }>
  pendingQuotes: number
  quotesToday: number
  quotesTotal: number
  quotesSlaBreached?: number
  printQueue?: number
  unpaid?: number
  needsTracking?: number
  topProducts: Array<{
    product_name: string
    quantity: number
    revenue: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Authorization is enforced SERVER-SIDE: every /api/admin/* route verifies
    // the session's VERIFIED email against the admin allowlist (lib/auth/admin.ts).
    // We just attempt to load the data; a 401 means "not signed in as an admin"
    // and we send the visitor to the real email login. The old, forgeable
    // localStorage('admin_phone') gate has been removed.
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.status === 401) {
        window.location.href = '/login?next=/admin'
        return
      }
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = formatInr
  const formatDate = formatAdminDate
  const getStatusColor = statusBadgeClass

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">Dashboard</h1>
        <p className="text-muted mt-2">What to print, quote, or ship today</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link href="/admin/catalog/new" className="text-sm font-medium text-brand hover:underline">
            Add a SKU →
          </Link>
          <Link href="/admin/homepage" className="text-sm font-medium text-brand hover:underline">
            Edit landing page →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/orders?status=processing" className="bg-white p-4 rounded-card2 shadow-card hover:ring-2 hover:ring-brand/30">
          <p className="text-xs text-muted">Print queue</p>
          <p className="text-2xl font-bold text-ink mt-1">{stats.printQueue ?? 0}</p>
          <p className="text-xs text-muted mt-1">Paid + processing</p>
        </Link>
        <Link href="/admin/quotes" className="bg-white p-4 rounded-card2 shadow-card hover:ring-2 hover:ring-brand/30">
          <p className="text-xs text-muted">Quotes overdue</p>
          <p className="text-2xl font-bold text-ink mt-1">{stats.quotesSlaBreached ?? 0}</p>
          <p className="text-xs text-muted mt-1">New for more than 24h</p>
        </Link>
        <Link href="/admin/orders?status=shipped" className="bg-white p-4 rounded-card2 shadow-card hover:ring-2 hover:ring-brand/30">
          <p className="text-xs text-muted">Needs tracking</p>
          <p className="text-2xl font-bold text-ink mt-1">{stats.needsTracking ?? 0}</p>
          <p className="text-xs text-muted mt-1">Shipped, no AWB</p>
        </Link>
        <Link href="/admin/orders?status=pending" className="bg-white p-4 rounded-card2 shadow-card hover:ring-2 hover:ring-brand/30">
          <p className="text-xs text-muted">Unpaid</p>
          <p className="text-2xl font-bold text-ink mt-1">{stats.unpaid ?? 0}</p>
          <p className="text-xs text-muted mt-1">Still pending</p>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Orders</p>
              <p className="text-2xl font-bold text-ink mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-brand" />
            </div>
          </div>
          <p className="text-xs text-muted mt-4">
            {stats.ordersToday} today, {stats.ordersThisWeek} this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Paid revenue</p>
              <p className="text-2xl font-bold text-ink mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Avg Order Value</p>
              <p className="text-2xl font-bold text-ink mt-1">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Orders Today</p>
              <p className="text-2xl font-bold text-ink mt-1">{stats.ordersToday}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <Link href="/admin/quotes" className="bg-white p-6 rounded-card2 shadow-card hover:ring-2 hover:ring-brand/30 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Custom quotes</p>
              <p className="text-2xl font-bold text-ink mt-1">{stats.pendingQuotes ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileBox className="w-6 h-6 text-amber-700" />
            </div>
          </div>
          <p className="text-xs text-muted mt-4">
            {stats.quotesToday ?? 0} today · {stats.quotesTotal ?? 0} total · new ones need a reply
          </p>
        </Link>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-card2 shadow-card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-ink">Recent Orders</h2>
              <Link href="/admin/orders" className="text-brand hover:text-brand-600 text-sm font-medium">
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-panel flex-shrink-0">
                          {order.thumbnail ? (
                            <Image
                              src={order.thumbnail}
                              alt={order.item_summary || order.order_number}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-brand hover:text-brand-600 font-medium"
                        >
                          {order.order_number}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-card2 shadow-card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-display font-bold text-ink">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink line-clamp-2">{product.product_name}</p>
                  <p className="text-xs text-muted mt-1">{product.quantity} sold</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-ink">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
