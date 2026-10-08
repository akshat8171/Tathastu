import { NextRequest, NextResponse } from 'next/server'
import { TICKET_PATTERN } from '@/lib/play/constants'
import { loadPass } from '@/lib/play/repository'
import { openPlayPass } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

export async function POST() {
  const opened = await openPlayPass()
  if (!opened.ok) return NextResponse.json({ error: opened.error }, { status: 500 })
  return NextResponse.json({ ticket: opened.ticket, dmUrl: opened.dmUrl, message: `PLAY ${opened.ticket}` })
}

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket')?.trim().toUpperCase() ?? ''
  if (!TICKET_PATTERN.test(ticket)) {
    return NextResponse.json({ error: 'Missing play pass.' }, { status: 400 })
  }
  const pass = await loadPass(ticket)
  if (!pass) return NextResponse.json({ error: 'Play pass not found.' }, { status: 404 })
  return NextResponse.json({
    ticket: pass.id,
    status: pass.status,
    username: pass.igUsername,
    rejectionReason: pass.rejectionReason,
  })
}
