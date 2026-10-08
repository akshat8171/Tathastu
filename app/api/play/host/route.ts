import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { announceDraw, clearDraws } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

const hostSchema = z.object({
  action: z.enum(['announce', 'reset']),
})

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const parsed = hostSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Unknown host action.' }, { status: 400 })
  if (parsed.data.action === 'reset') {
    const cleared = await clearDraws()
    if (!cleared.ok) return NextResponse.json({ error: cleared.error }, { status: 500 })
    return NextResponse.json({ reset: true })
  }
  const opened = await announceDraw()
  if (!opened.ok) return NextResponse.json({ error: opened.error }, { status: 409 })
  return NextResponse.json({ round: opened.round })
}
