import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { isInstagramConfigured } from '@/lib/instagram/config'
import {
  fetchAccountInsights,
  fetchInstagramProfile,
  fetchRecentMedia,
} from '@/lib/instagram/dashboard'
import { getUsableAccessToken, saveInstagramConnection } from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  if (!isInstagramConfigured()) {
    return NextResponse.json({ error: 'Instagram app is not configured' }, { status: 400 })
  }

  const token = await getUsableAccessToken()
  if (!token.ok) {
    return NextResponse.json({ error: token.error }, { status: 409 })
  }

  try {
    const profile = await fetchInstagramProfile(token.connection.accessToken)
    if (profile.username && profile.username !== token.connection.username) {
      const expiresInSec = token.connection.tokenExpiresAt
        ? Math.max(60, Math.floor((Date.parse(token.connection.tokenExpiresAt) - Date.now()) / 1000))
        : 60 * 24 * 60 * 60
      await saveInstagramConnection({
        igUserId: profile.id,
        username: profile.username,
        accessToken: token.connection.accessToken,
        expiresInSec,
        connectedByEmail: auth.user.email ?? null,
      })
    }

    const [insights, media] = await Promise.all([
      fetchAccountInsights(profile.id, token.connection.accessToken),
      fetchRecentMedia(token.connection.accessToken),
    ])

    return NextResponse.json({ profile, insights, media })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load Instagram'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
