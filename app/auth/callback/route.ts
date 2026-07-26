import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * OAuth / email-confirmation / password-recovery callback.
 *
 * Supabase redirects here after Google sign-in (or an email link) with a
 * `?code=...`. We exchange that code for a session and forward the user on.
 *
 * COOKIE HANDLING (why this is written the way it is):
 * We build the redirect Response FIRST and let `exchangeCodeForSession` write
 * the session cookies straight onto THAT response via the `setAll` adapter.
 * This guarantees the `Set-Cookie` headers ride along with the 3xx redirect,
 * instead of relying on the framework implicitly merging next/headers
 * `cookies()` mutations onto a separately-constructed redirect. On an auth path
 * we prefer the explicit, provably-correct version.
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

  // Success target — cookies get written onto this exact response object.
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      // Not httpOnly: the browser client must be able to read this session
      // (via document.cookie) for OAuth session detection and the password-
      // reset flow to work. Attributes match lib/supabase/server.ts.
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        // Read the incoming cookies (incl. the PKCE code-verifier the browser
        // client stored when signInWithOAuth was called).
        getAll() {
          return request.cookies.getAll()
        },
        // Write the rotated/session cookies directly onto the redirect response.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
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

  return response
}
