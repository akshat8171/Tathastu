import { supabaseAdmin } from './admin'
import type { Order, OrderItem } from './client'
import { toE164 } from '@/lib/auth/identifier'
import { escapeLike } from './account'

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
 * Read-only lookup of an existing customer's UUID by phone number, WITHOUT
 * creating a row. Used by the advisory coupon-validate path so first-order
 * gating can be evaluated against the same id (`customers.id` = orders.customer_id)
 * that the money path uses — see lib/coupons.ts isFirstOrder().
 *
 * Returns the customers.id for a known phone, or null when the phone is unknown,
 * un-normalizable, or the lookup errors (degrades to "treat as new customer").
 * Never throws.
 */
export async function getCustomerIdByPhone(phone: string): Promise<string | null> {
  const e164 = toE164(phone)
  if (!e164) return null

  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', e164)
      .maybeSingle()

    if (error || !data) return null
    return (data as { id: string }).id
  } catch (err) {
    console.error('getCustomerIdByPhone: unexpected error', err)
    return null
  }
}

function isMissingColumn(error: { code?: string } | null | undefined): boolean {
  const code = error?.code
  return code === '42703' || code === 'PGRST204'
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
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
  status?: Order['status']
  notes?: string
  created_at?: string
  // Structured shipping geography (migration-008). Optional so older callers
  // and DBs without the columns degrade gracefully — see the insert note below.
  shipping_state?: string
  shipping_city?: string
  shipping_pincode?: string
  // Full structured delivery address (migration-001 JSONB column). Stored so the
  // account address-book backfill can read it back without parsing `notes`.
  shipping_address?: {
    name: string
    phone: string
    address_line: string
    city: string
    state: string
    pincode: string
  }
  // Offline workshop fields (migration-015). Optional so checkout is unchanged
  // and a DB without the columns still accepts the insert.
  channel?: 'online' | 'offline'
  print_status?: string | null
  item_delivered?: string | null
  cost?: number | null
  amount_collected?: number | null
  offline_payment_status?: string | null
}): Promise<{ order: Order | null; error: any }> {
  try {
    // Generate order number
    const orderNumber = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`

    const paymentStatus = orderData.payment_status || 'pending'
    const status = orderData.status || 'pending'

    // Base row — always present columns.
    const baseRow: Record<string, unknown> = {
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
      payment_status: paymentStatus,
      status,
      notes: orderData.notes,
    }
    if (orderData.created_at) baseRow.created_at = orderData.created_at
    if (paymentStatus === 'paid') baseRow.paid_at = new Date().toISOString()
    if (status === 'delivered') baseRow.delivered_at = new Date().toISOString()
    if (status === 'cancelled') baseRow.cancelled_at = new Date().toISOString()
    if (status === 'shipped') baseRow.shipped_at = new Date().toISOString()

    // Structured shipping geography (migration-008). Kept separate so that a DB
    // where migration-008 hasn't run yet doesn't break checkout: if the insert
    // fails because these columns don't exist, we retry with baseRow only. The
    // free-text `notes` field still carries the address either way, and the
    // migration's backfill reconstructs state/pincode from notes retroactively.
    const geographyRow: Record<string, unknown> = {}
    if (orderData.shipping_state) geographyRow.shipping_state = orderData.shipping_state
    if (orderData.shipping_city) geographyRow.shipping_city = orderData.shipping_city
    if (orderData.shipping_pincode) geographyRow.shipping_pincode = orderData.shipping_pincode
    if (orderData.shipping_address) geographyRow.shipping_address = orderData.shipping_address

    const offlineRow: Record<string, unknown> = {}
    if (orderData.channel) offlineRow.channel = orderData.channel
    if (orderData.print_status) offlineRow.print_status = orderData.print_status
    if (orderData.item_delivered) offlineRow.item_delivered = orderData.item_delivered
    if (orderData.cost != null) offlineRow.cost = orderData.cost
    if (orderData.amount_collected != null) offlineRow.amount_collected = orderData.amount_collected
    if (orderData.offline_payment_status) {
      offlineRow.offline_payment_status = orderData.offline_payment_status
    }

    const insertAttempts: Record<string, unknown>[] = [
      { ...baseRow, ...geographyRow, ...offlineRow },
      { ...baseRow, ...geographyRow },
      baseRow,
    ]

    let order: Order | null = null
    let orderError: { code?: string; message?: string } | null = null
    const seen = new Set<string>()
    for (const row of insertAttempts) {
      const key = Object.keys(row).sort().join(',')
      if (seen.has(key)) continue
      seen.add(key)
      const result = await supabaseAdmin.from('orders').insert(row).select().single()
      order = (result.data as Order | null) ?? null
      orderError = result.error
      if (!orderError && order) break
      if (!isMissingColumn(orderError)) break
      console.error('createOrder: optional columns missing; retrying with a smaller row', {
        code: orderError?.code,
        msg: orderError?.message,
      })
    }

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
  const updateData: Record<string, unknown> = {
    payment_status: paymentStatus,
  }

  if (paymentId) {
    updateData.payment_id = paymentId
    updateData.razorpay_payment_id = paymentId
  }
  if (paymentOrderId) {
    updateData.payment_order_id = paymentOrderId
    updateData.razorpay_order_id = paymentOrderId
  }

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
 * Guest order lookup: find an order by order number AND email.
 * This is the secure guest track-order path — both must match to prevent
 * order number enumeration attacks.
 */
export async function getOrderByNumberAndEmail(
  orderNumber: string,
  email: string
): Promise<Order | null> {
  // Escape LIKE metacharacters so `_`/`%` in the supplied email are matched
  // literally (exact, case-insensitive) rather than as wildcards.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber.trim())
    .ilike('customer_email', escapeLike(email.trim().toLowerCase()))
    .maybeSingle()

  if (error) {
    console.error('Error fetching order by number+email:', error)
    return null
  }

  return data ?? null
}

/**
 * Get order by gateway order id (Razorpay order_id).
 * Looks up `payment_order_id` first, then `razorpay_order_id` (migration-001).
 */
export async function getOrderByPaymentOrderId(gatewayOrderId: string): Promise<Order | null> {
  const { data: byPaymentOrderId, error: err1 } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_order_id', gatewayOrderId)
    .maybeSingle()

  if (!err1 && byPaymentOrderId) return byPaymentOrderId

  const { data: byRazorpay, error: err2 } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', gatewayOrderId)
    .maybeSingle()

  if (err2) {
    console.error('Error fetching order by payment order id:', err2)
    return null
  }

  return byRazorpay ?? null
}

/**
 * Idempotency guard — true if this gateway payment id was already logged.
 * Checks razorpay_payment_id first, then legacy cashfree_payment_id.
 */
export async function hasPaymentBeenLogged(gatewayPaymentId: string): Promise<boolean> {
  const { data: byRazorpay, error: err1 } = await supabaseAdmin
    .from('payment_logs')
    .select('id')
    .eq('razorpay_payment_id', gatewayPaymentId)
    .maybeSingle()

  if (!err1 && byRazorpay) return true

  const { data: byCashfree, error: err2 } = await supabaseAdmin
    .from('payment_logs')
    .select('id')
    .eq('cashfree_payment_id', gatewayPaymentId)
    .maybeSingle()

  if (err2) {
    console.error('Error checking payment idempotency:', err2)
    return false
  }

  return !!byCashfree
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
 * Prefers Razorpay columns (migration-001). Also mirrors ids into legacy
 * cashfree_* columns so older admin queries still find the row.
 */
export async function logPayment(paymentData: {
  order_id: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  cashfree_order_id?: string
  cashfree_payment_id?: string
  amount: number
  payment_method?: string
  payment_status?: string
  response_data?: unknown
  error_message?: string
}): Promise<boolean> {
  const razorpayOrderId = paymentData.razorpay_order_id || paymentData.cashfree_order_id
  const razorpayPaymentId = paymentData.razorpay_payment_id || paymentData.cashfree_payment_id
  const { error } = await supabaseAdmin.from('payment_logs').insert({
    order_id: paymentData.order_id,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: paymentData.razorpay_signature,
    cashfree_order_id: razorpayOrderId,
    cashfree_payment_id: razorpayPaymentId,
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
