import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      // Cookie attributes are made explicit and MUST match every other Supabase
      // cookie writer (browser client, middleware, callback, signout) so a
      // cookie set by one can be read/rotated/deleted by another.
      //
      // NOTE: these are intentionally NOT httpOnly. @supabase/ssr's browser
      // client reads the session through document.cookie, which cannot see
      // httpOnly cookies — making them httpOnly silently breaks OAuth session
      // detection and the password-reset flow. secure (prod) + sameSite=lax
      // remain as the CSRF/transport protections; token safety relies on the
      // short-lived JWT + refresh rotation (Supabase's standard model).
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
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
            // Called from Server Component — ignore
          }
        },
      },
    }
  )

  // @supabase/ssr@0.10+ may return a Promise — unwrap if so
  if (client instanceof Promise) {
    return await client
  }
  return client
}
