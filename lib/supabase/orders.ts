import { supabaseAdmin } from './admin'
import type { Order, OrderItem } from './client'
import { toE164 } from '@/lib/auth/identifier'

/**
 * Resolve catalog slugs (e.g. "lamps-lamp1") to the products-table UUID primary
 * key.
 *
 * order_items.product_id is a UUID foreign key → products(id), but the cart,
 * product URLs, pricing, and the entire app identify products by their string
 * slug. Rather than reshape the cart's localStorage or the catalog routes, we
 * translate slug → UUID at this single DB write boundary.
 *
 * Runs on the service-role client (bypasses RLS). Behaviour is deliberately
 * forgiving: any slug that isn't found in the products table (unseeded catalog,
 * or a DB where migration-003 hasn't run yet) maps to `null`. Because
 * order_items.product_id is nullable and the product_* snapshot columns already
 * capture name/price/image, an order is NEVER rejected merely because a slug is
 * missing from the products table — we just lose the FK link for that line.
 */
async function resolveSlugsToUuids(slugs: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(slugs.filter(Boolean)))
  if (unique.length === 0) return new Map()

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, slug')
    .in('slug', unique)

  if (error) {
    // e.g. products.slug column doesn't exist yet → degrade gracefully to null FKs.
    console.error('Error resolving product slugs to UUIDs:', error)
    return new Map()
  }

  const map = new Map<string, string>()
  for (const row of (data ?? []) as Array<{ id: string; slug: string | null }>) {
    if (row.slug) map.set(row.slug, row.id)
  }
  return map
}

/**
 * Order persistence layer.
 *
 * All functions here run SERVER-SIDE ONLY (API routes, server components) and
 * use the SERVICE-ROLE client (supabaseAdmin), which bypasses RLS. This is
 * required by migration-002-rls-policies.sql: the browser anon role is granted
 * only INSERT on orders/order_items — it has no UPDATE (so payment-status
 * updates would no-op) and no SELECT (so order look-ups would return null).
 * Running these on the server with the service role makes the full
 * create → mark-paid → confirmation-read flow work under RLS.
 *
 * NEVER import this module from a Client Component — supabaseAdmin is
 * `server-only` and carries the service-role key.
 */

/**
 * Upsert a customer row keyed by phone number (E.164, e.g. +91XXXXXXXXXX).
 *
 * - New phone → inserts a fresh row and returns its UUID.
 * - Existing phone → returns the existing row's UUID (no data overwrite).
 * - Bad / un-normalizable phone → returns null immediately.
 * - Any DB error → logs and returns null; NEVER throws.
 *
 * This function intentionally never throws so that a customer-linkage
 * failure cannot block checkout: callers receive null and proceed with
 * orders.customer_id = null.
 *
 * Requires migration-004-customers-upsert.sql to have run (adds the UNIQUE
 * constraint on phone that makes the upsert conflict-resolution possible).
 */
