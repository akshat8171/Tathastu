import 'server-only'

import { supabaseAdmin } from './admin'
import { createOrder, upsertCustomerByPhone } from './orders'
import type { Order } from './client'
import { getQuoteById, listQuoteRequests } from './quotes'
import type { QuoteRow } from './quote-types'
import {
  CUSTOM_QUOTE_PRODUCT_ID,
  customQuoteProductName,
  quoteCustomerPhone,
  quoteOrderNotes,
} from './quote-order-notes'

export type EnsureQuoteOrderResult = {
  ok: boolean
  created: boolean
  quoteId: string
  orderId?: string
  orderNumber?: string
  error?: string
}

function isMissingColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || error.code === 'PGRST204'
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

  const phone = quoteCustomerPhone(quote.phone)
  const customerId = quote.phone?.trim()
    ? await upsertCustomerByPhone({
        phone: quote.phone,
        name: quote.name,
        email: quote.email,
      })
    : null
  const price = Number(quote.quoted_price) || 0

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
    return !quote.order_id
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
