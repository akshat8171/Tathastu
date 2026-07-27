# Go-Live Director Charter
**Tathastu Keepsakes E-commerce Platform**

**Date:** 2026-07-25  
**Initiative:** Production Launch Readiness  
**Region:** India (sin1 deployment)  
**Trigger:** Vercel Analytics/Speed Insights not set up; Admin security gaps identified  

---

## Executive Summary

This charter defines acceptance criteria, risk register, and definition-of-done for launching Tathastu Keepsakes (https://www.tathastukeepsakes.in) to production. The site is a Next.js 16.2.9 / React 19 e-commerce platform with Supabase backend, Razorpay payments, deployed on Vercel (sin1).

**Primary Objectives:**
1. **Production-ready launch** — site is secure, monitored, compliant, and performant
2. **Admin analytics** — admins can analyze everything about customers (order behavior, product affinity, conversion funnel, session analytics)

**Critical Gap:** Vercel Analytics + Speed Insights not installed; admin auth uses client-side localStorage (insecure).

---

## 1. Go-Live Acceptance Criteria

### P0 — BLOCKERS (Must-Have Before Launch)

#### P0.1 Analytics & Monitoring ⚠️ **NOT IMPLEMENTED**
- [ ] **Install @vercel/analytics** and inject `<Analytics />` in app/layout.tsx
- [ ] **Install @vercel/speed-insights** and inject `<SpeedInsights />` in app/layout.tsx
- [ ] **Enable Vercel Analytics** in Vercel dashboard → Analytics → Enable
- [ ] **Enable Speed Insights** in Vercel dashboard → Speed Insights → Enable
- [ ] **Verify data collection** — confirm events flowing in Vercel dashboard after 24h
- [ ] **Custom event tracking** — instrument key user actions:
  - Product view (PDP load)
  - Add to cart
  - Checkout initiated
  - Payment success/failure
  - Order placed
- [ ] **Error tracking** — Vercel error logs monitored; alerts configured for 5xx errors

**Impact:** Without analytics, admins cannot "analyze everything about the customer." Without Speed Insights, performance regressions go undetected.

#### P0.2 Admin Authentication & Authorization ⚠️ **CRITICAL SECURITY VULNERABILITY**
Current state: `app/admin/page.tsx` lines 35-36 check `localStorage.getItem('admin_phone') === '+919154892790'` — trivially bypassable.

- [ ] **Replace client-side auth** with server-side session validation:
  - Create `/api/admin/auth/login` route with Supabase auth
  - Verify admin role via `users.role = 'admin'` column (add if missing)
  - Issue httpOnly session cookie
  - Create middleware to protect `/admin/*` routes (redirect to `/admin/login` if unauthorized)
- [ ] **Add admin role to database schema** — `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'`
- [ ] **Secure admin API routes** — `/api/admin/*` must verify session + admin role
- [ ] **Remove localStorage check** from `app/admin/page.tsx`
- [ ] **Test:** non-admin users cannot access `/admin` even with localStorage manipulation

**Impact:** Current implementation allows ANY user to gain admin access by opening DevTools and running `localStorage.setItem('admin_phone', '+919154892790')`. This is a **P0 security blocker**.

#### P0.3 Razorpay Production Mode ⚠️ **PAYMENT RISK**
- [ ] **Verify Razorpay LIVE keys** in Vercel env vars (not test mode keys)
- [ ] **Webhook active** — Razorpay webhook configured to `https://www.tathastukeepsakes.in/api/payment/webhook`
- [ ] **Webhook secret** matches `RAZORPAY_WEBHOOK_SECRET` in Vercel
- [ ] **End-to-end payment test** — complete a ₹1 test order in production with real payment (refund immediately)
- [ ] **Verify signature validation** in `/api/payment/webhook` route
- [ ] **COD orders functional** — orders with `payment_method: 'cod'` create successfully

**Impact:** Incorrect webhook or key mismatch = payments succeed but orders never mark as paid, causing fulfillment chaos and customer complaints.

#### P0.4 Security Headers & HTTPS
Current state: `next.config.js` has CSP, HSTS, X-Frame-Options configured ✅

- [x] HTTPS enforced (Vercel auto-provisions)
- [x] Security headers present (verified in next.config.js lines 28-47)
- [ ] **Verify headers in production** — test with https://securityheaders.com
- [ ] **CSP refinement** — ensure no `unsafe-inline` for scripts (check Razorpay script loading)

#### P0.5 Legal Compliance (India DPDP + GDPR)
Current state: Privacy, Terms, Refund, Shipping policies exist ✅

- [x] Privacy policy exists (`/privacy`)
- [x] Terms of Service exist (`/terms`)
- [x] Refund policy exists (`/refund-and-returns-policy`)
- [x] Shipping policy exist (`/shipping-policy`)
- [ ] **Cookie consent banner** — NOT IMPLEMENTED ⚠️
  - Add cookie consent banner for analytics/tracking cookies (Vercel Analytics uses cookies)
  - Comply with DPDP 2023 (India) — user consent before non-essential cookies
  - Store consent in localStorage; only load Analytics after consent
- [ ] **Privacy policy mentions Vercel Analytics** — update to disclose third-party analytics provider
- [ ] **Contact info in footer** — physical address, email, phone present (verify)
- [ ] **Vercel GDPR DPA** — review Vercel's GDPR Data Processing Addendum (applies to Indian users accessing via EU)

**Impact:** Launching without cookie consent in India risks DPDP 2023 penalties (up to ₹250 crore). EU users visiting the site are covered by GDPR (extraterritorial application).

#### P0.6 CI/CD & Build Stability
Current state: GitHub Actions CI runs typecheck/lint/test/build ✅

- [x] CI pipeline passing on main branch
- [ ] **Verify CI runs on PRs** — open a test PR and confirm checks run
- [ ] **Build env vars secure** — confirm no secrets logged in CI (verified: placeholders used)
- [ ] **Vercel production deploy successful** — confirm latest commit deployed to production

---

### P1 — SHOULD-HAVE (Launch Quality, Can Ship Without)

#### P1.1 Enhanced Admin Analytics Dashboard
Current state: `/admin` shows basic stats (total orders, revenue, AOV, recent orders, top products) ✅

**Customer Analysis Requirements ("analyze everything about the customer"):**
- [ ] **Customer segmentation** — RFM analysis (Recency, Frequency, Monetary)
- [ ] **Cohort analysis** — retention by signup month
- [ ] **Product affinity** — "customers who bought X also bought Y"
- [ ] **Conversion funnel** — product views → add-to-cart → checkout → paid (requires P0.1 custom events)
- [ ] **Geographic analysis** — orders by state/city
- [ ] **Payment method breakdown** — COD vs Razorpay vs UPI/card split
- [ ] **Customer lifetime value (LTV)** calculation
- [ ] **Cart abandonment tracking** — requires checkout event instrumentation
- [ ] **Session replay** (optional, privacy-invasive) — consider Vercel Web Analytics Session Replay (paid)

**Implementation Path:**
- Phase 1 (P1): Build SQL queries for the above metrics; add to `/api/admin/stats/advanced`
- Phase 2 (P2): Create `/admin/customers` page with filters, search, individual customer drill-down

#### P1.2 Performance Optimization
- [ ] **Lighthouse audit** — target scores: Performance 90+, Accessibility 100, Best Practices 100, SEO 100
- [ ] **Core Web Vitals** — LCP <2.5s, FID <100ms, CLS <0.1
- [ ] **Image optimization** — all product images use Next.js `<Image>` with AVIF/WebP (verify in next.config.js ✅)
- [ ] **Font optimization** — Poppins and Inter preloaded (verify `display: 'swap'` in app/layout.tsx ✅)
- [ ] **Bundle size audit** — check for large dependencies; lazy-load Razorpay script ✅
- [ ] **Vercel Edge caching** — confirm public pages served from Edge (check cache headers)

#### P1.3 Error Handling & User Experience
- [ ] **Error boundaries** — wrap top-level components to catch React errors gracefully
- [ ] **API error toasts** — user-friendly messages for failed API calls (not raw error.message)
- [ ] **Payment failure handling** — clear messaging + retry flow for Razorpay errors
- [ ] **Network offline detection** — show banner when user loses connection
- [ ] **Loading states** — skeleton screens for product lists, cart, checkout

#### P1.4 SEO & Discoverability
Current state: JSON-LD schema, sitemap, robots.txt, OG tags configured ✅

- [x] Organization schema in app/layout.tsx
- [x] Sitemap at `/sitemap.ts`
- [ ] **Product schema** — add Product JSON-LD to PDPs (app/products/[slug]/page.tsx)
- [ ] **BreadcrumbList schema** — add to category and product pages
- [ ] **Google Search Console** — verify domain ownership, submit sitemap
- [ ] **Bing Webmaster Tools** — submit sitemap
- [ ] **Pinterest domain verification** — already present (p:domain_verify meta tag ✅)
- [ ] **Instagram Shopping** — if Instagram handle in use, tag products

#### P1.5 Backup & Disaster Recovery
- [ ] **Supabase backups** — verify daily backups enabled (Supabase auto-backups on paid plans)
- [ ] **Database snapshot before launch** — manual pg_dump for rollback
- [ ] **Vercel rollback tested** — confirm instant rollback capability in Vercel dashboard
- [ ] **Razorpay webhook replay** — test webhook replay for failed deliveries

---

### P2 — NICE-TO-HAVE (Post-Launch Enhancements)

#### P2.1 Advanced Monitoring
- [ ] **Sentry integration** — client + server error tracking with source maps
- [ ] **Uptime monitoring** — UptimeRobot or Vercel Monitoring for 24/7 health checks
- [ ] **Slack alerts** — PagerDuty or Vercel Slack integration for critical errors
- [ ] **Log aggregation** — Vercel logs → external service (Datadog, Logtail) for long-term retention

#### P2.2 A/B Testing & Experimentation
- [ ] **Vercel Edge Config** — feature flags for gradual rollout
- [ ] **Product page A/B tests** — test different CTAs, image layouts
- [ ] **Checkout optimization** — test one-page vs multi-step checkout

#### P2.3 Customer Retention
- [ ] **Email marketing integration** — MailChimp/SendGrid for abandoned cart emails
- [ ] **Push notifications** — OneSignal for order updates
- [ ] **Loyalty program** — points for repeat purchases

#### P2.4 Compliance & Accessibility
- [ ] **WCAG 2.1 AA audit** — hire accessibility consultant for full audit
- [ ] **Screen reader testing** — manual test with NVDA/JAWS
- [ ] **Keyboard navigation** — ensure all interactive elements reachable via Tab

---

## 2. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| **R1** | **Admin auth bypass** — localStorage check allows any user to become admin | **HIGH** | **CRITICAL** | **[P0.2]** Replace with server-side session + role-based access control. Test with non-admin user attempting `/admin` access. |
| **R2** | **Payment webhook failure** — orders paid but never marked as paid in DB | **MEDIUM** | **HIGH** | **[P0.3]** End-to-end payment test in production. Monitor webhook delivery in Razorpay dashboard. Implement webhook replay for failures. Set up alerts for `payment_status = 'pending'` orders older than 1 hour. |
| **R3** | **No customer analytics** — admins blind to user behavior, cannot optimize | **HIGH** | **MEDIUM** | **[P0.1]** Install Vercel Analytics + Speed Insights immediately. Custom event tracking for funnel analysis. [P1.1] SQL-based cohort + segmentation reports. |
| **R4** | **Cookie consent violation** — DPDP 2023 penalties in India | **MEDIUM** | **MEDIUM** | **[P0.5]** Add cookie consent banner before launch. Only load analytics after user consent. Update privacy policy to mention Vercel Analytics. |
| **R5** | **Razorpay test keys in production** — real payments go to test account | **LOW** | **CRITICAL** | **[P0.3]** Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` starts with `rzp_live_` (not `rzp_test_`). Cross-check with Razorpay dashboard (test vs live mode). |
| **R6** | **Build failure blocks deploy** — bad commit merges to main, site goes down | **MEDIUM** | **HIGH** | CI already gates merges ✅. Add branch protection rule: require CI passing + 1 review before merge. Test rollback procedure in Vercel. |
| **R7** | **Performance regression** — slow pages cause cart abandonment | **MEDIUM** | **MEDIUM** | **[P0.1]** Speed Insights monitors Core Web Vitals. [P1.2] Lighthouse CI in GitHub Actions (optional). Set alert for LCP >3s. |
| **R8** | **Data breach** — Supabase RLS misconfigured, user data exposed | **LOW** | **CRITICAL** | Review RLS policies in `supabase/schema.sql`. Test: logged-in user cannot query other users' orders. Enable Supabase Vault for secrets. Audit API routes for authorization checks. |

---

## 3. Definition of Done

The initiative is **DONE** when:

### Functional Acceptance
- [ ] All **P0 criteria** (sections P0.1–P0.6) are complete and verified in production
- [ ] End-to-end smoke test passes:
  1. Browse products as anonymous user
  2. Add product to cart
  3. Sign in via phone OTP
  4. Complete checkout with Razorpay (₹1 test order)
  5. Verify order appears in `/account/orders`
  6. Verify order appears in `/admin` dashboard (as admin)
  7. Verify payment webhook received (check Razorpay dashboard)
  8. Verify Vercel Analytics events captured (product view, add-to-cart, order placed)
- [ ] Admin authentication tested with **non-admin user** — access denied to `/admin`
- [ ] Security headers verified with https://securityheaders.com (grade A or B minimum)
- [ ] Cookie consent banner functional (user can accept/reject; Analytics respects choice)

### Operational Readiness
- [ ] **Monitoring live** — Vercel Analytics + Speed Insights collecting data
- [ ] **Alerts configured** — email/Slack alerts for:
  - 5xx error rate >1% over 5 minutes
  - Payment webhook failures
  - Server response time >2s (p95)
- [ ] **Runbook documented** — incident response playbook for:
  - Payment failures
  - Supabase downtime
  - Vercel outage
  - Admin lockout
- [ ] **Team trained** — admin user can navigate dashboard, view customer analytics, export order data

### Compliance & Legal
- [ ] Privacy policy updated (mentions Vercel Analytics)
- [ ] Cookie consent banner live
- [ ] Contact information in footer (physical address, email, phone)
- [ ] Legal pages linked in footer (Privacy, Terms, Refund, Shipping)

### Sign-Off
- [ ] **Product Owner** approves P0 criteria completion
- [ ] **Security review** passed (admin auth, RLS policies, API authorization)
- [ ] **Load test** (optional): 100 concurrent users, no 5xx errors
- [ ] **Go/No-Go decision** recorded in this document

---

## 4. Implementation Phases

### Phase 1: Security & Payments (P0 Blockers) — **MUST COMPLETE BEFORE LAUNCH**
**Duration:** 2-3 days  
**Owner:** Backend engineer + DevOps

1. **Admin auth** (R1): Replace localStorage check with Supabase session + middleware
2. **Razorpay live mode** (R2, R5): Verify keys, webhook, end-to-end test
3. **Cookie consent** (R4): Add banner component, integrate with Analytics

**Exit Criteria:** P0.2, P0.3, P0.5 complete.

---

### Phase 2: Monitoring & Analytics (P0.1) — **LAUNCH DEPENDENCY**
**Duration:** 1 day  
**Owner:** Frontend engineer

1. Install `@vercel/analytics` and `@vercel/speed-insights`
2. Inject components in `app/layout.tsx`
3. Add custom event tracking (product view, add-to-cart, checkout, payment)
4. Enable in Vercel dashboard
5. Verify data flowing after 24h

**Exit Criteria:** P0.1 complete, events visible in Vercel dashboard.

---

### Phase 3: Launch & Verification — **GO-LIVE**
**Duration:** 1 day  
**Owner:** Product + Engineering

1. Final smoke test (see Definition of Done)
2. Security header verification
3. Monitor for 24h (no critical errors)
4. Announce launch 🚀

**Exit Criteria:** All P0 criteria met, smoke test passed, no incidents.

---

### Phase 4: Post-Launch Optimization (P1) — **1-2 Weeks After Launch**
**Duration:** 1-2 weeks  
**Owner:** Product + Engineering

1. Advanced admin analytics (P1.1)
2. Performance optimization (P1.2)
3. SEO enhancements (P1.4)

**Exit Criteria:** P1 criteria 80% complete.

---

## 5. Rollback Plan

If critical issues arise post-launch:

1. **Immediate:** Revert to previous Vercel deployment (Vercel dashboard → Deployments → previous SHA → Promote to Production)
2. **Database:** Restore from latest Supabase snapshot (if schema changes were deployed)
3. **Payments:** Pause Razorpay webhook in dashboard to prevent order creation until fix deployed
4. **Communication:** Post incident report in Slack; email customers if orders affected

---

## 6. Success Metrics (Post-Launch)

Track for 7 days after launch:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | 99.9% | Vercel uptime dashboard |
| **Payment success rate** | >95% | Razorpay dashboard / Supabase orders table |
| **Checkout abandonment** | <60% | Vercel Analytics funnel (checkout initiated → order placed) |
| **Lighthouse Performance** | >90 | lighthouse-ci in CI/CD |
| **Core Web Vitals (LCP)** | <2.5s | Vercel Speed Insights |
| **Admin dashboard usage** | >10 sessions/day | Vercel Analytics (admin routes) |
| **5xx error rate** | <0.1% | Vercel error logs |
| **Customer support tickets** | <5/day related to site issues | Manual tracking |

---

## 7. Stakeholder Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | [Name] | [Date] | ________ |
| Tech Lead | [Name] | [Date] | ________ |
| Security Reviewer | [Name] | [Date] | ________ |
| DevOps | [Name] | [Date] | ________ |

---

## Appendix A: Reference Files

| File | Purpose | Status |
|------|---------|--------|
| `app/layout.tsx` | Root layout — inject Analytics/SpeedInsights here | ✅ Exists |
| `app/admin/page.tsx` | Admin dashboard — **INSECURE AUTH** | ⚠️ Needs fix |
| `app/api/admin/stats/route.ts` | Admin stats API — **NO AUTH CHECK** | ⚠️ Needs auth middleware |
| `vercel.json` | Vercel config | ✅ Configured |
| `next.config.js` | Security headers | ✅ Configured |
| `.github/workflows/ci.yml` | CI pipeline | ✅ Passing |
| `supabase/schema.sql` | Database schema | ⚠️ Add `users.role` column |
| `DEPLOYMENT.md` | Deployment guide | ✅ Complete |

---

## Appendix B: Admin Analytics Queries (P1.1 Implementation)

```sql
-- RFM Segmentation (Recency, Frequency, Monetary)
WITH rfm AS (
  SELECT 
    user_id,
    DATE_PART('day', NOW() - MAX(created_at)) AS recency_days,
    COUNT(*) AS frequency,
    SUM(total) AS monetary
  FROM orders
  WHERE status = 'delivered'
  GROUP BY user_id
)
SELECT 
  user_id,
  CASE 
    WHEN recency_days <= 30 THEN 'Hot'
    WHEN recency_days <= 90 THEN 'Warm'
    ELSE 'Cold'
  END AS recency_segment,
  frequency,
  monetary
FROM rfm
ORDER BY monetary DESC;

-- Cohort Retention (by signup month)
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', created_at) AS cohort_month,
    user_id
  FROM users
),
cohort_orders AS (
  SELECT 
    c.cohort_month,
    DATE_TRUNC('month', o.created_at) AS order_month,
    COUNT(DISTINCT o.user_id) AS users
  FROM cohorts c
  JOIN orders o ON c.user_id = o.user_id
  GROUP BY 1, 2
)
SELECT 
  cohort_month,
  order_month,
  users,
  100.0 * users / FIRST_VALUE(users) OVER (PARTITION BY cohort_month ORDER BY order_month) AS retention_pct
FROM cohort_orders
ORDER BY cohort_month, order_month;

-- Product Affinity (customers who bought X also bought Y)
WITH product_pairs AS (
  SELECT 
    a.order_id,
    a.product_name AS product_a,
    b.product_name AS product_b
  FROM order_items a
  JOIN order_items b ON a.order_id = b.order_id AND a.product_name < b.product_name
)
SELECT 
  product_a,
  product_b,
  COUNT(*) AS co_occurrence
FROM product_pairs
GROUP BY 1, 2
ORDER BY co_occurrence DESC
LIMIT 20;
```

---

**End of Charter**
