import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // AUTHZ: service-role data — verify an admin session before anything else.
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    // Get date boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all orders (we'll filter in memory for simplicity)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Calculate stats
    const paidStatuses = new Set(['paid', 'processing', 'shipped', 'delivered'])
    const revenueOrders = (orders || []).filter(
      (order) => paidStatuses.has(order.status) || order.payment_status === 'paid'
    )
    const totalOrders = orders?.length || 0
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const averageOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0

    const ordersToday = orders?.filter(
      (order) => new Date(order.created_at) >= todayStart
    ).length || 0

    const ordersThisWeek = orders?.filter(
      (order) => new Date(order.created_at) >= weekStart
    ).length || 0

    // Get recent orders (last 10)
    const { data: recentRows } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at, order_items(product_image, product_name)')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentOrders = (recentRows || []).map((order) => {
      const items = Array.isArray(order.order_items) ? order.order_items : []
      const withImage = items.find((item: { product_image?: string }) => item.product_image)
      const first = (withImage || items[0]) as { product_image?: string; product_name?: string } | undefined
      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        thumbnail: first?.product_image ?? null,
        item_summary: items.map((item: { product_name?: string }) => item.product_name).filter(Boolean).join(', '),
      }
    })

    // Get top products
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_name, quantity, price, subtotal')

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
    }

    // Aggregate products
    const productMap = new Map<string, { quantity: number; revenue: number }>()

    orderItems?.forEach((item) => {
      const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 }
      productMap.set(item.product_name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.subtotal || item.price * item.quantity),
      })
    })

    const topProducts = Array.from(productMap.entries())
      .map(([product_name, stats]) => ({
        product_name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    let pendingQuotes = 0
    let quotesToday = 0
    const { data: quotes } = await supabaseAdmin
      .from('quote_requests')
      .select('id, status, created_at, file_url, type')

    if (quotes) {
      pendingQuotes = quotes.filter((q) => q.status === 'new').length
      quotesToday = quotes.filter((q) => new Date(q.created_at) >= todayStart).length
    }

    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const printQueue = (orders || []).filter((o) => o.status === 'paid' || o.status === 'processing').length
    const unpaid = (orders || []).filter((o) => o.status === 'pending').length
    const needsTracking = (orders || []).filter((o) => o.status === 'shipped' && !o.tracking_number).length
    const quotesSlaBreached = quotes?.filter(
      (q) => q.status === 'new' && new Date(q.created_at) < dayAgo
    ).length ?? 0

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersToday,
      ordersThisWeek,
      pendingQuotes,
      quotesToday,
      quotesTotal: quotes?.length ?? 0,
      quotesSlaBreached,
      printQueue,
      unpaid,
      needsTracking,
      recentOrders,
      topProducts,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
