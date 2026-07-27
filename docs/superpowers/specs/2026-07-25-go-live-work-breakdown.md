# Go-Live Work Breakdown Structure
**Initiative:** Production-ready analytics + admin insights  
**Author:** Engineering Manager Agent  
**Date:** 2026-07-25  
**Status:** Draft for review

---

## Executive Summary

This WBS decomposes the "admins can analyse everything about the customer" go-live initiative into 5 workstreams and 23 atomic tasks. The immediate trigger: **Vercel Analytics** and **Speed Insights** are not installed. Dependencies are explicitly modeled; PARALLEL vs SEQUENTIAL execution constraints are marked to avoid file conflicts.

**Critical path:** WS1.1 (install packages) → WS1.2 (integrate in layout.tsx) → WS2.* (funnel instrumentation) → WS4.* (QA) → WS5.2 (deploy).

**Estimated duration:** 3-5 days (assuming 1-2 devs, security/performance reviews in parallel).

---

## Workstream 1: Analytics & Speed Insights Integration
**Owner:** Frontend Developer  
**Goal:** Install and integrate Vercel observability SDKs.

### WS1.1: Install Vercel packages
**ID:** WS1.1  
**Title:** Install @vercel/analytics and @vercel/speed-insights  
**Parallel:** YES — can run alongside other investigation tasks  
**Dependencies:** None  
**Files:**
- `package.json`
- `package-lock.json`

**Tasks:**
1. Run `npm install @vercel/analytics @vercel/speed-insights --save`
2. Commit lockfile changes

**Acceptance Criteria:**
- Both packages present in `dependencies` section of `package.json`
- Lockfile updated
- CI build passes with new dependencies

---

### WS1.2: Integrate Analytics and SpeedInsights in root layout
**ID:** WS1.2  
**Title:** Add `<Analytics />` and `<SpeedInsights />` to app/layout.tsx  
**Parallel:** NO — BLOCKS all other app/layout.tsx edits  
**Dependencies:** WS1.1  
**Files:**
- `app/layout.tsx`

**Tasks:**
1. Import `Analytics` from `@vercel/analytics/next`
2. Import `SpeedInsights` from `@vercel/speed-insights/next`
3. Add both components inside `<body>`, after `</CartProvider>` close (before `</body>`)
4. Verify TypeScript compiles
5. Test in dev mode (`npm run dev`) — no console errors

**Implementation:**
```tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// ...inside <body>:
<CartProvider>
  <WishlistProvider>
    <CheckoutProvider>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </CheckoutProvider>
  </WishlistProvider>
</CartProvider>
<Analytics />
<SpeedInsights />
```

**Acceptance Criteria:**
- Both components render without errors
- Vercel Analytics events appear in Vercel dashboard (after deploy)
- Speed Insights metrics visible in Vercel dashboard
- No TypeScript errors
- CI passes

---

### WS1.3: Verify analytics in production
**ID:** WS1.3  
**Title:** Post-deploy verification of analytics data flow  
**Parallel:** NO — must run AFTER WS5.2 (deploy)  
**Dependencies:** WS1.2, WS5.2  
**Files:** None (verification task)

**Tasks:**
1. Navigate to Vercel project → Analytics tab
2. Confirm page views are being tracked
3. Navigate to Speed Insights tab
4. Confirm Web Vitals (CLS, FCP, LCP, FID, TTFB) are populating
5. Wait 5 minutes, refresh — verify event ingestion is continuous

**Acceptance Criteria:**
- At least 1 page view recorded within 2 minutes of deploy
- All Web Vitals metrics show data
- No error spikes in Vercel logs related to analytics

---

## Workstream 2: Customer Analytics for Admins
**Owner:** Backend Developer + Frontend Developer  
**Goal:** Instrument funnel events, build admin analytics API, extend admin dashboard.

### WS2.1: Design analytics event schema
**ID:** WS2.1  
**Title:** Define event taxonomy and tracking plan  
**Parallel:** YES — research/design task, no code conflicts  
**Dependencies:** None  
**Files:**
- `docs/superpowers/specs/analytics-events-schema.md` (NEW)

