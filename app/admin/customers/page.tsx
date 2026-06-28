'use client'

import { useEffect, useState } from 'react'
import { Search, Users, Package, DollarSign } from 'lucide-react'

interface Customer {
  id: string
  name?: string
  email?: string
  phone?: string
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date?: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'total_spent' | 'total_orders' | 'created_at'>('total_spent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchCustomers()
  }, [debouncedSearch, sortBy, sortOrder])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('search', debouncedSearch)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/admin/customers?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch customers')

      const data = await response.json()
      setCustomers(data.customers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.total_orders, 0) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">Customers</h1>
        <p className="text-muted mt-2">Manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Customers</p>
              <p className="text-2xl font-bold text-ink mt-1">{totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-brand" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card2 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-ink mt-1">{formatCurrency(totalRevenue)}</p>
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
              <p className="text-2xl font-bold text-ink mt-1">{formatCurrency(avgOrderValue)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="bg-white rounded-card2 shadow-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Customers
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Sort */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-ink mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="total_spent">Total Spent</option>
              <option value="total_orders">Total Orders</option>
              <option value="created_at">Join Date</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted">
          {customers.length} customers found
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-card2 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted">Loading customers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Phone</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-muted uppercase cursor-pointer hover:text-brand"
                    onClick={() => handleSort('total_orders')}
                  >
                    Total Orders {sortBy === 'total_orders' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-muted uppercase cursor-pointer hover:text-brand"
                    onClick={() => handleSort('total_spent')}
                  >
                    Total Spent {sortBy === 'total_spent' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Last Order</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-muted uppercase cursor-pointer hover:text-brand"
                    onClick={() => handleSort('created_at')}
                  >
                    Joined {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-ink">{customer.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">{customer.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-ink">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-ink">{customer.total_orders}</td>
                    <td className="px-6 py-4 text-sm font-bold text-ink">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(customer.last_order_date)}</td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(customer.created_at)}</td>
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
