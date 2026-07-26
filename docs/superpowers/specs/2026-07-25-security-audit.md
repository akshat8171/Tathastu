# Security Audit — Tathastu Keepsakes (Go-Live Gate)

- **Date:** 2026-07-25
- **Scope:** Next.js 16 App Router, TypeScript, Supabase, Razorpay, Vercel
- **Mode:** READ-ONLY audit. No code modified.
- **Auditor:** Security Engineer agent
- **Verdict:** **NOT READY FOR GO-LIVE.** 2 CRITICAL + 1 HIGH payment/authz blockers.

---

## Go-Live Blockers (must fix before launch)

| # | Severity | Title | Location |
|---|----------|-------|----------|
| 1 | CRITICAL | Admin APIs have zero server-side auth (service-role, RLS-bypassing) | `app/api/admin/*` + `middleware.ts:80` |
| 2 | HIGH→CRITICAL | Order marked `paid` on presence of an unverified client-supplied payment id (payment bypass) | `app/api/orders/route.ts:92` |
| 3 | HIGH | PostgREST `.or()` filter injection via unsanitized `search` param | `app/api/admin/orders/route.ts:24`, `customers/route.ts:20-22` |

---

## CRITICAL-1 — Admin APIs completely unauthenticated; client-side-only "auth"

**Files:**
- `app/admin/page.tsx:35-36` — the ONLY admin gate is client-side: `localStorage.getItem('admin_phone') === '+919154892790'`.
- `app/admin/login/page.tsx:13,30-32` — "login" just compares the typed phone to a hardcoded constant and writes `localStorage.admin_phone`. No OTP, no password, no server call.
- `middleware.ts:80` — matcher is `['/account/:path*', '/login']`. It does **NOT** cover `/admin` or `/api/admin`, so no Edge guard runs there.
- `app/api/admin/stats/route.ts:6` (GET), `app/api/admin/orders/route.ts:6` (GET) `:44` (PATCH), `app/api/admin/customers/route.ts:6` (GET), `app/api/admin/orders/[id]/route.ts:7` (GET) — none call `getCurrentUser()` / `requireAuth()` / any role check. Confirmed via grep: **no auth primitive appears anywhere under `app/api/admin/`.**
- All of the above use `supabaseAdmin` (`lib/supabase/admin.ts`), the **service-role** client that **bypasses RLS entirely**.

**Risk:** Any unauthenticated internet user can call the admin APIs directly and:
- `GET /api/admin/customers` → **entire customer database**: every name, email, phone, total spend, order counts (full PII exfiltration).
- `GET /api/admin/orders` and `/api/admin/orders/[id]` → all orders incl. `notes` field containing **full shipping addresses** (`app/api/orders/route.ts:83`).
- `GET /api/admin/stats` → total revenue, AOV, order volumes.
- `PATCH /api/admin/orders` → **mutate any order's status/tracking** (mark unpaid orders shipped/delivered/cancelled).

The client-side check is trivially bypassed (set `localStorage.admin_phone` in devtools, or just call the API with `curl` — the UI is irrelevant). The admin phone is a public constant compiled into the client bundle.

**Fix (blocker):**
1. Implement a **server-side admin authorization** primitive. Recommended: a Firebase custom claim (`admin: true`) set out-of-band on the owner's UID, verified server-side via `getAdminAuth().verifySessionCookie(cookie, true)` → check `decoded.admin === true`. An env-based UID/phone allowlist checked server-side is an acceptable interim.
2. Add a guard (e.g. `requireAdmin()`) at the **top of every** `app/api/admin/*` handler (GET **and** PATCH), returning 401/403 before any `supabaseAdmin` call.
3. Add `/admin` to the SSR gate and/or gate `app/admin/layout.tsx` server-side (redirect non-admins). Do **not** rely on `localStorage`.
4. Remove the hardcoded admin phone from client code.

---

## CRITICAL-2 (ranked HIGH, treat as blocker) — Fake "paid" orders: no server-side signature verification on the order path

