import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client backed by the SERVICE-ROLE key.
 *
 * WHY THIS EXISTS
 * ---------------
 * migration-002-rls-policies.sql enables RLS on orders / order_items /
 * payment_logs and intentionally grants the browser anon role only INSERT
 * (guest checkout). It grants NO UPDATE and NO SELECT to anon, and says, in
 * its own header comment:
 *
 *   "Payment-status updates ... MUST be performed with the Supabase
 *    SERVICE-ROLE key on the server side."
 *
 * Without this client, two things silently break the moment RLS is applied:
 *   1. updateOrderPaymentStatus('paid') no-ops  → orders stay "pending".
 *   2. getOrderByOrderNumber returns null       → /order-confirmation 404s
 *                                                  right after a purchase.
 * The service role bypasses RLS entirely, which is exactly what those
 * server-side order operations need.
 *
 * SECURITY
 * --------
 *  - `import 'server-only'` makes any accidental client-component import a
 *    build error — this key can NEVER reach the browser bundle.
 *  - The env var is SUPABASE_SERVICE_ROLE_KEY (NO NEXT_PUBLIC_ prefix).
 *    A NEXT_PUBLIC_ prefix would inline it into client JS — never do that.
 *  - If the service-role key is not configured, we fall back to the anon
 *    key so local dev / guest INSERT still works; reads/updates that need
 *    RLS-bypass will then behave as anon (documented in E2E_TESTING_GUIDE).
 */

/** True when a real service-role key is configured (not the anon fallback). */
export const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

/**
 * LAZY initialization — the real client is built on first use, NOT at module
 * import. This is load-bearing for the build: `vercel build` (and any
 * `next build` without .env loaded) imports every route module during the
 * "Collecting page data" phase. If we read env + threw at module scope, that
 * import would crash the build for routes that only ever touch the DB at
 * REQUEST time (they're all `force-dynamic`). Deferring construction makes the
 * module import side-effect-free, so the build never needs the secrets — they
 * are only required at runtime, which is correct.
 */
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer the service-role key; fall back to the anon/publishable key so the
  // app still boots in environments where the service key isn't set yet.
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !serviceKey) {
    // Thrown at REQUEST time (inside a route handler), never at build/import.
    // Callers (lib/supabase/orders.ts, coupons.ts, etc.) already wrap DB access
    // in try/catch and degrade gracefully, so this surfaces as a handled error
    // rather than a crashed build.
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)'
    )
  }

  _client = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _client
}

/**
 * Service-role client for server-side order/payment operations.
 * Never import this from a Client Component.
 *
 * Exposed as a Proxy so existing call sites — `supabaseAdmin.from(...)`,
 * `.rpc(...)`, `.storage` — keep working unchanged, while the underlying client
 * is constructed lazily on first property access (see getClient above).
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client as object, prop, receiver)
    // Bind methods to the real client so `this` is correct when invoked.
    return typeof value === 'function' ? value.bind(client) : value
  },
})