**Tasks:**
1. Define event names for funnel touchpoints:
   - `product_viewed` (product page load)
   - `add_to_cart` (AddToCartButton click)
   - `checkout_initiated` (CheckoutForm step=payment)
   - `payment_method_selected` (razorpay | cod)
   - `payment_submitted` (Razorpay modal opened OR COD place-order clicked)
   - `order_completed` (order-confirmation page load)
2. Define event payload schema (product_id, variant, price, user session ID, timestamp)
3. Decide storage: Vercel Analytics custom events (free tier: 1k/month) OR Supabase `analytics_events` table
4. Document in `docs/superpowers/specs/analytics-events-schema.md`

**Acceptance Criteria:**
- Event taxonomy covers all 6 funnel stages
- Payload schema includes product context + user identifier
- Storage decision made (Vercel vs Supabase)
- Schema doc reviewed by PM/EM

---

### WS2.2: Create Supabase analytics_events table (if Supabase storage chosen)
**ID:** WS2.2  
**Title:** Supabase migration for analytics_events table  
**Parallel:** YES — can run in parallel with WS2.1 completion  
**Dependencies:** WS2.1 (conditional on storage decision)  
**Files:**
- `supabase/migrations/YYYYMMDDHHMMSS_create_analytics_events.sql` (NEW)

**Tasks:**
1. Create migration file:
   ```sql
   CREATE TABLE analytics_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_name TEXT NOT NULL,
     product_id TEXT,
     variant TEXT,
     price NUMERIC,
     user_session_id TEXT,
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
   CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
   ```
2. Run migration locally: `supabase db push`
3. Commit migration file

**Acceptance Criteria:**
- Table exists in local Supabase
- Indexes created
- Migration file committed

---

### WS2.3: Implement client-side event tracking utility
**ID:** WS2.3  
**Title:** Create `lib/analytics.ts` with trackEvent() function  
**Parallel:** YES — new file, no conflicts  
**Dependencies:** WS2.1  
**Files:**
- `lib/analytics.ts` (NEW)

**Tasks:**
1. Create `lib/analytics.ts`:
   ```ts
   import { track } from '@vercel/analytics'
   
   export function trackEvent(
     eventName: string,
     properties: Record<string, any>
   ) {
     // Send to Vercel Analytics
     track(eventName, properties)
     
     // Optionally also POST to /api/analytics (if Supabase storage)
     // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ eventName, ...properties }) })
   }
   ```
2. Handle environment gating (dev vs prod)
3. Add TypeScript types

**Acceptance Criteria:**
- Function compiles without errors
- Can be imported in components
- Events appear in Vercel Analytics dashboard (after deploy)

---

### WS2.4: Instrument AddToCartButton
**ID:** WS2.4  
**Title:** Track `add_to_cart` event in AddToCartButton.tsx  
**Parallel:** YES — isolated component edit  
**Dependencies:** WS2.3  
**Files:**
- `components/cart/add-to-cart-button.tsx`

**Tasks:**
1. Import `trackEvent` from `@/lib/analytics`
2. Call `trackEvent('add_to_cart', { product_id, variant, price })` inside `handleAddToCart()` after `addItem()`
3. Test in dev: click button, verify event fires (console.log or Vercel dashboard)

**Acceptance Criteria:**
- Event fires on every add-to-cart click
- Payload includes product_id, variant, price
- No console errors

---

### WS2.5: Instrument CheckoutForm (checkout_initiated, payment_method_selected)
**ID:** WS2.5  
**Title:** Track checkout funnel events in CheckoutForm.tsx  
**Parallel:** YES — isolated component edit  
**Dependencies:** WS2.3  
**Files:**
- `components/checkout/checkout-form.tsx`

**Tasks:**
1. Track `checkout_initiated` when `step` transitions to `'payment'` (inside `handleDetailsSubmit`)
2. Track `payment_method_selected` when `paymentMethod` radio changes (inside `setPaymentMethod` callback)
3. Include `total`, `discount`, `shipping`, `items.length` in payload