**Files:**
- `app/api/orders/route.ts:92` — marks the order `paid` and writes a `payment_logs` row **whenever `payment?.razorpay_payment_id` is merely present** in the request body. It never recomputes/validates the Razorpay HMAC signature.
- `app/api/payment/verify/route.ts` — a correct HMAC verifier **exists** but is a standalone advisory endpoint the client may call; it is **not invoked** by, and its result is **not enforced** in, the order-creation path.

**Risk:** An attacker calls `POST /api/orders` directly with a fabricated `payment: { razorpay_payment_id: "pay_fake", razorpay_order_id: "order_fake", razorpay_signature: "x" }`. The server creates the order, marks it **`paid`**, and logs a payment — **with no money collected**. If fulfillment keys off `status='paid'`, this yields free goods. The webhook (`payment.captured`) reconciles *legitimate* payments but never *un-pays* a forged one.

**Fix (blocker):** On the synchronous order path, when `payment_method === 'razorpay'`, recompute the signature server-side (`HMAC-SHA256(razorpay_order_id|razorpay_payment_id, RAZORPAY_KEY_SECRET)`) and reject the order (or keep it `pending`) unless it matches — i.e. call the same logic as `payment/verify` inline before `updateOrderPaymentStatus(...,'paid',...)`. Alternatively, make the **webhook the sole authority** for `paid` and never mark paid from the client-driven route. Also verify the paid `amount` equals the server-recomputed `total`.

---

## HIGH-3 — PostgREST `.or()` filter injection (unsanitized search)

**Files:**
- `app/api/admin/orders/route.ts:24` — `` query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`) ``
- `app/api/admin/customers/route.ts:20-22` — `` .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`) ``

**Risk:** The raw `search` query param is string-interpolated into a PostgREST `.or()` filter. Commas, parentheses, and operator tokens in `search` are interpreted as filter syntax, letting an attacker alter the predicate (inject extra `or`/`and` conditions or reference other columns) — a data-disclosure/filter-tampering vector. Compounded by CRITICAL-1 (these endpoints are currently unauthenticated).

**Fix:** Sanitize/escape `search` (strip or reject `,()*:` and PostgREST operator tokens), or avoid `.or()` string building — use parameterized `.ilike()` calls or an RPC with bound parameters. Cap length. Fix regardless of the auth fix.

---

## MEDIUM findings

### MEDIUM-4 — No Content-Security-Policy
`next.config.js:28-50` sets a solid header set (HSTS w/ preload, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP) but **no `Content-Security-Policy`**. The app injects the third-party Razorpay checkout script (`lib/razorpay.ts:85`) and loads Supabase — a CSP is the primary XSS mitigation. Add a CSP (e.g. `script-src 'self' https://checkout.razorpay.com; frame-src https://*.razorpay.com; connect-src 'self' https://*.supabase.co https://*.razorpay.com; img-src 'self' https: data:; object-src 'none'; base-uri 'self'`), tuned to Next.js inline requirements (nonce/hash). Minor: `X-XSS-Protection` (`next.config.js:44`) is deprecated and best dropped in favor of CSP.

### MEDIUM-5 — No rate limiting on public write / cost-bearing endpoints
`lib/rate-limit.ts` is well-built but used **only** by `app/api/auth/send-otp/route.ts:47`. Unthrottled, unauthenticated, service-role-backed writes:
- `POST /api/payment/create-order` — spammable → unbounded Razorpay order creation.
- `POST /api/orders` — floodable → junk orders (worsened by CRITICAL-2).
- `POST /api/contact`, `POST /api/newsletter`, `POST /api/custom-quote` — spam/abuse; `custom-quote` also accepts 25 MB file uploads (`app/api/custom-quote/route.ts:9`) → storage-cost abuse.
Apply the existing IP-based limiter to these routes.

