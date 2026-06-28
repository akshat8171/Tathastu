import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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
    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const ordersToday = orders?.filter(
      (order) => new Date(order.created_at) >= todayStart
    ).length || 0

    const ordersThisWeek = orders?.filter(
      (order) => new Date(order.created_at) >= weekStart
    ).length || 0

    // Get recent orders (last 10)
    const recentOrders = (orders || []).slice(0, 10).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
    }))

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

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersToday,
      ordersThisWeek,
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