**Acceptance Criteria:**
- `checkout_initiated` fires once per checkout session
- `payment_method_selected` fires on COD/Razorpay toggle
- Payloads include cart summary

---

### WS2.6: Instrument RazorpayCheckout (payment_submitted, order_completed)
**ID:** WS2.6  
**Title:** Track payment events in RazorpayCheckout.tsx + order-confirmation page  
**Parallel:** YES — isolated component edit  
**Dependencies:** WS2.3  
**Files:**
- `components/payment/razorpay-checkout.tsx`
- `app/order-confirmation/[orderNumber]/page.tsx`

**Tasks:**
1. Track `payment_submitted` in `handlePay()` right before Razorpay modal opens (or COD POST)
2. Track `order_completed` in `app/order-confirmation/[orderNumber]/page.tsx` on mount (useEffect)
3. Include `order_number`, `total`, `payment_method` in payloads

**Acceptance Criteria:**
- `payment_submitted` fires when payment flow starts
- `order_completed` fires on confirmation page load
- End-to-end funnel trackable in Vercel Analytics

---

### WS2.7: Build admin analytics API endpoint
**ID:** WS2.7  
**Title:** Create /api/admin/analytics route with funnel metrics  
**Parallel:** YES — new API route, no conflicts  
**Dependencies:** WS2.2 (if Supabase), WS2.6 (instrumentation complete)  
**Files:**
- `app/api/admin/analytics/route.ts` (NEW)

**Tasks:**
1. Create GET handler that queries `analytics_events` table (or calls Vercel Analytics API)
2. Aggregate funnel metrics:
   - Total `product_viewed` events
   - Total `add_to_cart` events
   - Conversion rate: `add_to_cart / product_viewed`
   - Checkout abandonment: `checkout_initiated - order_completed`
   - Payment method breakdown: COD vs Razorpay split
3. Return JSON:
   ```ts
   {
     funnel: {
       product_views: number,
       add_to_cart: number,
       checkout_initiated: number,
       order_completed: number,
       conversion_rate: number
     },
     payment_methods: { cod: number, razorpay: number }
   }
   ```
4. Add auth check (match `/api/admin/stats` pattern — currently insecure localStorage)

**Acceptance Criteria:**
- API returns valid JSON
- Metrics match raw event counts in DB
- Auth guard present (even if temporary)

---

### WS2.8: Extend admin dashboard with analytics section
**ID:** WS2.8  
**Title:** Add Analytics card to app/admin/page.tsx  
**Parallel:** NO — BLOCKS other app/admin/page.tsx edits  
**Dependencies:** WS2.7  
**Files:**
- `app/admin/page.tsx`

**Tasks:**
1. Fetch `/api/admin/analytics` in `useEffect` alongside `/api/admin/stats`
2. Add new card below "Recent Orders" section:
   ```tsx
   <div className="bg-white rounded-card2 shadow-card p-6">
     <h2 className="text-xl font-display font-bold mb-4">Funnel Analytics</h2>
     <div className="space-y-2 text-sm">
       <div className="flex justify-between">
         <span className="text-muted">Product Views</span>
         <span className="font-semibold text-ink">{analytics.funnel.product_views}</span>
       </div>
       <div className="flex justify-between">
         <span className="text-muted">Add to Cart</span>
         <span className="font-semibold text-ink">{analytics.funnel.add_to_cart}</span>
       </div>
       <div className="flex justify-between">
         <span className="text-muted">Conversion Rate</span>
         <span className="font-semibold text-brand">{analytics.funnel.conversion_rate}%</span>
       </div>
     </div>
   </div>
   ```
3. Add loading/error states

**Acceptance Criteria:**
- New card renders without layout breaks
- Metrics update on page refresh
- Loading spinner shown during fetch

---

