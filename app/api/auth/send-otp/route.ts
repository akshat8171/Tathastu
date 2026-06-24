import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkOtpRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * Server-side OTP send endpoint.
 *
 * The phone-OTP form POSTs here instead of calling Supabase directly from the
 * browser, so we get a real server choke-point to rate limit (an attacker can
 * no longer bypass the client-side cooldown by scripting the request).
 *
 * Layers of protection:
 *  1. App-layer rate limit (per-phone + per-IP) — this route, via lib/rate-limit
 *  2. Supabase project rate limits (dashboard) — second line of defense
 *  3. CAPTCHA on the Supabase auth endpoint (dashboard) — see AUTH_SETUP_GUIDE
 */
export async function POST(request: NextRequest) {
  let body: { phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const raw = (body.phone ?? '').replace(/\D/g, '')
  if (raw.length !== 10 || !/^[6-9]/.test(raw)) {
    return NextResponse.json(
      { error: 'Enter a valid 10-digit Indian mobile number' },
      { status: 400 }
    )
  }
  const phone = `+91${raw}`

  // Best-effort client IP (Vercel sets x-forwarded-for).
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const rl = await checkOtpRateLimit(phone, ip)
  if (!rl.success) {
    return NextResponse.json(
      {
        error:
          'Too many OTP requests. Please wait a while before trying again.',
      },
      { status: 429 }
    )
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called outside a mutable cookie context — ignore
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithOtp({ phone })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
