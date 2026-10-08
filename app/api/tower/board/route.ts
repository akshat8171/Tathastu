import { loadBoard } from '@/lib/tower/service'
import { guard, respond } from '@/lib/tower/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await guard(() => loadBoard())
  return respond(result)
}