## Workstream 3: Security & Reliability Hardening
**Owner:** Security Engineer + Backend Developer  
**Goal:** Fix admin auth, add API rate limiting, secure sensitive endpoints.

### WS3.1: Replace localStorage admin check with server-side session
**ID:** WS3.1  
**Title:** Implement proper admin authentication  
**Parallel:** NO — BLOCKS WS2.8 and all admin page work  
**Dependencies:** None (but should complete before WS2.8 to avoid rework)  
**Files:**
- `app/admin/page.tsx`
- `app/api/admin/stats/route.ts`
- `app/api/admin/analytics/route.ts`
- `app/admin/login/page.tsx` (NEW)
- `lib/auth.ts` (NEW or extend existing)

**Tasks:**
1. Create `app/admin/login/page.tsx` with OTP-based login (Firebase Auth or Supabase Auth)
2. Set HTTP-only cookie on successful login (e.g., `admin_session`)
3. Create `lib/auth.ts` with `validateAdminSession()` helper
4. Update `app/admin/page.tsx`: replace localStorage check with server-side session validation via `cookies()` API
5. Add session check to `/api/admin/stats` and `/api/admin/analytics` route handlers
6. Redirect to `/admin/login` if session invalid

**Acceptance Criteria:**
- Admin cannot access `/admin` or APIs without valid session
- Session expires after 24 hours
- No localStorage-based auth remains
- Security review PASS

---

### WS3.2: Add rate limiting to public APIs
**ID:** WS3.2  
**Title:** Rate limit /api/orders and /api/payment endpoints with Upstash  
**Parallel:** YES — isolated middleware/route changes  
**Dependencies:** None (Upstash already in package.json)  
**Files:**
- `app/api/orders/route.ts`
- `app/api/payment/create-order/route.ts`
- `lib/rate-limit.ts` (NEW)

**Tasks:**
1. Create `lib/rate-limit.ts` with Upstash ratelimit config:
   ```ts
   import { Ratelimit } from '@upstash/ratelimit'
   import { Redis } from '@upstash/redis'
   
   export const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
   })
   ```
2. Wrap `/api/orders` POST handler with rate limit check
3. Wrap `/api/payment/create-order` POST handler with rate limit check
4. Return `429 Too Many Requests` when limit exceeded

**Acceptance Criteria:**
- Rate limits enforced on both endpoints
- Legitimate traffic unaffected
- Security review PASS

---

### WS3.3: Security audit of analytics instrumentation
**ID:** WS3.3  
**Title:** Review analytics code for PII leakage and injection risks  
**Parallel:** YES — review task, no code conflicts  
**Dependencies:** WS2.6 (all instrumentation complete)  
**Files:**
- All files modified in WS2.* tasks

**Tasks:**
1. Audit `trackEvent()` calls: ensure no email, phone, or address data in payloads
2. Verify `analytics_events.metadata` column does not store PII
3. Check for XSS risks in admin dashboard (analytics card) — ensure all data is escaped
4. Review Supabase RLS policies on `analytics_events` table (if using Supabase storage)
5. Document findings in `docs/superpowers/specs/analytics-security-review.md`

**Acceptance Criteria:**
- No PII in analytics payloads
- No XSS vulnerabilities in admin dashboard
- RLS policies enforce admin-only access
- Security sign-off

---

## Workstream 4: QA & Testing
**Owner:** QA Engineer  
**Goal:** End-to-end validation of analytics pipeline and admin dashboard.

### WS4.1: Manual E2E funnel test (dev environment)
**ID:** WS4.1  
**Title:** Verify all 6 funnel events fire in local dev  
**Parallel:** NO — must wait for WS2.6 (all instrumentation)  
**Dependencies:** WS2.6  
**Files:** None (manual test)

**Tasks:**
1. Start local dev server: `npm run dev`
2. Open browser DevTools → Network tab
3. Navigate to product page → verify `product_viewed` fires
4. Click "Add to cart" → verify `add_to_cart` fires
5. Navigate to checkout → verify `checkout_initiated` fires
6. Toggle payment method → verify `payment_method_selected` fires
7. Click "Pay" (mock mode) → verify `payment_submitted` fires
8. Reach order confirmation → verify `order_completed` fires
9. Check Vercel Analytics dashboard OR Supabase `analytics_events` table — all 6 events present

