import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAllowlistedAdminEmail } from '@/lib/auth/admin-emails'
import { getPostLoginPath } from '@/lib/auth/post-login-path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * OAuth / email-confirmation / password-recovery callback.
 *
 * Supabase redirects here after Google sign-in (or an email link) with a
 * `?code=...`. We exchange that code for a session and forward the user on.
 *
 * COOKIE HANDLING (why this is written the way it is):
 * We collect Set-Cookie mutations during exchangeCodeForSession, then write
 * them onto the final redirect Response so they ride with the 3xx. Destination
 * is chosen after we know who signed in (admin → /admin).
 *
 * `next` is sanitized to a same-site path to prevent open-redirects.
 */

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const pendingCookies: Array<{
    name: string
    value: string
    options?: Parameters<NextResponse['cookies']['set']>[2]
  }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options })
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth callback exchange failed:', error)
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin =
    Boolean(user?.email) &&
    Boolean(user?.email_confirmed_at) &&
    isAllowlistedAdminEmail(user?.email)

  const destination = getPostLoginPath(isAdmin, next)
  const response = NextResponse.redirect(`${origin}${destination}`)

  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  )

  return response
}
