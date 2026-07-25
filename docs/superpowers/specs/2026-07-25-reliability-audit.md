# Reliability & Observability Audit — Tathastu Keepsakes
**Date:** 2026-07-25  
**Scope:** Pre-launch reliability, error handling, payment robustness, observability  
**Region:** Vercel sin1 (Singapore)  
**Stack:** Next.js 16 App Router, Supabase, Razorpay, Upstash Redis

---

## Executive Summary

**Go-live blockers:** 1 HIGH (error monitoring gap)  
**High-priority items:** 4  
**Medium-priority items:** 6  
**Low-priority items:** 3

The application demonstrates solid payment idempotency, server-side pricing validation, and PII redaction discipline. **Critical gap: no runtime error monitoring** (Sentry / similar). Vercel Analytics + Speed Insights (being added per other audits) cover traffic/vitals but NOT errors — you will be blind to production crashes, API failures, and payment bugs. Other findings: missing env var guards, no health check endpoint, incomplete timeout handling on external calls.

---

## HIGH Priority (Go-Live Blockers or Critical Risks)

### 1. ❌ **No Runtime Error Monitoring — BLOCKER**
**Severity:** HIGH (go-live blocker)  
**Risk:** Production errors invisible — payment failures, API crashes, webhook drops go unnoticed until customer escalation.

**Current state:**
- Error boundaries exist (`app/error.tsx`, line 15) but only `console.error` — logs go to Vercel's stdout, no aggregation/alerting.
- User sees "Something went wrong! … our team has been notified" (line 43) — **FALSE CLAIM**, no team notification exists.
- Webhook failures (`app/api/payment/webhook/route.ts:67`) silent except console.log.
- Order creation errors (`app/api/orders/route.ts:127`) log but don't alert.

**Fix:**
1. Add Sentry (or Datadog / Axiom / Honeybadger):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
2. Instrument error boundaries (`app/error.tsx:15`):
   ```ts
   import * as Sentry from '@sentry/nextjs'
   useEffect(() => { Sentry.captureException(error) }, [error])
   ```
3. Instrument API error handlers — wrap top-level try/catch in routes with `Sentry.captureException(err)`.
4. Set `SENTRY_DSN` in Vercel env vars (prod + preview).
5. Update error.tsx copy (line 43) to remove false "team notified" claim unless notification is wired.

**Timeline:** BEFORE go-live — this is your production observability foundation.

**File:** `app/error.tsx:15`, `app/api/payment/webhook/route.ts:67`, `app/api/orders/route.ts:127`

---

### 2. ⚠️ **Missing Env Var Guards — Silent Failures**
**Severity:** HIGH  
**Risk:** Missing env vars cause runtime crashes with unhelpful errors instead of failing loudly at boot.

**Current state:**
- `process.env.RAZORPAY_KEY_SECRET!` (payment/verify:14, payment/webhook:20, payment/create-order:10) — TypeScript `!` suppresses checks; if unset, `crypto.createHmac` throws "key must be a string".
- No startup validation that required vars are present.

**Fix:**
1. Add env validation at app boot (`lib/env.ts`):
   ```ts
   const required = [
     'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
     'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
     'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'
   ]
   required.forEach(k => {
     if (!process.env[k]) throw new Error(`Missing required env var: ${k}`)
   })
   ```
2. Import at the top of `app/layout.tsx` (server-rendered) so it runs on first cold-start.
3. Alternatively, use `t3-env` or `zod` for typed env validation.

**Impact:** Prevents silent misconfiguration — deployment fails fast with a clear error instead of breaking user flows.

**Files:** `app/api/payment/verify/route.ts:14`, `app/api/payment/webhook/route.ts:20`, `app/api/payment/create-order/route.ts:10`

---

### 3. ⚠️ **Webhook Signature Mismatch Returns 500 Instead of 401**
**Severity:** HIGH  
**Risk:** Razorpay retries failed webhooks — returning 500 for invalid signatures triggers unnecessary retries and alert noise.

**Current state:**
`app/api/payment/webhook/route.ts:26` — invalid signature returns 400 (correct), but line 67 catch block returns 500 for ALL errors, including signature mismatches that throw during parsing.

**Fix:**
```ts
// line 67-69
} catch (error) {
  console.error('Webhook error:', error)
  // Distinguish auth failures (4xx) from processing errors (5xx)
  const status = error instanceof SyntaxError ? 400 : 500
  return NextResponse.json({ error: 'Webhook processing failed' }, { status })
}
```

