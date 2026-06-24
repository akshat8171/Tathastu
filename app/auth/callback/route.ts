import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * OAuth / PKCE callback handler.
 *
 * Google (and any other OAuth provider) redirects the browser here with a
 * `?code=...` after the user consents. We exchange that code for a session,
 * which sets the auth cookies via @supabase/ssr, then redirect the user on.
 *
 * SECURITY: the `next` query param is attacker-controllable, so it is an
 * open-redirect vector. We only honour values that are relative same-origin
 * paths (start with a single "/", not "//" or a scheme). Anything else falls
 * back to /account.
 */
function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  // Must be a relative path: starts with "/" but not "//" (protocol-relative)
  // and contains no scheme. Reject everything else.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
