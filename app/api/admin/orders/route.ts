import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { sanitizeSearchTerm } from '@/lib/validation/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // AUTHZ: returns all orders with customer PII — admin only.
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    // Sanitize before embedding in a PostgREST .or() filter (injection guard).
    const search = sanitizeSearchTerm(searchParams.get('search'))

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(product_name, product_image, quantity)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    const shaped = (orders || []).map((order) => {
      const items = Array.isArray(order.order_items) ? order.order_items : []
      const withImage = items.find((item: { product_image?: string }) => item.product_image)
      const first = (withImage || items[0]) as { product_image?: string; product_name?: string } | undefined
      const { order_items, ...rest } = order
      return {
        ...rest,
        thumbnail: first?.product_image ?? null,
        item_summary: items
          .map((item: { product_name?: string }) => item.product_name)
          .filter(Boolean)
          .join(', '),
        item_count: items.reduce(
          (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
          0
        ),
      }
    })

    return NextResponse.json({ orders: shaped })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // AUTHZ: mutates order status / tracking — admin only.
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const { orderId, status, trackingNumber } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'shipped' && trackingNumber) {
      updateData.tracking_number = trackingNumber
      updateData.shipped_at = new Date().toISOString()
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