**Rationale:** 4xx = client error (Razorpay should NOT retry), 5xx = server error (retry is correct). Current code treats all as 5xx.

**File:** `app/api/payment/webhook/route.ts:67`

---

### 4. ⚠️ **Double-Charge Risk: Order Creation + Payment Race**
**Severity:** HIGH  
**Risk:** User pays, frontend calls `/api/orders` twice (accidental double-tap, retry, React strict-mode double-render in dev) → two DB orders, one payment.

**Current mitigation (GOOD):**
- Webhook idempotency: `hasPaymentBeenLogged(payment.id)` at line 34 prevents duplicate `payment_logs` rows.
- POST `/api/orders` server-side reprices (line 21-24) so client can't forge totals.
- First-order coupon gating at money path (line 46-58) prevents repeat redemption.

**Remaining gap:**
- No idempotency key on POST `/api/orders` itself — a duplicate call creates two `orders` rows with distinct UUIDs but same payment_id, because the check at line 92 (`payment?.razorpay_payment_id`) is advisory only — the DB allows multiple orders with the same `payment_id`.

**Fix:**
1. Add a `razorpay_order_id` UNIQUE constraint to `orders` table (if Razorpay order ID is set):
   ```sql
   ALTER TABLE orders ADD CONSTRAINT orders_razorpay_order_id_unique 
     UNIQUE NULLS NOT DISTINCT (razorpay_order_id);
   ```
2. OR add a client-side idempotency token (UUID generated once per checkout session, sent in body, checked before insert).

**Impact:** Prevents accidental double-charges.

**File:** `app/api/orders/route.ts:7`, DB schema

---

## MEDIUM Priority (Should Fix Before Go-Live)

### 5. ⚠️ **No Timeout on External API Calls**
**Severity:** MEDIUM  
**Risk:** Razorpay / Supabase hangs → API route times out at Vercel's 10s/60s limit, user sees generic error.

**Current state:**
- Razorpay SDK calls (`razorpay.orders.create`, line 28 in `payment/create-order`) have no explicit timeout.
- Supabase client (`supabaseAdmin.from(...)`) has no timeout override.

**Fix:**
1. Wrap Razorpay calls in a timeout:
   ```ts
   const order = await Promise.race([
     razorpay.orders.create({ ... }),
     new Promise((_, reject) => setTimeout(() => reject(new Error('Razorpay timeout')), 8000))
   ])
   ```
2. Supabase: set `options.timeout` in client creation (`lib/supabase/admin.ts`) or per-query `.abortSignal(AbortSignal.timeout(5000))`.

**Rationale:** 8s timeout on Razorpay gives 2s margin before Vercel's 10s Edge limit; Supabase 5s is generous for DB queries.

**Files:** `app/api/payment/create-order/route.ts:28`, `lib/supabase/admin.ts`

---

### 6. ⚠️ **Payment Webhook Reconciliation Assumes `notes.internal_order_id`**
**Severity:** MEDIUM  
**Risk:** If Razorpay order creation predates the `notes` field being set (old orders, migration), webhook silently no-ops.

**Current state:**
`app/api/payment/webhook/route.ts:42` — tries `payment.notes?.internal_order_id` first, falls back to `getOrderByPaymentOrderId(payment.order_id)` (line 45). Fallback is safe BUT if BOTH fail (e.g., stale Razorpay webhook for a deleted test order), the block at line 51-62 is skipped and the payment is logged as "received" without marking the order paid.

**Fix:**
Add explicit logging when reconciliation fails:
```ts
// after line 49
if (!orderId) {
  console.warn('Webhook: could not reconcile payment to order', {
    razorpay_order_id: payment.order_id,
    razorpay_payment_id: payment.id,
  })
  // Optionally: send to Sentry / alert channel
  return NextResponse.json({ received: true }) // already present, make it explicit
}
```

**Impact:** Visibility into orphaned payments (Razorpay succeeded but our DB has no matching order).

**File:** `app/api/payment/webhook/route.ts:42-49`

---

### 7. ⚠️ **Rate Limiter Falls Back to In-Memory (Non-Distributed)**
**Severity:** MEDIUM  
**Risk:** Without Upstash Redis, OTP rate limits are per-instance — an attacker can bypass by triggering cold-starts or hitting different Edge regions.

**Current state:**
`lib/rate-limit.ts:47-64` — in-memory fallback `memCheck` is process-local. Works locally, NOT effective across Vercel's serverless instances.

