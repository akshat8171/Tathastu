import { NextRequest, NextResponse } from 'next/server'
import { TICKET_PATTERN } from '@/lib/play/constants'
import { loadPlayerState } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket')?.trim().toUpperCase() ?? ''
  if (!TICKET_PATTERN.test(ticket)) {
    return NextResponse.json({ error: 'Missing play pass.' }, { status: 400 })
  }
  const state = await loadPlayerState(ticket)
  return NextResponse.json(state)
}
