/**
 * One-shot helper: link existing quote orders, or create an order only when
 * quoted_price is at least ₹1. Does not create ₹0 orders.
 *
 * Usage: npx tsx scripts/backfill-quote-orders.ts
 */
import { existsSync, readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import {
  CUSTOM_QUOTE_PRODUCT_ID,
  customQuoteProductName,
  quoteCustomerPhone,
  quoteOrderNotes,
} from '../lib/supabase/quote-order-notes'

function loadEnv(): void {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function main(): Promise<void> {
  const { data: quotes, error } = await supabase
    .from('quote_requests')
    .select('id, name, email, phone, type, description, quoted_price')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to list quotes:', error.message)
    process.exit(1)
  }

  let created = 0
  let linked = 0
  let failed = 0

  for (const quote of quotes ?? []) {
    const { data: existing } = await supabase
      .from('orders')
      .select('id, order_number')
      .ilike('notes', `%quote_id=${quote.id}%`)
      .limit(1)

    if (existing?.[0]) {
      await supabase.from('quote_requests').update({ order_id: existing[0].id }).eq('id', quote.id)
      linked += 1
      continue
    }

    const price = Number(quote.quoted_price)
    if (!Number.isFinite(price) || price < 1) {
      continue
    }
    const orderNumber = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: quote.name,
        customer_email: quote.email,
        customer_phone: quoteCustomerPhone(quote.phone),
        subtotal: price,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: price,
        payment_method: 'cod',
        payment_status: 'pending',
        status: 'pending',
        notes: quoteOrderNotes(quote.id, quote.type, quote.description),
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error(`Failed quote ${quote.id}:`, orderError?.message)
      failed += 1
      continue
    }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: null,
      product_name: customQuoteProductName(quote.type),
      price,
      quantity: 1,
      subtotal: price,
    })

    if (itemError) {
      await supabase.from('orders').delete().eq('id', order.id)
      console.error(`Failed items for quote ${quote.id}:`, itemError.message)
      failed += 1
      continue
    }

    const { error: linkError } = await supabase
      .from('quote_requests')
      .update({ order_id: order.id })
      .eq('id', quote.id)
    if (linkError && !/order_id|schema cache|does not exist/i.test(linkError.message)) {
      console.error(`Created order ${order.order_number} but could not set quote.order_id:`, linkError.message)
    }

    created += 1
  }

  console.log(`Backfill done. created=${created} already-linked=${linked} failed=${failed} product=${CUSTOM_QUOTE_PRODUCT_ID}`)
}

void main()
