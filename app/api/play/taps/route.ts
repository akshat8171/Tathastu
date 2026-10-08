import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GAME_MS, TICKET_PATTERN } from '@/lib/play/constants'
import { recordRun } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

const tapsSchema = z.object({
  ticket: z.string().trim().toUpperCase().regex(TICKET_PATTERN),
  tapsMs: z.array(z.number().int().min(0).max(GAME_MS)).max(24),
})

export async function POST(request: NextRequest) {
  const parsed = tapsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'This run could not be recorded.' }, { status: 400 })
  const recorded = await recordRun(parsed.data)
  if (!recorded.ok) return NextResponse.json({ error: recorded.error }, { status: 403 })
  return NextResponse.json({ factors: recorded.factors })
}
