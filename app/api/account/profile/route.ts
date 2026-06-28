import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getProfile, upsertProfile } from '@/lib/supabase/account'

export const runtime = 'nodejs'

/** Simple RFC 5322–inspired email regex sufficient for server-side validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── GET /api/account/profile ─────────────────────────────────────────────────

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getProfile(user.id)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('GET /api/account/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/account/profile ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { first_name?: unknown; last_name?: unknown; email?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const first_name =
      typeof body.first_name === 'string' ? body.first_name.trim() : undefined
    const last_name =
      typeof body.last_name === 'string' ? body.last_name.trim() : undefined
    const emailRaw =
      typeof body.email === 'string' ? body.email.trim() : undefined

    // Validate email format when an email value is provided (non-empty).
    if (emailRaw && !EMAIL_RE.test(emailRaw)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const profile = await upsertProfile(user.id, {
      first_name,
      last_name,
      email: emailRaw || undefined,
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to save profile. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('POST /api/account/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
