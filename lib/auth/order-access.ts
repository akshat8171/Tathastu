import 'server-only'

import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * Guest order-access grants.
 *
 * The order-confirmation page (`/order-confirmation/[orderNumber]`) shows an
 * order's financial details. Order numbers are timestamp-based and weakly
 * random, so gating that page by order number alone would let anyone enumerate
 * orders. Logged-in owners are checked against their session; GUESTS instead
 * carry a signed, httpOnly cookie that lists the order numbers they legitimately
 * reached — set only at two trustworthy points:
 *   1. right after they created the order (POST /api/orders), and
 *   2. after a successful email-gated lookup (POST /api/orders/lookup).
 *
 * The cookie value is HMAC-signed so it can't be forged client-side. It is
 * httpOnly because — unlike the Supabase session — no browser code needs to
 * read it.
 */

const COOKIE = 'tk_order_access'
const MAX_ORDERS = 15
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function secret(): string {
  return (
    process.env.ORDER_ACCESS_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    'insecure-dev-only-secret'
  )
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

function encode(orderNumbers: string[]): string {
  const payload = Buffer.from(JSON.stringify(orderNumbers)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decode(value: string | undefined): string[] {
  if (!value) return []
  const [payload, mac] = value.split('.')
  if (!payload || !mac) return []

  // Constant-time signature check to reject forged/tampered cookies.
  const expected = sign(payload)
  const provided = Buffer.from(mac)
  const valid = Buffer.from(expected)
  if (provided.length !== valid.length || !crypto.timingSafeEqual(provided, valid)) {
    return []
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Grant the current visitor access to view `orderNumber`'s confirmation page. */
export async function grantOrderAccess(orderNumber: string): Promise<void> {
  const store = await cookies()
  const current = decode(store.get(COOKIE)?.value)
  const next = [orderNumber, ...current.filter(o => o !== orderNumber)].slice(0, MAX_ORDERS)
  store.set(COOKIE, encode(next), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/** True when the visitor's signed grant cookie includes `orderNumber`. */
export async function hasOrderAccess(orderNumber: string): Promise<boolean> {
  const store = await cookies()
  return decode(store.get(COOKIE)?.value).includes(orderNumber)
}