**Fix:**
1. Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in Vercel (free tier: 10k commands/day).
2. Add healthcheck logging on boot to confirm Redis is reachable:
   ```ts
   if (hasUpstash) console.log('[rate-limit] Upstash Redis connected')
   else console.warn('[rate-limit] Using in-memory fallback (dev only — NOT secure in prod)')
   ```

**Deployment note:** DEPLOYMENT.md (line 17-78) lists Upstash as "optional" — **upgrade to required for production**.

**File:** `lib/rate-limit.ts:20-46`, `DEPLOYMENT.md:66`

---

### 8. ⚠️ **No Health Check Endpoint**
**Severity:** MEDIUM  
**Risk:** External uptime monitors (UptimeRobot, Pingdom) can't distinguish "server up but DB/Razorpay down" from "server down".

**Current state:** No `/api/health` or similar.

**Fix:**
Create `app/api/health/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    supabase: 'unknown',
    razorpay: 'skipped', // or test API key validity
  }

  try {
    const { error } = await supabaseAdmin.from('orders').select('id').limit(1)
    checks.supabase = error ? 'down' : 'up'
  } catch { checks.supabase = 'down' }

  const allUp = checks.supabase === 'up'
  return NextResponse.json(checks, { status: allUp ? 200 : 503 })
}
```

**Usage:** Point UptimeRobot at `https://tathastu.vercel.app/api/health` (5min interval).

**File:** (new) `app/api/health/route.ts`

---

### 9. ⚠️ **COD Orders Stay Pending Forever**
**Severity:** MEDIUM  
**Risk:** Cash-on-delivery orders are created with `status: 'pending'` (line 184 in `lib/supabase/orders.ts`) and line 90-109 in `app/api/orders/route.ts` only marks Razorpay orders as `paid` — COD orders never transition to `paid` or `processing`.

**Current behavior:**
- COD order placed → `status: 'pending'`, `payment_status: 'pending'`.
- Admin sees it in dashboard but no automated status progression.

**Fix:**
1. COD orders should be created as `status: 'paid'` (payment happens on delivery, but order is "confirmed" immediately).
2. OR add admin workflow to manually mark COD as `processing` after phone confirmation.

**Suggested patch** (`lib/supabase/orders.ts:184`):
```ts
payment_status: orderData.payment_method === 'cod' ? 'pending' : 'pending',
status: orderData.payment_method === 'cod' ? 'paid' : 'pending',
```

**Rationale:** COD is pre-approved — it should enter the fulfillment pipeline immediately, not wait in "pending" with unpaid online orders.

**File:** `lib/supabase/orders.ts:184`, `app/api/orders/route.ts:90`

---

### 10. ⚠️ **Order Status Transitions Lack State Machine Validation**
**Severity:** MEDIUM  
**Risk:** Admin can set `status: 'delivered'` directly from `pending` without going through `processing` → broken tracking timeline.

**Current state:**
`lib/supabase/orders.ts:265` (`updateOrderStatus`) accepts any status string with no validation of allowed transitions.

