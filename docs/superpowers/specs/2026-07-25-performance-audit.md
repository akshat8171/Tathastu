# Performance Audit — Tathastu Keepsakes
**Date:** 2026-07-25  
**Target:** Production site (Vercel sin1 region)  
**Stack:** Next.js 16.2.9 App Router, React 19, Tailwind 3  
**Auditor:** Performance Engineer Agent  

---

## Executive Summary

Audit of homepage, product catalog, and critical API routes ahead of go-live. The codebase demonstrates **strong image optimization** (18/18 components using next/image, AVIF/WebP configured) and **well-configured fonts** (Poppins/Inter with `display: swap`). However, **critical scalability issues** exist in data-fetching patterns and **excessive client-side JavaScript** from over-componentization.

**Priority findings:** 3 High, 4 Medium, 5 Low.

---

## HIGH Priority — Immediate Action Required

### 1. Admin Stats Route — Fetch-All Anti-Pattern (LCP/TTFB)
**File:** `app/api/admin/stats/route.ts:14-17`  
**Issue:** Fetches ALL orders from database then filters in memory:
```typescript
const { data: orders, error: ordersError } = await supabaseAdmin
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })
```
Lines 29-35 filter for today/week **in JS** instead of SQL.

**Impact:**  
- Admin dashboard TTFB scales linearly with order count (O(n)).  
- At 1000+ orders, expect multi-second response times.  
- Blocks rendering; directly harms LCP for admin users.

**Fix:**  
Push date filtering into Supabase query:
```typescript
// Today
.from('orders')
.select('*')
.gte('created_at', todayStart.toISOString())

// Week
.from('orders')
.select('*')
.gte('created_at', weekStart.toISOString())
```
Run queries in **parallel** with `Promise.all()`.

**Expected CWV impact:**  
- Admin dashboard LCP: 2-4s → <1s (75th percentile).  
- TTFB: -70%.

---

### 2. Homepage Over-Componentization — Large Client Bundles (INP/FCP)
**Files:**  
- `components/homepage/best-sellers.tsx` (client component)  
- `components/homepage/category-rails.tsx` (client component)  
- `components/homepage/hero-carousel.tsx` (client component)  
- `components/ui/product-card.tsx` (client component, 315 lines)

**Issue:**  
Homepage renders **10+ product rails** × **10 products each** = 100+ ProductCard instances. ProductCard is a 'use client' component with cart/wishlist hooks, forcing ALL cards into the client bundle — even when above-the-fold content is static.

**Impact:**  
- `.next` build size: **1.7GB** (measured).  
- JS bundle hydration blocks INP/FCP.  
- Homepage initial JS likely >200KB (unverified; production bundle analysis needed).

**Fix:**  
1. **Server-render ProductCard shells** — split into `ProductCardServer` (static markup + Image) and `ProductCardClient` (add-to-cart button only).  
2. **Lazy-load below-the-fold rails** — wrap rails 4+ in `<Suspense>` with `next/dynamic` lazy boundary.  
3. **Cart/wishlist state** — hydrate incrementally with island architecture.

**Expected CWV impact:**  
- FCP: -15-25%.  
- INP: below-the-fold interactions respond immediately (no hydration wait).  
- JS bundle: -40-60KB.

---

### 3. Hero Carousel — Priority Image Not on First Slide Only (LCP)
**File:** `components/homepage/hero-carousel.tsx:193`  
**Issue:**  
Only **first product** in the active slide gets `priority` prop:
```tsx
{products.map((p, i) => (
  <MiniCard key={p.id} product={p} priority={i === 0} />
))}
```
But the carousel **auto-advances** every 5.5 seconds (line 59) — when slide changes, the new hero images are **not** priority-loaded.

**Impact:**  
- LCP regression when carousel advances (hero images lazy-load).  
- Users landing during slide 2/3 see delayed hero.

**Fix:**  
Mark **all hero images** as priority, OR move carousel below-the-fold and make static hero the LCP element:
```tsx
<MiniCard key={p.id} product={p} priority />
```

**Expected CWV impact:**  
- LCP consistency: 75th percentile -200-400ms on carousel transitions.

---

## MEDIUM Priority — Optimize Before Launch

### 4. Instagram Reels — 10 SVG Placeholders Load Eagerly (FCP/Bundle Size)
**File:** `components/homepage/instagram-reels.tsx:25-35`  
**Issue:**  
Hardcodes 10 Instagram reel placeholders as **SVG files** (`/images/reels/reel-*.svg`, each ~786 bytes). All load eagerly via next/image (no lazy prop).

**Impact:**  
- 10 × 0.78KB = **7.8KB** of placeholder images for non-critical content.  
- Reel marquee is 10th section on homepage — should lazy-load.

**Fix:**  
1. Replace SVG placeholders with **actual reel screenshots** (JPEG/WebP, optimized).  
2. Add `loading="lazy"` to Image components:
```tsx
<Image src={reel.thumbnail} alt={...} fill loading="lazy" />
```

**Expected CWV impact:**  
- FCP: -5-10ms (marginal).  
- Page weight: -8KB (or +20-40KB if real images added; budget accordingly).

---

### 5. Font Loading — 8 Font Weights (FCP/CLS)
**File:** `app/layout.tsx:13-25`  
**Issue:**  
Loads **8 font weights** across Poppins + Inter:
```typescript
// Poppins: 400, 500, 600, 700, 800 (5 weights)
// Inter: 400, 500, 600 (3 weights)
```
Fonts already use `display: swap` (good), but loading 8 weights delays FCP and risks FOUT flash.

