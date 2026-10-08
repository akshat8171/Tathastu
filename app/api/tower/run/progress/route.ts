import { NextRequest } from 'next/server'
import { z } from 'zod'
import { guard, readJson, respond, tokenFrom } from '@/lib/tower/http'
import { reportProgress } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const progressSchema = z.object({
  runId: z.string().uuid(),
  score: z.number().int().min(0).max(1_000_000),
  layers: z.number().int().min(0).max(10_000),
})

/** Live score for the race on the big screen. Display only — the final score is replayed. */
export async function POST(request: NextRequest) {
  const parsed = progressSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Bad progress.', status: 400 })
  return respond(await guard(() => reportProgress({ token: tokenFrom(request), ...parsed.data })))
}