**Fix:**
Add state machine guard:
```ts
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [], // terminal
  cancelled: [], // terminal
}

export async function updateOrderStatus(orderId, newStatus, ...) {
  const { data: order } = await supabaseAdmin.from('orders').select('status').eq('id', orderId).single()
  const allowed = ALLOWED_TRANSITIONS[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`)
  }
  // ... existing update logic
}
```

**Impact:** Prevents admin UI bugs that skip fulfillment steps.

**File:** `lib/supabase/orders.ts:265`

---

## LOW Priority (Post-Launch Improvements)

### 11. ℹ️ **Tracking Provider Stubs Not Implemented**
**Severity:** LOW  
**Risk:** Mock tracking works fine; real carrier integration deferred per spec.

**Current state:**
`lib/tracking.ts:80-89` — Shiprocket and Delhivery branches are no-ops, log warnings.

**Action:** Implement when TRACKING_PROVIDER env var is set and carrier credentials are available. Not a launch blocker (deterministic mock satisfies P2 spec).

**File:** `lib/tracking.ts:80-89`

---

### 12. ℹ️ **Notification Provider Stubs Not Implemented**
**Severity:** LOW  
**Risk:** Admin order notifications go to console.log only (lib/notify.ts:40-44). PII is correctly redacted (line 43).

**Action:** Wire Resend / SendGrid / Twilio when NOTIFY_PROVIDER + credentials are set. Console fallback is acceptable for soft-launch.

**File:** `lib/notify.ts:34-71`

---

### 13. ℹ️ **Payment Verification Route Unused**
**Severity:** LOW  
**Observation:** `app/api/payment/verify/route.ts` exists but is redundant — signature verification happens in the webhook (route.ts:23-26) and order-creation flow doesn't call `/verify` separately.

**Action:** Either remove or document its intended use case (client-side verification before order creation?). Not a bug, just dead code.

**File:** `app/api/payment/verify/route.ts`

---

## Positive Findings (No Action Needed)

✅ **Payment idempotency:** Webhook checks `hasPaymentBeenLogged()` before processing (line 34).  
✅ **Server-side pricing:** `repriceItems()` ignores client-sent prices (orders/route.ts:21).  
✅ **PII redaction:** `redactEmail` / `redactPhone` applied before logging (lib/redact.ts).  
✅ **Coupon first-order gating:** Authoritative check at money path with correct `customer_id` (lib/coupons.ts:178-192).  
✅ **Error boundaries:** App-level (`app/error.tsx`) and not-found (`app/not-found.tsx`) are user-friendly.  
✅ **Rate limiting architecture:** Dual-key (phone + IP) with distributed backend option (lib/rate-limit.ts).

---

## Environment Variable Completeness Check

Compared `.env.example` (lines 1-68) against DEPLOYMENT.md (lines 17-37):

| Variable | .env.example | DEPLOYMENT.md | Status |
|----------|--------------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | OK |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ | **Missing from DEPLOYMENT.md** |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | ✅ | OK |
| `FIREBASE_*` (6 vars) | ✅ | ❌ | **Missing from DEPLOYMENT.md** |
| `UPSTASH_REDIS_*` | ✅ (optional) | ❌ | Should be listed as required for prod |

**Fix:** Update DEPLOYMENT.md §2 to include `SUPABASE_SERVICE_ROLE_KEY`, Firebase vars, and upgrade Upstash from optional to required.

---

## Logging Audit (PII Exposure Risk)

Checked all `console.log` / `console.error` in API routes:

✅ `lib/notify.ts:43` — calls `redactPII()` before logging.  
✅ `lib/supabase/orders.ts:80` — logs phone but calls `toE164()` (normalizes, doesn't redact) — **MEDIUM RISK**: E.164 phone numbers are PII.

**Fix:** Redact phone in `upsertCustomerByPhone` error logs:
```ts
// line 80
console.error('upsertCustomerByPhone: could not normalise phone', redactPhone(input.phone))
```

**File:** `lib/supabase/orders.ts:80`

---

## Recommendations Summary

| Priority | Item | Blocker? | Est. Effort |
|----------|------|----------|-------------|
| HIGH | Add Sentry or similar error monitoring | YES | 2-4 hours |
| HIGH | Env var validation at boot | YES | 1 hour |
| HIGH | Webhook 500→401 for auth failures | No | 15 min |
| HIGH | Idempotency key on POST /api/orders | No | 1-2 hours |
| MEDIUM | Timeout guards on Razorpay/Supabase | No | 1 hour |
| MEDIUM | Log orphaned webhook payments | No | 15 min |
| MEDIUM | Deploy Upstash Redis (prod requirement) | Soft-blocker | 30 min |
| MEDIUM | Health check endpoint | No | 30 min |
| MEDIUM | COD order status → `paid` on creation | No | 15 min |
| MEDIUM | Order status state machine validation | No | 1 hour |
| LOW | Redact phone in order error logs | No | 10 min |
| LOW | Update DEPLOYMENT.md env var list | No | 10 min |

**Total estimated effort (blockers only):** 3-5 hours  
**Total estimated effort (all HIGH + MEDIUM):** 8-11 hours

---

## Next Steps

1. **BLOCK GO-LIVE** until error monitoring (Sentry) is deployed and tested.
2. Implement HIGH items 2-4 (env validation, webhook status fix, idempotency).
3. Deploy Upstash Redis and confirm `/api/auth/send-otp` rate limiting works cross-region.
4. Add `/api/health` and wire to uptime monitor.
5. Fix COD order status and add state machine validation (can be post-launch but before first production order).
6. Update DEPLOYMENT.md with complete env var list.

**Audit completed:** 2026-07-25  
**Auditor role:** Reliability / Observability Engineer (read-only)  
**Status:** Findings documented, no code modifications made per brief.