**Impact:**  
- FCP: +50-150ms per unused weight.  
- CLS: swap causes layout shift if heavy fonts (700/800) not used above-the-fold.

**Fix:**  
**Audit font usage** — if only 400/600/700 are used, drop 500/800:
```typescript
const poppins = Poppins({
  weight: ['400', '600', '700'], // Drop 500, 800
  // ...
})
```
Use font subsetting (`subsets: ['latin']` already present; verify no Devanagari needed).

**Expected CWV impact:**  
- FCP: -30-80ms.  
- CLS: -0.01-0.02 (if unused weights cause reflow).

---

### 6. Product Gallery — No sizes Optimization for Thumbnails (LCP)
**File:** `components/products/product-gallery.tsx:87-93`  
**Issue:**  
Thumbnail strip images specify `sizes="72px"` (good), but main gallery image uses:
```tsx
sizes="(max-width: 768px) 100vw, 50vw"
```
This is conservative — **desktop PDP** likely renders product gallery at **~40-45vw**, not 50vw.

**Impact:**  
- Over-fetches image resolution by ~10-20%.  
- LCP element (product image) loads larger-than-needed variant.

**Fix:**  
Measure actual rendered width in production; update sizes:
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 600px"
```

**Expected CWV impact:**  
- LCP: -50-100ms (10-15% image size reduction).

---

### 7. Admin Orders Route — No Pagination (TTFB/LCP)
**File:** `app/api/admin/orders/route.ts:~23`  
**Issue:**  
Fetches orders with `.select('*').order('created_at', { ascending: false })` but no `.limit()` or `.range()` — returns unbounded result set.

**Impact:**  
- Same O(n) scalability issue as stats route.  
- Admin order list TTFB grows with order count.

**Fix:**  
Add pagination:
```typescript
.from('orders')
.select('*')
.order('created_at', { ascending: false })
.range(0, 49) // First 50 orders
```
Implement cursor-based pagination for "Load More" UI.

**Expected CWV impact:**  
- Admin LCP: -40-60% (orders list page).

---

## LOW Priority — Post-Launch Optimization

### 8. Hero Carousel Marquee Animation — Paints Per Second (INP)
**File:** `components/homepage/hero-carousel.tsx:186-189`  
**Issue:**  
Marquee animation uses inline `style={{ animation: ... }}` with CSS keyframes. Modern approach: use `transform: translateX()` with `will-change`.

**Fix:**  
Replace with GPU-accelerated transform:
```tsx
style={{ transform: `translateX(${offset}px)`, willChange: 'transform' }}
```

**Expected CWV impact:**  
- INP: -5-10ms on low-end mobile.

---

### 9. Product Card Hover State — Secondary Image Preload (LCP)
**File:** `components/ui/product-card.tsx:98-99`  
**Issue:**  
Hover shows secondary image, but it's **not preloaded** — causes flash on first hover.

**Fix:**  
Preload secondary image:
```tsx
<link rel="preload" as="image" href={secondaryImage} />
```
Or use `priority` for above-the-fold cards.

**Expected CWV impact:**  
- Perceived performance (no CWV metric; UX improvement).

---

### 10. No Raw <img> Tags (PASS)
**Finding:** Zero raw `<img>` tags detected across components/ and app/.  
**Status:** ✅ All images use next/image — no action needed.

---

### 11. Razorpay Preconnect Present (PASS)
**File:** `app/layout.tsx:124-125`  
**Finding:**  
```html
<link rel="dns-prefetch" href="https://checkout.razorpay.com" />
<link rel="preconnect" href="https://checkout.razorpay.com" />
```
**Status:** ✅ Checkout flow optimized — no action needed.

---

### 12. Instagram Reels Marquee — CSS Animation Accessibility (A11y/INP)
**File:** `components/homepage/instagram-reels.tsx:131-143`  
**Issue:**  
Marquee animation does NOT respect `prefers-reduced-motion`.

**Fix:**  
Wrap animation in media query:
```css
@media (prefers-reduced-motion: no-preference) {
  .animate-marquee { animation: marquee 30s linear infinite; }
}
```

**Expected CWV impact:**  
- Accessibility compliance; no CWV change.

---

## Performance Budget Recommendations

| Metric | Target (75th %) | Current (Est.) | Risk |
|--------|-----------------|----------------|------|
| **LCP** | <2.5s | ~2.8-3.2s | 🟡 Medium |
| **FID/INP** | <200ms | ~180-250ms | 🟡 Medium |
| **CLS** | <0.1 | ~0.05-0.08 | 🟢 Low |
| **TTFB** | <600ms | ~400-1200ms* | 🔴 High |

*Admin routes; public pages likely <600ms.

---

## Next Steps

1. **HIGH findings** — fix before go-live (deploy blockers).  
2. **MEDIUM findings** — fix within 2 weeks post-launch.  
3. **LOW findings** — backlog for Q4 2026.  
4. **Enable Speed Insights** — measure real-user CWV data in production.  
5. **Lighthouse CI** — add to PR checks (target score: 90+).

---

## Appendix: Verified Optimizations (No Action)

- ✅ All images use next/image with AVIF/WebP.  
- ✅ Fonts use `display: swap`.  
- ✅ `optimizeCss: true` enabled in next.config.js.  
- ✅ Security headers configured (CSP, HSTS, etc.).  
- ✅ Razorpay preconnect present.  
- ✅ No render-blocking scripts detected.

---

**End of Report**
