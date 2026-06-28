import { NextResponse, type NextRequest } from 'next/server'
import { checkOtpRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * Rate-limit pre-check for phone OTP.
 *
 * The actual SMS is now sent client-side by the Firebase JS SDK (via
 * RecaptchaVerifier + signInWithPhoneNumber). This endpoint exists purely as
 * a server-side choke-point so an attacker cannot bypass the client cooldown
 * by scripting direct Firebase requests — we enforce an app-layer rate limit
 * before the browser SDK is permitted to proceed.
 *
 * Defense-in-depth layers:
 *   1. App-layer rate limit (per-phone + per-IP) — this route, via lib/rate-limit
 *   2. Firebase project quotas (Firebase console) — second line of defense
 *   3. reCAPTCHA enforced by Firebase's RecaptchaVerifier in the browser
 *
 * Rate-limit policy (unchanged from previous implementation):
 *   - 3 OTP requests per 15 min per phone number
 *   - 10 OTP requests per 60 min per IP address
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

  // Rate limit passed — the client may now trigger Firebase phone auth.
  return NextResponse.json({ success: true })
}
