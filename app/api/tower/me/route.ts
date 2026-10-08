import { NextRequest } from 'next/server'
import { guard, respond, tokenFrom } from '@/lib/tower/http'
import { getPlayer } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return respond(await guard(() => getPlayer(tokenFrom(request))))
}
