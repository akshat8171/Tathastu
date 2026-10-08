import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/lib/tower/http'
import { TOWER_MEMORY_STORE } from '@/lib/tower/repository'
import { exportEventCsv } from '@/lib/tower/service'

export const dynamic = 'force-dynamic'

/** CSV export for LOCAL DEV ONLY (in-memory store). 404 everywhere else. */
export async function GET(request: NextRequest) {
  if (!TOWER_MEMORY_STORE) return NextResponse.json({ error: 'Not found' }, { status: 404 })
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
