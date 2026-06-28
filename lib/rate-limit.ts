import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * OTP send rate limiter (defense-in-depth against SMS-bombing / DDoS).
 *
 * Two backends:
 *  - PRODUCTION: Upstash Redis (distributed, survives across serverless
 *    invocations and multiple IPs). Enabled when UPSTASH_REDIS_REST_URL +
 *    UPSTASH_REDIS_REST_TOKEN are set.
 *  - FALLBACK: a process-local in-memory limiter. Used in dev or if Upstash
 *    isn't configured. Good enough locally; NOT effective across serverless
 *    instances, so configure Upstash in production.
 *
 * We rate limit on TWO keys per request (whichever trips first blocks):
 *  - the phone number  → stops targeting one victim with repeated SMS
 *  - the client IP     → stops one source spraying many numbers
 */

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

// --- Upstash-backed limiters (created once) ---------------------------------
let phoneLimiter: Ratelimit | null = null
let ipLimiter: Ratelimit | null = null

if (hasUpstash) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  // Max 3 OTP sends per phone per 15 minutes.
  phoneLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    prefix: 'otp:phone',
    analytics: false,
  })
  // Max 10 OTP sends per IP per hour (a single IP shouldn't need more).
  ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 m'),
    prefix: 'otp:ip',
    analytics: false,
  })
}

// --- In-memory fallback ------------------------------------------------------
type Hit = { count: number; resetAt: number }
const memStore = new Map<string, Hit>()

function memCheck(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = memStore.get(key)
  if (!existing || now > existing.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }
  if (existing.count >= limit) {
    return { success: false, remaining: 0 }
  }
  existing.count += 1
  return { success: true, remaining: limit - existing.count }
}

// Opportunistic cleanup so the map can't grow unbounded.
function memSweep() {
  if (memStore.size < 5000) return
  const now = Date.now()
  for (const [k, v] of memStore) if (now > v.resetAt) memStore.delete(k)
}

/**
 * Returns { success: false } if EITHER the phone or IP limit is exceeded.
 */
export async function checkOtpRateLimit(phone: string, ip: string) {
  if (hasUpstash && phoneLimiter && ipLimiter) {
    const [p, i] = await Promise.all([
      phoneLimiter.limit(phone),
      ipLimiter.limit(ip),
    ])
    if (!p.success || !i.success) {
      return { success: false as const, scope: !p.success ? 'phone' : 'ip' }
    }
    return { success: true as const }
  }

  // Fallback: in-memory
  memSweep()
  const p = memCheck(`phone:${phone}`, 3, 15 * 60_000)
  const i = memCheck(`ip:${ip}`, 10, 60 * 60_000)
  if (!p.success || !i.success) {
    return { success: false as const, scope: !p.success ? 'phone' : 'ip' }
  }
  return { success: true as const }
}
