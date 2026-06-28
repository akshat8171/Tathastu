import 'server-only'

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

/**
 * Firebase Admin SDK (server-only).
 *
 * Used to:
 *   - verify the ID token the browser sends after phone-OTP sign-in
 *     (verifyIdToken),
 *   - mint a long-lived httpOnly session cookie (createSessionCookie), and
 *   - validate that cookie on every protected request (verifySessionCookie).
 *
 * SECURITY
 * --------
 *  - `import 'server-only'` makes any accidental client import a build error.
 *  - FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL are SECRETS. They must NEVER
 *    get a NEXT_PUBLIC_ prefix and must never be committed.
 *  - The private key is stored with literal "\n" sequences in env (a PEM block
 *    can't contain real newlines in a .env value); we convert them back here.
 *
 * RUNTIME: this module pulls in the Node-only firebase-admin package, so any
 * route/middleware importing it MUST run on the Node.js runtime
 * (`export const runtime = 'nodejs'`), never Edge.
 */

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

/** True when server-side admin credentials are fully configured. */
export const isFirebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey)

let adminApp: App | null = null

/**
 * Lazily initialize the Admin app. Returns null when credentials are missing
 * (e.g. local dev before the service account is wired up) so callers can
 * degrade gracefully instead of throwing at import time.
 */
function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured) return null
  if (getApps().length) return getApp()
  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
  return adminApp
}

/**
 * Admin Auth instance, or null if not configured. Callers should null-check and
 * return a clear 503/redirect rather than crashing.
 */
export function getAdminAuth(): Auth | null {
  const app = getAdminApp()
  return app ? getAuth(app) : null
}
