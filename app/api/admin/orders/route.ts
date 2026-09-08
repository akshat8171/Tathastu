import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'
import { sanitizeSearchTerm } from '@/lib/validation/search'
import { createOfflineOrderSchema } from '@/lib/validation/offline-order'
import { createOfflineOrder } from '@/lib/supabase/offline-orders'
import { isOrderChannel } from '@/lib/offline-orders'

export const dynamic = 'force-dynamic'

function isMissingColumn(error: { code?: string } | null | undefined): boolean {
  const code = error?.code
  return code === '42703' || code === 'PGRST204'
}

export async function GET(request: NextRequest) {
  // AUTHZ: returns all orders with customer PII — admin only.
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const channelParam = searchParams.get('channel')
    const channel = channelParam && isOrderChannel(channelParam) ? channelParam : null
    // Sanitize before embedding in a PostgREST .or() filter (injection guard).
    const search = sanitizeSearchTerm(searchParams.get('search'))

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(product_name, product_image, quantity)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (channel) {
      query = query.eq('channel', channel)
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    let { data: orders, error } = await query

    if (error && isMissingColumn(error) && channel) {
      // Migration 015 not applied yet — list still works, channel filter cannot.
      console.error('Admin orders: channel column missing (run migration-015); listing without channel filter')
      let fallback = supabaseAdmin
        .from('orders')
        .select('*, order_items(product_name, product_image, quantity)')
        .order('created_at', { ascending: false })
      if (status && status !== 'all') fallback = fallback.eq('status', status)
      if (search) {
        fallback = fallback.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
      }
      ;({ data: orders, error } = await fallback)
    }

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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const parsed = createOfflineOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid offline order' },
        { status: 400 }
      )
    }

    const { order, error } = await createOfflineOrder(parsed.data)
    if (error || !order) {
      console.error('Error creating offline order:', error)
      return NextResponse.json({ error: 'Failed to create offline order' }, { status: 500 })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Admin offline order create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
