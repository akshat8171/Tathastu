'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, MapPin, BarChart3, Activity } from 'lucide-react'

interface AnalyticsData {
  range: {
    days: number | 'all'
    since: string | null
  }
  funnel: {
    pending: number
    paid: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    paid_conversion_rate: number
  }
  newVsRepeat: {
    new: number
    repeat: number
  }
  ltv: {
    average: number
    median: number
    top: Array<{
      customer_id: string
      name: string
      total_spent: number
      order_count: number
    }>
  }
  geography: Array<{
    state: string
    orders: number
    revenue: number
  }>
  timeseries: Array<{
    date: string
    orders: number
    revenue: number
  }>
  quotes?: {
    total: number
    pending: number
    withFile: number
    byType: Record<string, number>
  }
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<7 | 30 | 90 | 'all'>(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/analytics?days=${days}`)

      if (response.status === 401) {
        setError('Not authorized — please sign in as admin')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
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

  const formatPercent = (value: number) => {
    return (value * 100).toFixed(1) + '%'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No analytics data available</p>
      </div>
    )
  }

  const totalOrders = Object.values(analytics.funnel)
    .slice(0, 6)
    .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Customer Analytics</h1>
          <p className="text-muted mt-2">Order-based behaviour insights from your database</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-2">
          {[7, 30, 90, 'all'].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as typeof days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-brand text-white'
                  : 'bg-white text-ink border border-gray-300 hover:border-brand'
              }`}
            >
              {d === 'all' ? 'All Time' : `${d} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-card2 p-4">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1 text-sm text-blue-900">
            <strong>Note:</strong> Traffic, devices, referrers and the view→cart→checkout funnel counts live in the{' '}
            <strong>Vercel Analytics dashboard</strong>. This page shows order-based behaviour from our own database.
          </div>
        </div>
      </div>

      {/* 1. Order Funnel */}
      <div className="bg-white p-6 rounded-card2 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">Order Funnel</h2>
            <p className="text-sm text-muted">Order status distribution</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(analytics.funnel)
            .filter(([key]) => key !== 'paid_conversion_rate')
            .map(([status, count]) => {
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-ink capitalize">{status}</span>
                    <span className="text-muted">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Paid Conversion Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {formatPercent(analytics.funnel.paid_conversion_rate)}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Orders with status: paid, shipped, or delivered
          </p>
        </div>
      </div>

      {/* 2. New vs Repeat Customers */}
      <div className="bg-white p-6 rounded-card2 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">New vs Repeat Customers</h2>
            <p className="text-sm text-muted">Customer retention in selected period</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-ink">{analytics.newVsRepeat.new}</p>
            <p className="text-sm text-muted mt-1">New Customers</p>
            <p className="text-xs text-muted mt-1">(First order in period)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{analytics.newVsRepeat.repeat}</p>
            <p className="text-sm text-muted mt-1">Repeat Customers</p>
            <p className="text-xs text-muted mt-1">(2+ orders in period)</p>
          </div>
        </div>
      </div>

      {/* 3. LTV: Average, Median, Top Customers */}
      <div className="bg-white p-6 rounded-card2 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">Customer Lifetime Value</h2>
            <p className="text-sm text-muted">Spending patterns in selected period</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-ink">{formatCurrency(analytics.ltv.average)}</p>
            <p className="text-sm text-muted mt-1">Average LTV</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-ink">{formatCurrency(analytics.ltv.median)}</p>
            <p className="text-sm text-muted mt-1">Median LTV</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-3">Top 10 Customers by Spending</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Orders</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.ltv.top.map((customer, index) => (
                  <tr key={customer.customer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-ink">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-ink">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-muted">{customer.order_count}</td>
                    <td className="px-4 py-3 text-sm font-bold text-ink">
                      {formatCurrency(customer.total_spent)}
                    </td>
                  </tr>
                ))}
                {analytics.ltv.top.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted">
                      No customer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {analytics.quotes && (
        <div className="bg-white p-6 rounded-card2 shadow-card">
          <h2 className="text-xl font-display font-bold text-ink mb-4">Custom quotes</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-ink">{analytics.quotes.total}</p>
              <p className="text-xs text-muted mt-1">Total</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-ink">{analytics.quotes.pending}</p>
              <p className="text-xs text-muted mt-1">New / unanswered</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-ink">{analytics.quotes.withFile}</p>
              <p className="text-xs text-muted mt-1">With file attached</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analytics.quotes.byType).map(([type, count]) => (
              <span key={type} className="text-xs bg-gray-100 text-ink px-3 py-1 rounded-full capitalize">
                {type.replace(/_/g, ' ')} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {analytics.timeseries.length > 0 && (
        <div className="bg-white p-6 rounded-card2 shadow-card">
          <h2 className="text-xl font-display font-bold text-ink mb-2">Orders over time</h2>
          <p className="text-sm text-muted mb-6">Daily order count in the selected range</p>
          <div className="flex items-end gap-1 h-40">
            {analytics.timeseries.map((point) => {
              const max = Math.max(...analytics.timeseries.map((p) => p.orders), 1)
              const height = Math.max(8, (point.orders / max) * 100)
              return (
                <div key={point.date} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-brand rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${point.date}: ${point.orders} orders, ${formatCurrency(point.revenue)}`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>{analytics.timeseries[0]?.date}</span>
            <span>{analytics.timeseries[analytics.timeseries.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* 4. Geography */}
      <div className="bg-white p-6 rounded-card2 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">Orders by State</h2>
            <p className="text-sm text-muted">Geographic distribution</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">State</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Orders</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Revenue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Avg Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.geography.map((geo) => (
                <tr key={geo.state} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{geo.state}</td>
                  <td className="px-4 py-3 text-sm text-muted">{geo.orders}</td>
                  <td className="px-4 py-3 text-sm font-bold text-ink">
                    {formatCurrency(geo.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {formatCurrency(geo.orders > 0 ? geo.revenue / geo.orders : 0)}
                  </td>
                </tr>
              ))}
              {analytics.geography.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted">
                    No geographic data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
