import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-side sign-out (defense-in-depth).
 *
 * The Supabase session cookies are no longer httpOnly, so the client-side
 * `supabase.auth.signOut()` in the logout button is sufficient on its own. This
 * server route stays as a belt-and-suspenders guarantee: it clears the cookies
 * from the server via `Set-Cookie`, so sign-out still works even if client JS
 * is blocked or the browser client fails to run.
 *
 * We build the response first and let `signOut()` write the cookie-deletion
 * headers straight onto it via the `setAll` adapter, guaranteeing the browser
 * receives the expirations.
 *
 * Scope is `local`: this signs out ONLY the current browser. We don't revoke the
 * user's sessions on their other devices (that would be `global`).
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      // Attributes match every other Supabase cookie writer so the deletions
      // target the same cookies. Not httpOnly (see lib/supabase/server.ts).
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
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.signOut({ scope: 'local' })

  return response
}
