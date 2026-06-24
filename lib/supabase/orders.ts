import { supabase, Order, OrderItem } from './client'

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  customer_name: string
  customer_email: string
  customer_phone: string
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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
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

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_variant: item.product_variant,
      product_image: item.product_image,
      price: item.price,
      original_price: item.original_price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback order if items insert fails
      await supabase.from('orders').delete().eq('id', order.id)
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

  const { error } = await supabase
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

  const { error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data: byRazorpay, error: err1 } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (!err1 && byRazorpay) return byRazorpay

  // Fall back to the original payment_order_id column
  const { data: byPaymentOrderId, error: err2 } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { error } = await supabase
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