**Acceptance Criteria:**
- All 6 events tracked
- Event payloads include correct product/cart data
- No console errors

---

### WS4.2: Admin dashboard analytics card test
**ID:** WS4.2  
**Title:** Verify admin analytics card displays correct metrics  
**Parallel:** NO — must wait for WS2.8 + WS3.1  
**Dependencies:** WS2.8, WS3.1  
**Files:** None (manual test)

**Tasks:**
1. Log in to `/admin` with valid credentials
2. Verify "Funnel Analytics" card renders
3. Cross-check displayed metrics against raw DB counts (run SQL query)
4. Trigger a new funnel event → refresh admin page → verify count updates
5. Test loading state (throttle network in DevTools)
6. Test error state (kill Supabase instance temporarily)

**Acceptance Criteria:**
- Metrics match DB
- UI updates reflect new events within 10 seconds
- Loading/error states work

---

### WS4.3: Performance regression test
**ID:** WS4.3  
**Title:** Lighthouse audit post-analytics integration  
**Parallel:** YES — can run after WS1.2  
**Dependencies:** WS1.2  
**Files:** None (Lighthouse test)

**Tasks:**
1. Run Lighthouse on homepage, product page, checkout page
2. Compare scores BEFORE and AFTER analytics integration
3. Ensure Performance score drop < 5 points
4. Ensure no new render-blocking scripts
5. Check Speed Insights in Vercel dashboard: CLS < 0.1, LCP < 2.5s

**Acceptance Criteria:**
- Lighthouse Performance score ≥ 90
- Web Vitals meet "Good" thresholds
- No blocking issues

---

### WS4.4: Cross-browser compatibility test
**ID:** WS4.4  
**Title:** Test analytics on Chrome, Safari, Firefox, Edge  
**Parallel:** YES — can run after WS2.6  
**Dependencies:** WS2.6  
**Files:** None (manual test)

**Tasks:**
1. Run funnel E2E test (WS4.1) on Chrome, Safari, Firefox, Edge
2. Verify events fire on all browsers
3. Check for console errors specific to any browser
4. Test on mobile Safari (iOS) and Chrome (Android)

**Acceptance Criteria:**
- Events tracked on all 4 desktop browsers
- Events tracked on iOS Safari and Android Chrome
- No browser-specific errors

---

## Workstream 5: CI/CD & Deployment
**Owner:** DevOps / Lead Developer  
**Goal:** Ensure CI passes with new dependencies, deploy to production.

### WS5.1: Update CI workflow for analytics packages
**ID:** WS5.1  
**Title:** Verify CI passes with new dependencies  
**Parallel:** YES — can run after WS1.1  
**Dependencies:** WS1.1  
**Files:**
- `.github/workflows/ci.yml`

**Tasks:**
1. Push WS1.1 changes to a feature branch
2. Open PR
3. Wait for CI to run (typecheck, lint, test, build)
4. If CI fails, debug and fix
5. Merge PR only after CI passes

**Acceptance Criteria:**
- CI green on feature branch
- No new TypeScript errors
- Build completes successfully

---

### WS5.2: Deploy to Vercel production
**ID:** WS5.2  
**Title:** Deploy analytics-enabled app to production  
**Parallel:** NO — BLOCKS post-deploy verification (WS1.3, WS4.*)  
**Dependencies:** WS1.2, WS2.8, WS3.1, WS3.2, WS4.1, WS4.2, WS5.1  
**Files:** None (deployment task)

**Tasks:**
1. Merge all feature branches to `main`
2. Vercel auto-deploys on push to `main`
3. Monitor deployment logs in Vercel dashboard
4. Check for deployment errors (build failures, runtime errors)
5. Verify app loads at production URL: `https://www.tathastukeepsakes.in`

