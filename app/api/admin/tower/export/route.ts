import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { guard } from '@/lib/tower/http'
import { exportEventCsv } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const raw = Number(request.nextUrl.searchParams.get('event'))
  const result = await guard(() => exportEventCsv(Number.isInteger(raw) && raw > 0 ? raw : undefined))
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status ?? 500 })
  return new NextResponse(result.csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
