import { NextRequest } from 'next/server'
import { z } from 'zod'
import { guard, readJson, respond, tokenFrom } from '@/lib/tower/http'
import { startRun } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

// startKey: one id per tap of "Play", so a retried request never burns a second try.
const startSchema = z.object({ startKey: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional() }).nullable()

export async function POST(request: NextRequest) {
  const parsed = startSchema.safeParse(await readJson(request))
  const startKey = parsed.success ? (parsed.data?.startKey ?? null) : null
  return respond(await guard(() => startRun(tokenFrom(request), startKey)))
}
