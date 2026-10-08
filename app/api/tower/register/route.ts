import { NextRequest } from 'next/server'
import { z } from 'zod'
import { TICKET_PATTERN } from '@/lib/play/constants'
import { guard, readJson, respond } from '@/lib/tower/http'
import { registerPlayer } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  handle: z.string().max(120).optional(),
  displayName: z.string().max(80).optional(),
  passId: z.string().trim().toUpperCase().regex(TICKET_PATTERN).optional(),
})

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Enter your Instagram username.', status: 400 })
  return respond(await guard(() => registerPlayer(parsed.data)))
}
