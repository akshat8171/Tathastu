import { z } from 'zod'

/** Host console actions, shared by /api/admin/tower and the local-dev host API. */
const attempts = z.number().int().min(1).max(20)

export const adminActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create-event'), name: z.string().max(80), attemptsPerPlayer: attempts }),
  z.object({ action: z.literal('set-status'), status: z.enum(['open', 'closed']) }),
  z.object({ action: z.literal('set-attempts'), attemptsPerPlayer: attempts }),
  z.object({ action: z.literal('new-round') }),
  z.object({ action: z.literal('start-round') }),
  z.object({ action: z.literal('end-round') }),
  z.object({ action: z.literal('show-code'), show: z.boolean() }),
  z.object({ action: z.literal('announce'), expectedPlayerId: z.string().uuid().optional() }),
  z.object({ action: z.literal('unannounce') }),
  z.object({ action: z.literal('disqualify'), playerId: z.string().uuid(), disqualified: z.boolean() }),
  z.object({ action: z.literal('grant-attempt'), playerId: z.string().uuid() }),
  z.object({ action: z.literal('reset-device'), playerId: z.string().uuid() }),
])
