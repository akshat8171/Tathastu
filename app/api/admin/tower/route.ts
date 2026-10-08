import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { guard, readJson, respond } from '@/lib/tower/http'
import { adminSnapshot, runAdminAction } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

const attempts = z.number().int().min(1).max(20)

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create-event'), name: z.string().max(80), attemptsPerPlayer: attempts }),
  z.object({ action: z.literal('set-status'), status: z.enum(['open', 'closed']) }),
  z.object({ action: z.literal('set-attempts'), attemptsPerPlayer: attempts }),
  z.object({ action: z.literal('announce'), expectedPlayerId: z.string().uuid().optional() }),
  z.object({ action: z.literal('unannounce') }),
  z.object({ action: z.literal('disqualify'), playerId: z.string().uuid(), disqualified: z.boolean() }),
  z.object({ action: z.literal('grant-attempt'), playerId: z.string().uuid() }),
  z.object({ action: z.literal('reset-device'), playerId: z.string().uuid() }),
])

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  return respond(await guard(() => adminSnapshot()))
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const parsed = actionSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Unknown action.', status: 400 })
  return respond(await guard(() => runAdminAction(parsed.data)))
}