export async function upsertCustomerByPhone(input: {
  phone: string       // 10-digit Indian mobile or E.164; will be normalised
  name?: string
  email?: string
}): Promise<string | null> {
  const e164 = toE164(input.phone)
  if (!e164) {
    console.error('upsertCustomerByPhone: could not normalise phone to E.164', input.phone)
    return null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          phone: e164,
          name: input.name ?? null,
          email: input.email || null,
        },
        { onConflict: 'phone' }
      )
      .select('id')
      .single()

    if (error || !data) {
      console.error('upsertCustomerByPhone: DB error', error)
      return null
    }

    return (data as { id: string }).id
  } catch (err) {
    console.error('upsertCustomerByPhone: unexpected error', err)
    return null
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_id?: string | null
  items: Array<{
    product_id: string
    product_name: string
    product_variant?: string
    product_image?: string
    price: number
    original_price?: number
    quantity: number
  }>
  subtotal: number
  discount?: number
  tax?: number
  shipping?: number
  total: number
  payment_method?: string
  notes?: string
}): Promise<{ order: Order | null; error: any }> {
  try {
    // Generate order number
    const orderNumber = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: orderData.customer_id ?? null,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        payment_method: orderData.payment_method || 'upi',
        payment_status: 'pending',
        status: 'pending',
        notes: orderData.notes,
      })
      .select()
      .single()

    if (orderError || !order) {
      return { order: null, error: orderError }
    }

    // Map each item's catalog slug to its products-table UUID. order_items
    // .product_id is a UUID FK; the app passes string slugs ("lamps-lamp1").
    // Unresolved slugs become null (column is nullable, snapshot cols remain).
    const uuidBySlug = await resolveSlugsToUuids(orderData.items.map(i => i.product_id))

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: uuidBySlug.get(item.product_id) ?? null,
      product_name: item.product_name,
      product_variant: item.product_variant,
      product_image: item.product_image,
      price: item.price,
      original_price: item.original_price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback order if items insert fails
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return { order: null, error: itemsError }
    }

    return { order, error: null }
  } catch (error) {
    return { order: null, error }
  }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentId?: string,
  paymentOrderId?: string
): Promise<boolean> {
  const updateData: any = {
    payment_status: paymentStatus,
  }

  if (paymentId) updateData.payment_id = paymentId
  if (paymentOrderId) updateData.payment_order_id = paymentOrderId

  if (paymentStatus === 'paid') {
    updateData.paid_at = new Date().toISOString()
    updateData.status = 'paid'
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order payment status:', error)
    return false
  }

  return true
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string
): Promise<boolean> {
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

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return false
  }

  return true
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

/**
 * Get order by order number
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

/**
 * Get order by Razorpay order id.
 * migration-001 added the `razorpay_order_id` column to the orders table.
 * We also fall back to querying `payment_order_id` for older rows.
 */
export async function getOrderByPaymentOrderId(razorpayOrderId: string): Promise<Order | null> {
  // Try the new razorpay_order_id column first (added in migration-001)
  const { data: byRazorpay, error: err1 } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (!err1 && byRazorpay) return byRazorpay

  // Fall back to the original payment_order_id column
  const { data: byPaymentOrderId, error: err2 } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_order_id', razorpayOrderId)
    .maybeSingle()

  if (err2) {
    console.error('Error fetching order by payment order id:', err2)
    return null
  }

  return byPaymentOrderId ?? null
}

/**
 * Check whether a Razorpay payment has already been logged (idempotency guard).
 * Returns true if a row with this razorpay_payment_id already exists in payment_logs.
 */
export async function hasPaymentBeenLogged(razorpayPaymentId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('payment_logs')
    .select('id')
    .eq('razorpay_payment_id', razorpayPaymentId)
    .maybeSingle()

  if (error) {
    console.error('Error checking payment idempotency:', error)
    // On error, allow processing to continue to avoid silently dropping payments
    return false
  }

  return !!data
}

/**
 * Get order items
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching order items:', error)
    return []
  }

  return data || []
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(customerEmail: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }

  return data || []
}

/**
 * Log payment transaction.
 *
 * Uses the Razorpay columns added in migration-001:
 *   payment_logs.razorpay_order_id, razorpay_payment_id, razorpay_signature
 *
 * The original schema.sql columns (cashfree_order_id, cashfree_payment_id) still
 * exist in the table but are no longer populated here.
 */
export async function logPayment(paymentData: {
  order_id: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  amount: number
  payment_method?: string
  payment_status?: string
  response_data?: any
  error_message?: string
}): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('payment_logs')
    .insert({
      order_id: paymentData.order_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      amount: paymentData.amount,
      currency: 'INR',
      payment_method: paymentData.payment_method,
      payment_status: paymentData.payment_status,
      response_data: paymentData.response_data,
      error_message: paymentData.error_message,
    })

  if (error) {
    console.error('Error logging payment:', error)
    return false
  }

  return true
}
