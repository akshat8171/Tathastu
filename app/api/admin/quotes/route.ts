import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  listQuoteRequests,
  updateQuoteStatus,
  QUOTE_STATUSES,
  type QuoteStatus,
} from '@/lib/supabase/quotes'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const result = await listQuoteRequests()
  if (!result.ok) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }

  return NextResponse.json({ quotes: result.quotes })
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
