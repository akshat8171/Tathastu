import { NextRequest, NextResponse } from 'next/server'
import { adminActionSchema } from '@/lib/tower/admin-actions'
import { guard, readJson, respond } from '@/lib/tower/http'
import { TOWER_MEMORY_STORE } from '@/lib/tower/repository'
import { adminSnapshot, runAdminAction } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

/**
 * Host API for LOCAL DEV ONLY. It exists only while `npm run dev` runs on the in-memory
 * store (no Supabase, no login available). Everywhere else it is a 404; the real host
 * console is /admin/tower behind requireAdmin.
 */
const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

export async function GET() {
  if (!TOWER_MEMORY_STORE) return notFound()
  return respond(await guard(() => adminSnapshot()))
}

export async function POST(request: NextRequest) {
  if (!TOWER_MEMORY_STORE) return notFound()
  const parsed = adminActionSchema.safeParse(await readJson(request))
  if (!parsed.success) return respond({ ok: false, error: 'Unknown action.', status: 400 })
  return respond(await guard(() => runAdminAction(parsed.data)))
}
