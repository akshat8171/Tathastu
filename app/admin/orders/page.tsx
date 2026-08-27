'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, MessageCircle, Package } from 'lucide-react'
import { CopyLinkButton } from '@/components/admin/copy-link-button'
import { formatInr, formatAdminDate, statusBadgeClass } from '@/lib/admin/format'
import {
  customerWhatsAppUrl,
  orderConfirmationUrl,
  orderCustomerWhatsAppText,
} from '@/lib/admin/links'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string
  total: number
  status: string
  payment_method: string
  created_at: string
  thumbnail?: string | null
  item_summary?: string
  item_count?: number
}

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status')
    if (status && statusOptions.some((option) => option.value === status)) {
      setStatusFilter(status)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, debouncedSearch])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (debouncedSearch) params.append('search', debouncedSearch)

      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (response.status === 401) {
        window.location.href = '/login?next=/admin/orders'
        return
      }
      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      setOrders(data.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = formatInr
  const formatDate = formatAdminDate
  const getStatusColor = statusBadgeClass

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">Orders</h1>
        <p className="text-muted mt-2">Manage and track all customer orders</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-card2 shadow-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>{orders.length} orders found</span>
          {(statusFilter !== 'all' || debouncedSearch) && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setSearchQuery('')
              }}
              className="text-brand hover:text-brand-600 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-card2 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-panel flex-shrink-0">
                          {order.thumbnail ? (
                            <Image
                              src={order.thumbnail}
                              alt={order.item_summary || order.order_number}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted line-clamp-2 max-w-[140px]">
                          {order.item_summary || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-brand hover:text-brand-600 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.order_number}
                      </Link>
                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <CopyLinkButton
                          value={orderConfirmationUrl(order.order_number)}
                          label="Copy customer link"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{order.customer_name}</p>
                        <p className="text-xs text-muted">{order.customer_email}</p>
                        {(() => {
                          const wa = customerWhatsAppUrl(
                            order.customer_phone,
                            orderCustomerWhatsAppText(order.order_number, order.status)
                          )
                          return wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          ) : null
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">{order.customer_phone}</td>
                    <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink uppercase">{order.payment_method}</td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