**Acceptance Criteria:**
- Deployment succeeds
- No 500 errors on homepage
- Admin dashboard accessible at `/admin`

---

### WS5.3: Post-deploy smoke test
**ID:** WS5.3  
**Title:** Quick validation of production deployment  
**Parallel:** NO — must run AFTER WS5.2  
**Dependencies:** WS5.2  
**Files:** None (manual test)

**Tasks:**
1. Navigate to homepage → verify Speed Insights badge loads
2. Add item to cart → check Vercel Analytics for `add_to_cart` event (within 2 min)
3. Log in to admin → verify stats and analytics cards render
4. Check Vercel Logs → no errors in last 10 minutes

**Acceptance Criteria:**
- Analytics events appear in Vercel dashboard
- Admin dashboard functional
- No production errors

---

## Dependency Graph

```
WS1.1 (install pkgs)
  ↓
WS1.2 (integrate in layout.tsx) ────────────┐
  ↓                                          ↓
WS1.3 (verify analytics) ← ← ← ← ← ← ← WS5.2 (deploy)
                                             ↑
WS2.1 (design schema)                        │
  ↓                                          │
WS2.2 (Supabase migration)                   │
  ↓                                          │
WS2.3 (trackEvent() util)                    │
  ↓                                          │
WS2.4, WS2.5, WS2.6 (instrument funnel) ─────┤
  ↓                                          │
WS2.7 (admin analytics API)                  │
  ↓                                          │
WS2.8 (admin dashboard card) ←───────────────┘
  ↓
WS3.1 (secure admin auth) ─────┐
  ↓                            │
WS3.2 (rate limiting)          │
  ↓                            │
WS3.3 (security audit) ────────┤
  ↓                            │
WS4.1 (E2E funnel test)        │
  ↓                            │
WS4.2 (admin dashboard test) ──┤
  ↓                            │
WS4.3 (performance test)       │
  ↓                            │
WS4.4 (cross-browser test) ────┤
  ↓                            │
WS5.1 (CI verification) ───────┤
  ↓                            │
WS5.2 (deploy) ← ← ← ← ← ← ← ← ┘
  ↓
WS5.3 (smoke test)
```

---

## Parallelization Strategy

### Phase 1: Foundation (Day 1)
**PARALLEL:**
- WS1.1 (install packages)
- WS2.1 (design event schema)

### Phase 2: Core Integration (Day 1-2)
**SEQUENTIAL (app/layout.tsx conflict):**
- WS1.2 (integrate in layout.tsx)

**PARALLEL (after WS2.1 complete):**
- WS2.2 (Supabase migration)
- WS2.3 (trackEvent util)

### Phase 3: Instrumentation (Day 2-3)
**PARALLEL (isolated components):**
- WS2.4 (AddToCartButton)
- WS2.5 (CheckoutForm)
- WS2.6 (RazorpayCheckout)

**PARALLEL (new API routes):**
- WS2.7 (admin analytics API)
- WS3.2 (rate limiting)

### Phase 4: Admin & Security (Day 3-4)
**SEQUENTIAL (app/admin/page.tsx conflict):**
- WS3.1 (secure auth) → WS2.8 (admin dashboard card)

**PARALLEL (review tasks):**
- WS3.3 (security audit)
- WS4.3 (performance test)

### Phase 5: QA & Deploy (Day 4-5)
**SEQUENTIAL (QA needs complete instrumentation):**
- WS4.1 (E2E funnel test)
- WS4.2 (admin dashboard test)

**PARALLEL:**
- WS4.4 (cross-browser test)
- WS5.1 (CI verification)

**SEQUENTIAL (deploy gate):**
- WS5.2 (deploy) → WS1.3 (verify analytics) + WS5.3 (smoke test)

---

## Risk Mitigation

### Risk: Admin auth refactor (WS3.1) breaks existing admin workflows
**Mitigation:** 
- Feature-flag admin login (env var `NEXT_PUBLIC_ENABLE_NEW_AUTH`)
- Run parallel A/B test with old localStorage flow for 24 hours
- Full rollback plan documented

