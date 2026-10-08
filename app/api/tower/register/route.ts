import { NextRequest } from 'next/server'
import { z } from 'zod'
import { guard, readJson, respond } from '@/lib/tower/http'
import { registerPlayer } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().max(80),
  phone: z.string().max(32),
  marketingOptIn: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Enter your name and WhatsApp number.', status: 400 })
  return respond(await guard(() => registerPlayer(parsed.data)))
}
