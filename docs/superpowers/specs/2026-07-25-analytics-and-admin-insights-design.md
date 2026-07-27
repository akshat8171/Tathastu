# Analytics + Admin Insights — Technical Design & Implementation Blueprint

**Date:** 2026-07-25 · **Target:** `Tathastu` · Next.js 16.2.9 / React 19 App Router / Vercel `sin1`
**Scope:** (A) Vercel Web Analytics + Speed Insights wiring · (B) commerce-funnel custom events via `track()` · (C) DB-derived admin customer-behaviour analytics.
**Author:** code-architect agent (read-only design). Persisted by orchestrator.

---

## 0. Verified Next.js 16 facts (locked)

Confirmed against Vercel docs (fetched 2026-07-25):

- **Analytics component:** `import { Analytics } from '@vercel/analytics/next'` — render inside `<body>` of `app/layout.tsx`. (`@vercel/analytics/react` is the CRA/generic-React fallback only.)
- **Speed Insights component:** `import { SpeedInsights } from '@vercel/speed-insights/next'` — also inside `<body>`.
- **Client custom events:** `import { track } from '@vercel/analytics'` — must run in a Client Component (`'use client'`) event handler / effect.
- **Server custom events (alternative for `purchase`):** `import { track } from '@vercel/analytics/server'` — `await track(...)` inside route handlers / server actions.
- **Custom-data limits (hard):** values may be **string | number | boolean | null** only; **no nested objects**; **≤255 chars** per event name/key/value. `track()` **no-ops in dev / off-Vercel**, so it's safe to leave calls in.
- Both components render fine from the **server** root layout (they're client components internally); `app/layout.tsx` stays a server component — do NOT add `'use client'` to it.

---

## 1. Patterns & conventions found

- **Root layout** `app/layout.tsx` — server component; `<body>` wraps `CartProvider → WishlistProvider → CheckoutProvider → {children}`. Only shared file both features touch.
- **Cart add path** `components/cart/add-to-cart-button.tsx` — `handleAddToCart()` calls `addItem(...)` then a 1.2s success state. Single choke point for `add_to_cart`.
- **Checkout** `components/checkout/checkout-form.tsx` — client; totals computed (`subtotal/shipping/discount/total`, `couponCode`); order success in `handlePaymentSuccess` (`clearCart()`→`router.push`) and `handleCodSubmit`. Both are pre-redirect choke points for `purchase`; `begin_checkout` fires on form mount.
- **Product detail** `app/products/[id]/page.tsx` — **server** component; has `product.id/name/category/price`. `view_product` needs a small client tracker mounted here.
- **Admin API pattern** `app/api/admin/stats/route.ts`, `.../customers/route.ts`, `.../orders/route.ts` — all `export const dynamic = 'force-dynamic'`, `supabaseAdmin` (service-role, RLS-bypass), in-memory aggregation, `NextResponse.json`, `console.error` + 500 on failure.
- **Admin UI pattern** `app/admin/page.tsx` / `customers/page.tsx` — `'use client'`, `useEffect` fetch, `Intl.NumberFormat('en-IN', {currency:'INR'})`, cards `bg-white p-6 rounded-card2 shadow-card`, `lucide-react` icons. Nav in `app/admin/layout.tsx` (`navItems`).
- **Order persistence** `lib/supabase/orders.ts` `createOrder()` — address currently stored as **free-text** in `notes`. Structured state/city/pincode do **not** exist as columns → geography needs a migration.
- **DB schema** `supabase/schema.sql` — `orders(customer_id, total, status, created_at, ...)`, `order_items(...)`, `customers(id, name, email, phone, created_at)`. Next migration is **`migration-008`**.
- **"Never block a sale"** philosophy pervades. Analytics must inherit this: every `track()` wrapped so it can never throw into commerce.
- **Existing `lib/tracking.ts`** is **courier/shipment** tracking — unrelated. New helper named `lib/analytics.ts` to avoid confusion.
- **Privacy** `app/privacy/page.tsx` — no cookie-consent banner exists. No GA/GTM present.

---

## 2. Architecture decision (committed)

1. **Standard components in the server root layout.** Add `<Analytics />` + `<SpeedInsights />` to `app/layout.tsx` `<body>`. Traffic + Web Vitals land in the **Vercel dashboard**.
2. **All four funnel events fire client-side via one typed helper `lib/analytics.ts`.** `purchase` fires from the **checkout success handlers** (where both Razorpay and COD converge, pre-`clearCart`).
3. **Admin behaviour analytics come from our own DB, not Vercel.** Vercel Web Analytics has **no in-app read API** on standard plans. In-app admin "customer behaviour" tab built from **Supabase orders/order_items/customers**.
4. **New dedicated endpoint + page**, not an overload of `stats`: `GET /api/admin/analytics` + `/admin/analytics`, plus link cards on the existing dashboard.
5. **Geography via a real column, not notes-parsing.** Add `migration-008` (`shipping_state/city/pincode`), populate in `createOrder`, backfill existing rows by parsing `notes`.

---

## 3. Component design

### 3.1 `lib/analytics.ts` (NEW — client-safe events helper)
- Single typed boundary over Vercel `track()`; enforce scalar-only + ≤255-char + no-`undefined` + **no-PII-by-construction** (only whitelisted keys emitted); never throw.
- Deps: `@vercel/analytics` (`track`). No `'use client'`, no `'server-only'`. Must NOT import `supabaseAdmin`/`lib/supabase/*`.

```ts
import { track } from '@vercel/analytics'

type Scalar = string | number | boolean | null
const clip = (s: string) => (s.length > 255 ? s.slice(0, 255) : s)

function emit(name: string, props: Record<string, Scalar | undefined>) {
  try {
    const clean: Record<string, Scalar> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined) continue
      clean[k] = typeof v === 'string' ? clip(v) : v
    }
    track(name, clean)          // no-ops in dev / off-Vercel
  } catch { /* analytics must never break commerce */ }
}

export const trackViewProduct   = (p:{ productId:string; productName:string; category:string; price:number }) =>
  emit('view_product', { product_id:p.productId, product_name:p.productName, category:p.category, price:p.price })

export const trackAddToCart     = (p:{ productId:string; productName:string; price:number; quantity:number; variant?:string }) =>
  emit('add_to_cart', { product_id:p.productId, product_name:p.productName, price:p.price, quantity:p.quantity, variant:p.variant ?? 'Default' })

export const trackBeginCheckout = (p:{ value:number; itemCount:number; coupon?:string|null }) =>
  emit('begin_checkout', { value:p.value, item_count:p.itemCount, coupon:p.coupon ?? null })

export const trackPurchase      = (p:{ orderNumber:string; value:number; itemCount:number; paymentMethod:string; coupon?:string|null; discount:number }) =>
  emit('purchase', { order_number:p.orderNumber, value:p.value, item_count:p.itemCount, payment_method:p.paymentMethod, coupon:p.coupon ?? null, discount:p.discount })
```
**PII rule:** `purchase` deliberately excludes name/email/phone/address. `order_number` is an opaque order id.

### 3.2 `components/analytics/product-view-tracker.tsx` (NEW — client)
- `'use client'`; props `{ productId, productName, category, price }`; `useEffect(() => trackViewProduct(props), [productId])`; renders `null`.

### 3.3 `app/api/admin/analytics/route.ts` (NEW — server)
- `dynamic='force-dynamic'`, `supabaseAdmin`, mirrors `stats/route.ts` error handling. Optional `?days=30` (default 30).
- **Response shape:** `range`, `funnel` (order status tallies + paid_conversion_rate), `newVsRepeat`, `ltv` (avg/median + top 10), `geography` (by shipping_state, 'Unknown' bucket), `timeseries`.
- Range-filtered Supabase queries (`.gte('created_at', ...)`); compute in-memory.
- **MUST be behind server-side admin auth** (see Security section) — do NOT ship customer LTV on an unauthenticated endpoint.

### 3.4 `app/admin/analytics/page.tsx` (NEW — client)
- `'use client'`, `useEffect` fetch `/api/admin/analytics?days=…`, range selector (7/30/90/all), reuse card/table/`Intl` conventions.
- Blocks: (1) Order funnel bar + paid-conversion %; (2) New vs repeat; (3) LTV avg/median + top-customers table; (4) Geography table. Callout: traffic/device/view→cart→checkout funnel counts live in the **Vercel dashboard**; this page shows order-based behaviour from our DB.
- CSS bars, no new chart lib.

---

## 4. Implementation map (exact files + changes)

**CREATE**
1. `lib/analytics.ts` — §3.1.
2. `components/analytics/product-view-tracker.tsx` — §3.2.
3. `app/api/admin/analytics/route.ts` — §3.3.
4. `app/admin/analytics/page.tsx` — §3.4.
5. `supabase/migration-008-order-geography.sql`:
   ```sql
   ALTER TABLE orders
     ADD COLUMN IF NOT EXISTS shipping_state   VARCHAR(100),
     ADD COLUMN IF NOT EXISTS shipping_city    VARCHAR(100),
     ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10);
   CREATE INDEX IF NOT EXISTS idx_orders_shipping_state ON orders(shipping_state);
   -- Backfill from legacy notes ("Address: <addr>, <city>, <state> - <pincode>")
   UPDATE orders SET
     shipping_pincode = COALESCE(shipping_pincode, substring(notes from '-\s*(\d{6})')),
     shipping_state   = COALESCE(shipping_state, trim(substring(notes from ',\s*([^,]+?)\s*-\s*\d{6}')))
   WHERE notes IS NOT NULL AND shipping_state IS NULL;
   ```

**MODIFY**
6. `app/layout.tsx` — **SHARED FILE, serialize.** Add imports; render `<Analytics />` + `<SpeedInsights />` as last children inside `<body>` (after `</CartProvider>`). Optional PII guard: `<Analytics beforeSend={(e)=> ({ ...e, url: e.url.split('?')[0] })} />`.
7. `components/cart/add-to-cart-button.tsx` — call `trackAddToCart(...)` inside `handleAddToCart` after `addItem(...)`, before `setAdded(true)`.
8. `app/products/[id]/page.tsx` — render `<ProductViewTracker .../>` inside `<main>`.
9. `components/checkout/checkout-form.tsx` — `begin_checkout` on mount (`useEffect`, guarded `items.length>0`); `purchase` in both `handlePaymentSuccess` (razorpay) and `handleCodSubmit` (cod), before `clearCart()`.
10. `app/admin/layout.tsx` — **SHARED FILE, serialize.** Add `{ href:'/admin/analytics', icon: BarChart3, label:'Analytics' }` to `navItems`; import `BarChart3`.
11. `app/admin/page.tsx` — add a "Customer Insights" card/link to `/admin/analytics`.
12. `lib/supabase/orders.ts` — `createOrder`: extend input with `shipping_state?/shipping_city?/shipping_pincode?`; add to `.insert({...})`.
13. `app/api/orders/route.ts` — pass structured address into `createOrder` (`customer.state/city/pincode`).
14. `app/privacy/page.tsx` — analytics disclosure paragraph + bump `LAST_UPDATED`.

---

## 5. Data flow

**Vercel-owned (dashboard only):** page views, referrers, geography, devices, Web Vitals, and the **counts** of `view_product`/`add_to_cart`/`begin_checkout`/`purchase`.

**Custom-event flow (client):** user action → client handler → `lib/analytics.ts emit()` (sanitize, clip 255, drop `undefined`, try/catch) → Vercel `track()` → dashboard Events panel. Prod-on-Vercel only.

**Admin analytics flow (our DB):** `/admin/analytics` → `GET /api/admin/analytics?days=N` → `supabaseAdmin` reads range-filtered `orders`(+`shipping_state`)/`customers` → in-memory funnel/new-vs-repeat/LTV/geography → JSON → cards/tables.

---

## 6. Privacy / consent (DPDP + GDPR)

- **Both tools are cookieless** — Vercel Web Analytics + Speed Insights set **no cookies**, daily-rotated hash. Under GDPR/ePrivacy generally needs **no prior-consent banner**. Under India DPDP 2023 the design keeps events PII-free, so no consent gate required for these two tools.
- **Required:** update `app/privacy/page.tsx` — disclose Vercel Web Analytics + Speed Insights, cookieless / no cross-site tracking, processing by Vercel Inc. (US), bump `LAST_UPDATED`.
- **Enforced by construction:** `lib/analytics.ts` whitelists keys → no PII ever leaves the browser.
- **Future trigger:** any cookie-based tool (GA, Meta Pixel) or PII-bearing event → consent banner + gating becomes mandatory.

---

## 7. Build sequence

- **Phase 0 — Deps:** `@vercel/analytics` + `@vercel/speed-insights` (DONE — in package.json).
- **Phase 1 — Layout wiring** (SHARED `app/layout.tsx`, serialize).
- **Phase 2 — Events helper** `lib/analytics.ts` (gates Phase 3).
- **Phase 3 — Wire funnel events** (parallel across files): add-to-cart · product-view-tracker + products/[id] · checkout-form (one file, do together).
- **Phase 4 — Admin analytics backend:** migration-008 → createOrder + /api/orders passthrough ‖ /api/admin/analytics route (behind admin auth).
- **Phase 5 — Admin analytics frontend:** admin/analytics/page ‖ admin/layout nav (SHARED, serialize) ‖ admin/page insight cards.
- **Phase 6 — Privacy:** privacy page disclosure + LAST_UPDATED.

**Parallelism:** shared files = `app/layout.tsx` (P1) and `app/admin/layout.tsx` (P5) — serialize edits within each. `lib/analytics.ts` gates all P3 work.

---

## 8. Critical details

- **Never break commerce:** every event path is `try/catch`; `track()` no-ops off-Vercel.
- **`purchase` accuracy:** fires in the success handler pre-`clearCart` = once per successful order (both rails). Hardening path (not v1): move to `@vercel/analytics/server` inside `/api/orders`.
- **SECURITY (blocker):** `/api/admin/*` routes have **no server-side auth** — gating is client-only `localStorage.admin_phone`. The new `/api/admin/analytics` route **must** be protected by a shared `requireAdmin()` guard (server-verified) or it leaks customer LTV/geography to anyone. Apply the guard to all admin routes.
- **Performance:** analytics route uses range-filtered queries from day one; revisit with a SQL VIEW/RPC if `orders` exceeds ~50k. `sin1` keeps Speed Insights RUM representative of India users.
- **Testing:** unit-test `lib/analytics.ts` sanitization (undefined-drop, 255-clip, scalar-only, no-throw) with `@vercel/analytics` mocked. Test `/api/admin/analytics` aggregation with a stubbed `supabaseAdmin`.