### Risk: Analytics events cause performance regression
**Mitigation:**
- WS4.3 (Lighthouse audit) is a BLOCKER for deploy
- If Performance score drops >5 points, defer WS2.* to post-launch
- Use Vercel Analytics `track()` sparingly (only 6 events, not per-component)

### Risk: Supabase RLS misconfiguration exposes analytics data
**Mitigation:**
- WS3.3 (security audit) must PASS before WS5.2
- Manual RLS policy test in QA environment
- Penetration test: attempt to query `analytics_events` as non-admin

### Risk: CI fails due to missing Vercel env vars
**Mitigation:**
- WS5.1 explicitly tests CI before merge
- Add placeholder env vars to `.github/workflows/ci.yml` for Analytics (if needed)

---

## Open Questions

1. **Analytics storage:** Vercel Analytics (free tier: 1k events/month) vs Supabase `analytics_events` table?  
   **Recommendation:** Start with Vercel Analytics for simplicity. If event volume >1k/month, migrate to Supabase.

2. **Admin auth method:** Firebase Auth (already in package.json) vs Supabase Auth?  
   **Recommendation:** Use Firebase Auth (phone OTP) since Firebase SDK is already present. Less refactoring.

3. **PII in analytics:** Should we track user phone numbers in `add_to_cart` events for fraud detection?  
   **Recommendation:** NO. Use anonymous session ID (`crypto.randomUUID()` stored in localStorage) instead.

4. **Event sampling:** Should we sample events (e.g., 10% of users) to reduce volume?  
   **Recommendation:** NO for Phase 1. Implement sampling only if we hit Vercel's 1k/month limit.

---

## Success Metrics

### Vercel Analytics (Post-Deploy)
- [ ] Page views tracked for all routes
- [ ] Funnel events appear within 2 minutes of production deploy
- [ ] Web Vitals (LCP, CLS, FID) within "Good" range

### Admin Dashboard
- [ ] Funnel Analytics card shows conversion rate
- [ ] Metrics update on page refresh
- [ ] Admin auth prevents unauthorized access

### Performance
- [ ] Lighthouse Performance score ≥ 90
- [ ] Speed Insights: LCP < 2.5s, CLS < 0.1
- [ ] No increase in bundle size > 10KB

### Security
- [ ] No PII in analytics payloads
- [ ] Admin APIs require valid session
- [ ] Rate limiting prevents abuse of /api/orders

---

## Appendix: File Manifest

### New Files (8)
1. `docs/superpowers/specs/analytics-events-schema.md`
2. `supabase/migrations/YYYYMMDDHHMMSS_create_analytics_events.sql`
3. `lib/analytics.ts`
4. `app/api/admin/analytics/route.ts`
5. `app/admin/login/page.tsx`
6. `lib/auth.ts` (or extend existing)
7. `lib/rate-limit.ts`
8. `docs/superpowers/specs/analytics-security-review.md`

### Modified Files (9)
1. `package.json`
2. `package-lock.json`
3. `app/layout.tsx` ⚠️ SEQUENTIAL — one editor at a time
4. `components/cart/add-to-cart-button.tsx`
5. `components/checkout/checkout-form.tsx`
6. `components/payment/razorpay-checkout.tsx`
7. `app/admin/page.tsx` ⚠️ SEQUENTIAL — one editor at a time
8. `app/api/admin/stats/route.ts`
9. `.github/workflows/ci.yml` (if env vars needed)

---

## Sign-Off

**Engineering Manager:** _[Pending]_  
**Security Lead:** _[Pending — WS3.* tasks]_  
**QA Lead:** _[Pending — WS4.* tasks]_  
**PM:** _[Pending — analytics schema approval]_

---

**Next Steps:**
1. Review this WBS with team
2. Assign owners to each workstream
3. Create GitHub issues/tasks for each WS*.* item
4. Kick off Phase 1 (WS1.1 + WS2.1) in parallel
