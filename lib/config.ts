/**
 * Server-side app configuration.
 *
 * APP_URL is intentionally not prefixed with NEXT_PUBLIC_. Next.js inlines
 * NEXT_PUBLIC_ values into the browser bundle; this origin is read only on the
 * server. Client callers should use window.location.origin (see Config.appUrl).
 */

const LOCAL_APP_URL = 'http://localhost:3000'

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function readServerAppUrl(): string {
  const fromEnv = process.env.APP_URL?.trim()
  if (fromEnv) return stripTrailingSlash(fromEnv)
  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) return `https://${stripTrailingSlash(vercelHost)}`
  return LOCAL_APP_URL
}

/**
 * Isomorphic app configuration.
 * Browser: current origin. Server: APP_URL, then VERCEL_URL, then localhost.
 */
export const Config = {
  get appUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return readServerAppUrl()
  },
}
