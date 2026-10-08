import { loadBoard } from '@/lib/tower/service'
import { guard, respondShared } from '@/lib/tower/http'

export const dynamic = 'force-dynamic'

/** Public board: no names-to-numbers, nothing per player. Cached for a second at the CDN. */
export async function GET() {
  return respondShared(await guard(() => loadBoard()))
}
