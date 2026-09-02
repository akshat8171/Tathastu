import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  listQuoteRequests,
  updateQuoteStatus,
  QUOTE_STATUSES,
  type QuoteStatus,
} from '@/lib/supabase/quotes'
import {
  enrichQuotesWithOrders,
  ensureOrderForQuote,
  ensureOrdersForUnlinkedQuotes,
} from '@/lib/supabase/quote-orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const result = await listQuoteRequests()
  if (!result.ok) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }

  const quotes = await enrichQuotesWithOrders(result.quotes)
  return NextResponse.json({ quotes })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = (await request.json().catch(() => ({}))) as { ids?: unknown; id?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.map((value) => String(value)).filter(Boolean)
      : body.id
        ? [String(body.id)]
        : undefined

    if (ids?.length === 1) {
      const result = await ensureOrderForQuote(ids[0])
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json(result)
    }

    const batch = await ensureOrdersForUnlinkedQuotes(ids)
    if (!batch.ok) {
      return NextResponse.json({ error: batch.error }, { status: 500 })
    }
    const created = batch.results.filter((row) => row.ok && row.created).length
    const linked = batch.results.filter((row) => row.ok && !row.created).length
    const failed = batch.results.filter((row) => !row.ok).length
    return NextResponse.json({
      ok: true,
      created,
      linked,
      failed,
      results: batch.results,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const id = String(body.id ?? body.quoteId ?? '')
    const status = String(body.status ?? '') as QuoteStatus

    if (!id || !QUOTE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 })
    }

    const result = await updateQuoteStatus(id, status)
    if (!result.ok) {
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.id, status })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
