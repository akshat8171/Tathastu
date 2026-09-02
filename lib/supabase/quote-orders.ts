import 'server-only'

import { supabaseAdmin } from './admin'
import { createOrder, upsertCustomerByPhone } from './orders'
import type { Order } from './client'
import { getQuoteById, listQuoteRequests, updateQuotePrice, updateQuoteStatus } from './quotes'
import type { QuoteRow } from './quote-types'
import {
  CUSTOM_QUOTE_PRODUCT_ID,
  customQuoteProductName,
  quoteCustomerPhone,
  quoteOrderNotes,
  requireQuotedPrice,
} from './quote-order-notes'

export type EnsureQuoteOrderResult = {
  ok: boolean
  created: boolean
  quoteId: string
  orderId?: string
  orderNumber?: string
  error?: string
}

export type SetQuotedPriceResult = {
  ok: boolean
  quoteId: string
  price?: number
  orderUpdated?: boolean
  error?: string
}

function isMissingColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || error.code === 'PGRST204'
}

function isOrderPriceLocked(order: Pick<Order, 'payment_status' | 'status'>): string | null {
  if (order.payment_status === 'paid') return 'This order is already paid. Price cannot be changed.'
  if (order.status === 'cancelled' || order.status === 'delivered') {
    return 'Price cannot be changed on a cancelled or delivered order.'
  }
  return null
}

async function findOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return data as Order
  } catch {
    return null
  }
}

async function findOrderByQuoteNotes(quoteId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .ilike('notes', `%quote_id=${quoteId}%`)
      .limit(1)
    if (error || !data?.[0]) return null
    return data[0] as Order
  } catch {
    return null
  }
}

async function linkQuoteToOrder(quoteId: string, orderId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('quote_requests')
      .update({ order_id: orderId })
      .eq('id', quoteId)
    if (error && !isMissingColumn(error)) {
      console.error('[quote-orders] linkQuoteToOrder failed:', error.message)
    }
  } catch (err) {
    console.error('[quote-orders] linkQuoteToOrder unexpected:', err)
  }
}

export async function findOrderForQuote(quote: Pick<QuoteRow, 'id' | 'order_id'>): Promise<Order | null> {
  if (quote.order_id) {
    const linked = await findOrderById(quote.order_id)
    if (linked) return linked
  }
  return findOrderByQuoteNotes(quote.id)
}

