import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createQuoteFileSignedUrl, getQuoteById } from '@/lib/supabase/quotes'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const quote = await getQuoteById(id)
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }
  if (!quote.file_url) {
    return NextResponse.json({ error: 'No file attached' }, { status: 404 })
  }

  const url = await createQuoteFileSignedUrl(quote.file_url)
  if (!url) {
    return NextResponse.json({ error: 'Could not create download link' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
