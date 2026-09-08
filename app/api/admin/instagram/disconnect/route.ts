import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { deleteInstagramConnection } from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const result = await deleteInstagramConnection()
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
