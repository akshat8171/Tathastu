/**
 * Auth cookie names — shared, dependency-free constants.
 *
 * WHY THIS FILE IS TINY AND HAS NO IMPORTS
 * ----------------------------------------
 * The Firebase session cookie name is needed in three very different runtimes:
 *   - Edge middleware (must NOT import firebase-admin — it's Node-only and
 *     `server-only`-guarded; importing it would break the Edge bundle).
 *   - Node API routes (/api/auth/firebase-session).
 *   - Server Components (lib/auth/session.ts).
 *
 * Keeping the name here, with zero imports, lets every runtime reference the
 * same literal without dragging in heavy or runtime-restricted dependencies.
 */

/**
 * httpOnly session cookie set after a Firebase ID token is verified
 * server-side (createSessionCookie). Holds a Firebase session cookie JWT.
 */
export const FIREBASE_SESSION_COOKIE = '__tathastu_fb_session'

/**
 * How long a Firebase session cookie stays valid. Firebase allows 5 min – 14
 * days; we use 14 days to match a typical "stay logged in" expectation.
 */
export const FIREBASE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14 // 14 days
