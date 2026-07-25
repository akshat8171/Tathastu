import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // FIRST LINE: admin guard — this endpoint exposes customer LTV/PII
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    // Parse range parameter (days=7/30/90/all, default 30)
    const searchParams = request.nextUrl.searchParams
    const daysParam = searchParams.get('days') || '30'
    const isAll = daysParam === 'all'
    const days = isAll ? null : parseInt(daysParam, 10)

    // Validate days parameter
    if (!isAll && (isNaN(days!) || ![7, 30, 90].includes(days!))) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Use 7, 30, 90, or "all"' },
        { status: 400 }
      )
    }

    // Compute range boundary
    let sinceIso: string | null = null
    if (!isAll) {
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days!)
      sinceIso = sinceDate.toISOString()
    }

    // Build base query
    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('id, customer_id, total, status, created_at, shipping_state')

    if (sinceIso) {
      ordersQuery = ordersQuery.gte('created_at', sinceIso)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Error fetching orders for analytics:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Funnel: order status tallies
    const funnel: Record<string, number> = {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    const totalOrders = orders?.length || 0
    orders?.forEach((order) => {
      const status = order.status || 'pending'
      if (funnel[status] !== undefined) {
        funnel[status]++
      }
    })

    // Paid conversion rate: (paid + shipped + delivered) / total
    const paidOrders = funnel.paid + funnel.shipped + funnel.delivered
    const paid_conversion_rate = totalOrders > 0 ? paidOrders / totalOrders : 0

    // New vs Repeat customers
    const customerOrderCounts = new Map<string, number>()
    orders?.forEach((order) => {
      if (order.customer_id) {
        const count = customerOrderCounts.get(order.customer_id) || 0
        customerOrderCounts.set(order.customer_id, count + 1)
      }
    })

    let newCustomers = 0
    let repeatCustomers = 0
    customerOrderCounts.forEach((count) => {
      if (count === 1) {
        newCustomers++
      } else {
        repeatCustomers++
      }
    })

    // LTV: average, median, top customers
    const customerSpending = new Map<string, { total: number; count: number }>()
    orders?.forEach((order) => {
      if (order.customer_id && order.total) {
        const existing = customerSpending.get(order.customer_id) || { total: 0, count: 0 }
        customerSpending.set(order.customer_id, {
          total: existing.total + order.total,
          count: existing.count + 1,
        })
      }
    })

    const spendingArray = Array.from(customerSpending.entries()).map(([id, stats]) => ({
      customer_id: id,
      total_spent: stats.total,
      order_count: stats.count,
    }))

    const totalSpending = spendingArray.reduce((sum, c) => sum + c.total_spent, 0)
    const avgLtv = spendingArray.length > 0 ? totalSpending / spendingArray.length : 0

    // Median LTV
    const sortedSpending = spendingArray.map((c) => c.total_spent).sort((a, b) => a - b)
    let medianLtv = 0
    if (sortedSpending.length > 0) {
      const mid = Math.floor(sortedSpending.length / 2)
      medianLtv =
        sortedSpending.length % 2 === 0
          ? (sortedSpending[mid - 1] + sortedSpending[mid]) / 2
          : sortedSpending[mid]
    }

    // Top 10 customers by spending
    const topCustomersById = spendingArray.sort((a, b) => b.total_spent - a.total_spent).slice(0, 10)

    // Fetch customer names for top 10
    const topCustomerIds = topCustomersById.map((c) => c.customer_id)
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('id, name')
      .in('id', topCustomerIds)

    if (customersError) {
      console.error('Error fetching customers for LTV:', customersError)
    }

    const customerNamesMap = new Map<string, string>()
    customers?.forEach((c) => {
      customerNamesMap.set(c.id, c.name || 'N/A')
    })

    const topCustomers = topCustomersById.map((c) => ({
      customer_id: c.customer_id,
      name: customerNamesMap.get(c.customer_id) || 'N/A',
      total_spent: c.total_spent,
      order_count: c.order_count,
    }))

    // Geography: group by shipping_state
    const geographyMap = new Map<string, { orders: number; revenue: number }>()
    orders?.forEach((order) => {
      const state = order.shipping_state || 'Unknown'
      const existing = geographyMap.get(state) || { orders: 0, revenue: 0 }
      geographyMap.set(state, {
        orders: existing.orders + 1,
        revenue: existing.revenue + (order.total || 0),
      })
    })

    const geography = Array.from(geographyMap.entries())
      .map(([state, stats]) => ({
        state,
        orders: stats.orders,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.orders - a.orders)

    // Timeseries: daily buckets
    const timeseriesMap = new Map<string, { orders: number; revenue: number }>()
    orders?.forEach((order) => {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0]
      const existing = timeseriesMap.get(dateKey) || { orders: 0, revenue: 0 }
      timeseriesMap.set(dateKey, {
        orders: existing.orders + 1,
        revenue: existing.revenue + (order.total || 0),
      })
    })

    const timeseries = Array.from(timeseriesMap.entries())
      .map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      range: {
        days: isAll ? 'all' : days,
        since: sinceIso,
      },
      funnel: {
        ...funnel,
        paid_conversion_rate,
      },
      newVsRepeat: {
        new: newCustomers,
        repeat: repeatCustomers,
      },
      ltv: {
        average: avgLtv,
        median: medianLtv,
        top: topCustomers,
      },
      geography,
      timeseries,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