async function applyQuotedPriceToOrder(
  order: Order,
  unitPrice: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locked = isOrderPriceLocked(order)
  if (locked) return { ok: false, error: locked }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('id, quantity, price')
    .eq('order_id', order.id)

  if (itemsError || !items?.length) {
    return { ok: false, error: 'Order has no line items to reprice' }
  }

  const [first, ...rest] = items
  const quantity = Number(first.quantity) || 1
  const firstSubtotal = unitPrice * quantity
  const restTotal = rest.reduce(
    (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
    0
  )
  const subtotal = firstSubtotal + restTotal
  const total =
    subtotal - (Number(order.discount) || 0) + (Number(order.tax) || 0) + (Number(order.shipping) || 0)

  const { error: itemUpdateError } = await supabaseAdmin
    .from('order_items')
    .update({ price: unitPrice, subtotal: firstSubtotal })
    .eq('id', first.id)

  if (itemUpdateError) {
    console.error('[quote-orders] reprice item failed:', itemUpdateError.message)
    return { ok: false, error: 'Could not update the order line price' }
  }

  const { error: orderUpdateError } = await supabaseAdmin
    .from('orders')
    .update({ subtotal, total })
    .eq('id', order.id)

  if (orderUpdateError) {
    console.error('[quote-orders] reprice order failed:', orderUpdateError.message)
    return { ok: false, error: 'Could not update the order total' }
  }

  return { ok: true }
}

export async function setQuotedPrice(quoteId: string, rawPrice: unknown): Promise<SetQuotedPriceResult> {
  const parsed = requireQuotedPrice(rawPrice)
  if (!parsed.ok) return { ok: false, quoteId, error: parsed.error }

  const quote = await getQuoteById(quoteId)
  if (!quote) return { ok: false, quoteId, error: 'Quote not found' }

  const nextStatus = quote.status === 'new' ? 'quoted' : undefined
  const saved = await updateQuotePrice(quote.id, parsed.price, nextStatus)
  if (!saved.ok) return { ok: false, quoteId, error: saved.error || 'Could not save quoted price' }

  const existing = await findOrderForQuote(quote)
  if (!existing) {
    return { ok: true, quoteId: quote.id, price: parsed.price, orderUpdated: false }
  }

  const applied = await applyQuotedPriceToOrder(existing, parsed.price)
  if (!applied.ok) return { ok: false, quoteId, price: parsed.price, error: applied.error }

  if (quote.order_id !== existing.id) {
    await linkQuoteToOrder(quote.id, existing.id)
  }

  return { ok: true, quoteId: quote.id, price: parsed.price, orderUpdated: true }
}

export async function ensureOrderForQuote(quoteId: string): Promise<EnsureQuoteOrderResult> {
  const quote = await getQuoteById(quoteId)
  if (!quote) {
    return { ok: false, created: false, quoteId, error: 'Quote not found' }
  }

  const existing = await findOrderForQuote(quote)
  if (existing) {
    if (quote.order_id !== existing.id) {
      await linkQuoteToOrder(quote.id, existing.id)
    }
    return {
      ok: true,
      created: false,
      quoteId: quote.id,
      orderId: existing.id,
      orderNumber: existing.order_number,
    }
  }

  const parsed = requireQuotedPrice(quote.quoted_price)
  if (!parsed.ok) {
    return { ok: false, created: false, quoteId: quote.id, error: parsed.error }
  }

  const phone = quoteCustomerPhone(quote.phone)
  const customerId = quote.phone?.trim()
    ? await upsertCustomerByPhone({
        phone: quote.phone,
        name: quote.name,
        email: quote.email,
      })
    : null
  const price = parsed.price

  const { order, error } = await createOrder({
    customer_name: quote.name,
    customer_email: quote.email,
    customer_phone: phone,
    customer_id: customerId,
    items: [
      {
        product_id: CUSTOM_QUOTE_PRODUCT_ID,
        product_name: customQuoteProductName(quote.type),
        quantity: 1,
        price,
      },
    ],
    subtotal: price,
    total: price,
    payment_method: 'cod',
    notes: quoteOrderNotes(quote.id, quote.type, quote.description),
  })

  if (!order) {
    console.error('[quote-orders] createOrder failed:', error)
    return {
      ok: false,
      created: false,
      quoteId: quote.id,
      error: 'Could not create an order for this custom request',
    }
  }

  await linkQuoteToOrder(quote.id, order.id)
  await updateQuoteStatus(quote.id, 'approved')
  return {
    ok: true,
    created: true,
    quoteId: quote.id,
    orderId: order.id,
    orderNumber: order.order_number,
  }
}

export async function ensureOrdersForUnlinkedQuotes(
  ids?: string[]
): Promise<{ ok: true; results: EnsureQuoteOrderResult[] } | { ok: false; error: string }> {
  const list = await listQuoteRequests()
  if (!list.ok) return { ok: false, error: list.error }

  const wanted = ids?.length ? new Set(ids) : null
  const targets = list.quotes.filter((quote) => {
    if (wanted && !wanted.has(quote.id)) return false
    if (quote.order_id) return false
    return requireQuotedPrice(quote.quoted_price).ok
  })

  const results: EnsureQuoteOrderResult[] = []
  for (const quote of targets) {
    results.push(await ensureOrderForQuote(quote.id))
  }
  return { ok: true, results }
}

export async function enrichQuotesWithOrders(quotes: QuoteRow[]): Promise<QuoteRow[]> {
  const orderIds = quotes.map((quote) => quote.order_id).filter((id): id is string => Boolean(id))
  if (orderIds.length === 0) return quotes

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, status')
      .in('id', orderIds)
    if (error || !data) return quotes
    const byId = new Map(data.map((row) => [row.id as string, row]))
    return quotes.map((quote) => {
      const order = quote.order_id ? byId.get(quote.order_id) : undefined
      if (!order) return quote
      return {
        ...quote,
        order_number: String(order.order_number),
        order_total: Number(order.total) || 0,
        order_status: String(order.status),
      }
    })
  } catch {
    return quotes
  }
}
