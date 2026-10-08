import { NextRequest } from 'next/server'
import { guard, respond, tokenFrom } from '@/lib/tower/http'
import { releasePlayer } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return respond(await guard(() => releasePlayer(tokenFrom(request))))
}
