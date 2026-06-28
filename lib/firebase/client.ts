'use client'

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

/**
 * Firebase Web SDK (browser) initialization.
 *
 * Used ONLY for the phone-OTP sign-in flow:
 *   RecaptchaVerifier (invisible) → signInWithPhoneNumber → confirm(code) →
 *   user.getIdToken() → POST /api/auth/firebase-session.
 *
 * SECURITY NOTE
 * -------------
 * All six of these NEXT_PUBLIC_ values are *identifiers*, not secrets — Firebase
 * is explicitly designed to ship them in client code. Access is gated by
 * Firebase Auth + the Authorized Domains list + reCAPTCHA, not by hiding the
 * apiKey. The real secret (the service-account private key) lives only in
 * lib/firebase/admin.ts, which is `server-only`.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** True only when the required public config is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
)

/**
 * Lazily get-or-create the Firebase app.
 *
 * Initialization is deferred (not run at module top-level) because this client
 * component module is also evaluated on the server during static prerender of
 * pages like /login. Calling getAuth() at import time there throws
 * `auth/invalid-api-key` (no public env at prerender). Keeping init lazy means
 * Firebase only ever boots inside a browser event handler.
 */
function getFirebaseApp(): FirebaseApp {
  // getApps() guard prevents "Firebase App named '[DEFAULT]' already exists"
  // during Fast Refresh / repeated imports in dev.
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

/**
 * Browser Auth instance for the phone-OTP flow. Call this ONLY from client-side
 * event handlers (never at module scope / during render), so it never runs on
 * the server during prerender.
 */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}