### MEDIUM-6 — PII exposure surface & privacy compliance (DPDP / GDPR)
`/api/admin/customers` returns full name/email/phone/spend for every customer; `/api/admin/orders*` returns full addresses. Under CRITICAL-1 this is an open data-breach endpoint (reportable under India DPDP Act 2023 & GDPR). After the auth fix: apply least-privilege (return only needed fields), add access/audit logging on admin reads, and document a retention policy.

---

## LOW findings

### LOW-7 — Internal error messages leaked to clients
`app/api/payment/create-order/route.ts:44` returns `error.message` from the Razorpay SDK; `app/api/payment/verify/route.ts:34` returns raw `error.message`. Return a generic message; log detail server-side only.

### LOW-8 — Analytics/consent readiness
No analytics scripts (GA/Meta pixel) or cookie-consent banner are currently wired, yet `app/privacy/page.tsx:71,164` states analytics are used and promo consent is honored. Current risk is low (nothing tracking). **Before** adding any analytics/marketing pixels, implement a consent mechanism (DPDP/GDPR) and align the privacy policy.

---

## Positive controls (verified working — do not regress)

- **Secrets:** `.env`, `.env.local` are gitignored (`.gitignore` `.env*` + `!.env.example`) and **never** committed (confirmed via `git log --all`). No hardcoded live keys in tracked source — only `process.env` refs, `.env.example` placeholders, and test fixtures. The public WhatsApp number is intentionally public.
- **Service-role key:** `lib/supabase/admin.ts:1` uses `import 'server-only'`; env var has no `NEXT_PUBLIC_` prefix → cannot reach the browser bundle.
- **Razorpay webhook:** `app/api/payment/webhook/route.ts:19-26` verifies HMAC signature against `RAZORPAY_WEBHOOK_SECRET`; `:34-37` is idempotent (`hasPaymentBeenLogged`). Correct.
- **Money integrity:** `app/api/orders/route.ts:21` re-prices server-side (client prices ignored); coupons re-validated server-side with first-order gating (`:47-58`).
- **Order lookup anti-enumeration:** `app/api/orders/lookup/route.ts` requires order number **AND** email.
- **Account APIs:** `app/api/account/*` all call `getCurrentUser()` and scope by `user.id` (no IDOR); addresses/wishlist RLS-backed by `auth.uid()`.
- **Sessions:** Supabase SSR cookies set `secure` (prod) + `sameSite=lax` (`lib/supabase/server.ts`), matched across the browser client, middleware, callback, and signout route. They are intentionally **not** `httpOnly` — `@supabase/ssr`'s browser client must read the session via `document.cookie`, so httpOnly silently breaks OAuth session detection and password reset; token safety relies on short-lived JWTs + refresh rotation. Sign-out clears cookies both client-side and via the server route `app/auth/signout/route.ts`. Firebase session cookie verified with `verifySessionCookie(cookie, true)` (revocation-checked) and is httpOnly (no browser code reads it).
- **Mock payment:** `lib/razorpay.ts:32-34` gated on `NODE_ENV !== 'production'` → hard-disabled in every Vercel build.
- **Input validation:** Zod schemas on `/api/orders`, `/api/payment/create-order`, `/api/coupons/validate`, `/api/orders/lookup`, `/api/contact`; manual validation on account routes and `custom-quote` (extension AND MIME allowlist, 25 MB cap).

---

## Recommended fix order for go-live

1. **CRITICAL-1** — server-side admin authz on every `app/api/admin/*` handler. (blocker)
2. **CRITICAL-2** — verify Razorpay signature server-side before marking `paid` (or make webhook the sole `paid` authority). (blocker)
3. **HIGH-3** — sanitize/parameterize `.or()` search filters. (blocker)
4. **MEDIUM-5** — rate-limit public write endpoints.
5. **MEDIUM-4** — add CSP.
6. **MEDIUM-6 / LOW-7 / LOW-8** — PII least-privilege + audit logging, generic error messages, consent-before-analytics.
