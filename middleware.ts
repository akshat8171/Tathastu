import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { FIREBASE_SESSION_COOKIE } from '@/lib/auth/cookies'

// Routes that require an authenticated user. A logged-out visitor is
// redirected to /login?next=<path> so they return here after signing in.
const PROTECTED_PREFIXES = ['/account']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT with Supabase's auth server (not just the
  // cookie) AND triggers refresh-token rotation when the access token is
  // about to expire — writing the rotated tokens back via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Firebase session: presence-only check on the Edge — the real cryptographic
  // verification happens in Server Components via getCurrentUser() (which calls
  // firebase-admin, a Node-only module). Do NOT import firebase-admin here.
  const hasFirebaseSession = Boolean(request.cookies.get(FIREBASE_SESSION_COOKIE)?.value)

  // The visitor is authenticated if EITHER session is present.
  const isAuthenticated = Boolean(user) || hasFirebaseSession

  const { pathname } = request.nextUrl

  // Gate protected routes
  const isProtected = PROTECTED_PREFIXES.some(
    p => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // A signed-in user has no reason to see /login — send them to their account
  if (pathname === '/login' && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
