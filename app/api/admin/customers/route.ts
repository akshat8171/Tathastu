import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'total_spent'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Fetch all customers
    let customersQuery = supabaseAdmin
      .from('customers')
      .select('*')

    // Apply search filter
    if (search) {
      customersQuery = customersQuery.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data: customers, error: customersError } = await customersQuery

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    // Fetch order statistics for each customer
    const { data: orderStats, error: statsError } = await supabaseAdmin
      .from('orders')
      .select('customer_id, total, created_at')
      .not('customer_id', 'is', null)

    if (statsError) {
      console.error('Error fetching order stats:', statsError)
    }

    // Aggregate order data by customer
    const customerMap = new Map<string, {
      total_orders: number
      total_spent: number
      last_order_date?: string
    }>()

    orderStats?.forEach((order) => {
      if (!order.customer_id) return

      const existing = customerMap.get(order.customer_id) || {
        total_orders: 0,
        total_spent: 0,
        last_order_date: undefined,
      }

      customerMap.set(order.customer_id, {
        total_orders: existing.total_orders + 1,
        total_spent: existing.total_spent + (order.total || 0),
        last_order_date: !existing.last_order_date ||
          new Date(order.created_at) > new Date(existing.last_order_date)
          ? order.created_at
          : existing.last_order_date,
      })
    })

    // Combine customer data with order stats
    const enrichedCustomers = (customers || []).map((customer) => {
      const stats = customerMap.get(customer.id) || {
        total_orders: 0,
        total_spent: 0,
        last_order_date: undefined,
      }

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created_at: customer.created_at,
        total_orders: stats.total_orders,
        total_spent: stats.total_spent,
        last_order_date: stats.last_order_date,
      }
    })

    // Sort customers
    enrichedCustomers.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'total_spent':
          comparison = a.total_spent - b.total_spent
          break
        case 'total_orders':
          comparison = a.total_orders - b.total_orders
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return NextResponse.json({ customers: enrichedCustomers })
  } catch (error) {
    console.error('Admin customers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
