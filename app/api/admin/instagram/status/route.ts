import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getInstagramRedirectUri, isInstagramConfigured } from '@/lib/instagram/config'
import { loadInstagramConnection } from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const origin = `${request.nextUrl.protocol}//${request.nextUrl.host}`
  const configured = isInstagramConfigured()
  const loaded = await loadInstagramConnection()
  if (!loaded.ok) {
    return NextResponse.json({
      configured,
      connected: false,
      redirectUri: getInstagramRedirectUri(origin),
      error: loaded.error,
    })
  }

  return NextResponse.json({
    configured,
    connected: Boolean(loaded.connection),
    username: loaded.connection?.username ?? null,
    redirectUri: getInstagramRedirectUri(origin),
  })
}
