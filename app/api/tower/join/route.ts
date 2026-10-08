import { NextRequest } from 'next/server'
import { z } from 'zod'
import { guard, readJson, respond, tokenFrom } from '@/lib/tower/http'
import { joinRound } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const joinSchema = z.object({ code: z.string().max(12) })

/** The player types the code the host read out loud. */
export async function POST(request: NextRequest) {
  const parsed = joinSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Enter the 4-digit game code.', status: 400 })
  return respond(await guard(() => joinRound(tokenFrom(request), parsed.data.code)))
}
