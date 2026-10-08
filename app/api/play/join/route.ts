import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ROUND_CODE_PATTERN, TICKET_PATTERN } from '@/lib/play/constants'
import { joinDraw } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

const joinSchema = z.object({
  ticket: z.string().trim().toUpperCase().regex(TICKET_PATTERN),
  code: z.string().trim().toUpperCase().regex(ROUND_CODE_PATTERN),
})

export async function POST(request: NextRequest) {
  const parsed = joinSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter the four-letter code from the monitor.' }, { status: 400 })
  const joined = await joinDraw(parsed.data)
  if (!joined.ok) return NextResponse.json({ error: joined.error }, { status: 403 })
  return NextResponse.json({ joined: true })
}
