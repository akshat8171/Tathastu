import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase/admin'
import {
  FIREBASE_SESSION_COOKIE,
  FIREBASE_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/cookies'

export const runtime = 'nodejs' // firebase-admin is Node-only

/**
 * POST  /api/auth/firebase-session
 *   Body: { idToken: string }
 *
 * Verifies the Firebase ID token (issued after phone OTP sign-in on the client),
 * mints a long-lived server-side session cookie, and sets it as an httpOnly
 * cookie so subsequent requests can be authenticated without the client having
 * to hold onto the short-lived ID token.
 *
 * DELETE  /api/auth/firebase-session
 *
 * Clears the Firebase session cookie (sign-out for Firebase phone users).
 */

export async function POST(request: NextRequest) {
  try {
    let body: { idToken?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { idToken } = body
    if (!idToken) {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
    }

    const adminAuth = getAdminAuth()
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Auth not configured' },
        { status: 503 }
      )
    }

    // Verify the short-lived ID token (checkRevoked = true).
    try {
      await adminAuth.verifyIdToken(idToken, true)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Mint a long-lived session cookie from the verified ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIREBASE_SESSION_MAX_AGE_SECONDS * 1000, // ms
    })

    // Set the httpOnly session cookie.
    ;(await cookies()).set(FIREBASE_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: FIREBASE_SESSION_MAX_AGE_SECONDS,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[firebase-session POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    // Clear the Firebase session cookie by setting maxAge to 0.
    ;(await cookies()).set(FIREBASE_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[firebase-session DELETE]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
