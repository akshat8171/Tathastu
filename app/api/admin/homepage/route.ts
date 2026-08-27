import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getHomepageSettings, saveHomepageSettings } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const settings = await getHomepageSettings()
  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const result = await saveHomepageSettings(body.settings ?? body)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ ok: true, settings: result.settings })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
