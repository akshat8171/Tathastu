import { NextRequest } from 'next/server'
import { z } from 'zod'
import { MAX_LAYERS } from '@/lib/tower/constants'
import { guard, readJson, respond, tokenFrom } from '@/lib/tower/http'
import { submitRun } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const finishSchema = z.object({
  runId: z.string().uuid(),
  intervalsMs: z
    // Long gaps (phone locked mid-game) are clamped by the service, not rejected here —
    // a 400 would make the phone drop the run and leave it untracked.
    .array(z.number().int().min(0).max(24 * 60 * 60 * 1000))
    .max(MAX_LAYERS + 1),
})

export async function POST(request: NextRequest) {
  const parsed = finishSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'This game could not be read.', status: 400 })
  return respond(await guard(() => submitRun({ token: tokenFrom(request), ...parsed.data })))
}
