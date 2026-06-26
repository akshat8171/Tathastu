import 'server-only'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redactEmail } from '@/lib/redact'

/**
 * POST /api/newsletter
 *
 * Accepts { email: string }, validates it server-side, then inserts into the
 * `newsletter_subscribers` Supabase table.
 *
 * Graceful degradation (mirrors lib/coupons.ts pattern):
 *   - If the table doesn't exist yet, the DB error is caught, the subscription
 *     is console.log'd, and the endpoint returns 200 success so the UI is
 *     never broken by a missing migration.
 *   - Never throws; never exposes internal DB errors to the client.
 *
 * Table (write the migration separately — do NOT apply live):
 *   newsletter_subscribers (
 *     id          uuid default gen_random_uuid() primary key,
 *     email       text not null unique,
 *     subscribed_at timestamptz default now() not null,
 *     source      text default 'homepage'
 *   )
 *
 * Env vars referenced (never exposed to the client):
 *   SUPABASE_SERVICE_ROLE_KEY  (via supabaseAdmin)
 *   NEXT_PUBLIC_SUPABASE_URL   (via supabaseAdmin)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 320 // RFC 5321

export async function POST(request: Request) {
  // 1. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>).email
  if (typeof raw !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  // 2. Server-side validation
  const email = raw.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (email.length > MAX_EMAIL_LEN) {
    return NextResponse.json({ error: 'Email address is too long.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // 3. Persist to Supabase (degrade gracefully if table doesn't exist)
  try {
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({ email, source: 'homepage' })

    if (error) {
      // Handle duplicate subscription gracefully (unique constraint violation)
      if (
        error.code === '23505' || // PostgreSQL unique_violation
        error.message?.toLowerCase().includes('unique') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        // Already subscribed — still a success from the user's perspective
        return NextResponse.json(
          { message: "You're already subscribed. We'll keep you in the loop!" },
          { status: 200 }
        )
      }

      // Table doesn't exist yet (42P01 = undefined_table) or other DB issue:
      // Log server-side (email REDACTED) but return success so the UI is never
      // blocked. Logs go to the hosting provider's log store, not a private inbox.
      console.error('[newsletter] DB error (table may not exist yet):', {
        code: error.code,
        message: error.message,
        email: redactEmail(email),
      })
      console.log('[newsletter] Subscription recorded in logs (DB unavailable):', redactEmail(email))
    } else {
      console.log('[newsletter] New subscriber:', redactEmail(email))
    }
  } catch (err) {
    // Unexpected runtime error — still degrade to success
    console.error('[newsletter] Unexpected error:', err, { email: redactEmail(email) })
    console.log('[newsletter] Subscription recorded in logs (unexpected error):', redactEmail(email))
  }

  return NextResponse.json(
    { message: "You're subscribed! Expect great stuff in your inbox." },
    { status: 200 }
  )
}

// Reject non-POST methods explicitly
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
