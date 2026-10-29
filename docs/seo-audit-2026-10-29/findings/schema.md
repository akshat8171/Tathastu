# Schema / Structured Data Audit — Tathastu Keepsakes

**Target:** https://www.tathastukeepsakes.in  
**Date:** 2026-10-29  
**Agent:** seo-schema  
**Rendering:** Next.js SSR/prerender — JSON-LD is present in **raw HTML** (not CSR-only). Compare confirmed via curl + `render_page.py --mode never`.

## Schema Score: 61/100

Solid foundation (Organization, WebSite, Product, Breadcrumb, FAQ, Store) in `lib/schema.ts`, but several Google rich-result validity gaps and page-coverage holes pull the score down.

### Detection matrix (live HTML, 2026-10-29)

| Page | JSON-LD types found | SSR? | Microdata/RDFa |
|------|---------------------|------|----------------|
| `/` | Organization, WebSite (+ SearchAction) | Yes | None |
| `/products` | Organization only | Yes | None |
| `/products/pooja-decor-dashboard-ganesha` | Organization, Product, BreadcrumbList | Yes | None |
| `/about` | Organization only | Yes | None |
| `/faqs` | Organization, FAQPage (20 Qs) | Yes | None |
| `/blog` | Organization only | Yes | None |
| `/blog/car-dashboard-god-idols-india` | Organization, BlogPosting, BreadcrumbList | Yes | None |
| `/contact` | Organization, Store | Yes | None |

**Repo sources:** `lib/schema.ts`, `app/layout.tsx`, `app/page.tsx`, `app/products/[id]/page.tsx`, `app/faqs/page.tsx`, `app/contact/page.tsx`, `app/blog/[slug]/page.tsx`, `app/rakhi/page.tsx`.

Blog HTML content in `lib/blog-data.ts` / `lib/blog-posts-trending.ts` also embeds **FAQPage Microdata** inside post bodies (separate from JSON-LD).

---

## Validation results

| Schema | Location | Status | Issues |
|--------|----------|--------|--------|
| Organization | Global layout | ⚠️ | Logo is **SVG**; PostalAddress missing `streetAddress`; otherwise name/url/sameAs OK |
| WebSite + SearchAction | Homepage | ⚠️ | Valid shape; `urlTemplate` points at `/shop?q=` (works 200) — ensure search UI matches |
| Product + Offer | PDP | ⚠️/❌ | Required name/image/offers present; **`aggregateRating.reviewCount: 0`** invalid for Google; always `InStock` |
| BreadcrumbList | PDP / blog post | ⚠️ | Valid ListItems; category crumb uses **query-string** URL |
| FAQPage | `/faqs` (+ blog microdata) | ℹ️ | Valid FAQPage JSON-LD; **no Google FAQ rich results** since 2026-05-07 |
| Store (LocalBusiness) | `/contact` only | ⚠️ | Missing `streetAddress` / full postal address; no `image`/`logo` |
| BlogPosting | Blog posts | ⚠️ | Relative `image` + `mainEntityOfPage.@id`; publisher missing `logo` |
| ItemList / CollectionPage | `/products`, `/blog` | ❌ | Missing |
| AboutPage / LocalBusiness | `/about` | ❌ | Missing opportunity |

---

## Critical Issues (fix immediately)

### C1. Product `AggregateRating` emitted with `reviewCount: 0`

**Evidence (PDP Ganesha JSON-LD):**

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 5,
  "reviewCount": 0,
  "bestRating": 5,
  "worstRating": 1
}
```

Also: visible title advertises star rating while count is zero. Google’s Product rich-result rules require a valid rating **with at least one review/rating** when AggregateRating is present; `reviewCount: 0` is a common Merchant/Rich Results rejection.

**Repo:** `lib/schema.ts` `getProductSchema()` always includes `aggregateRating`. `app/products/[id]/page.tsx` passes `product.rating` / `product.reviewCount` even when count is 0.

**Fix:**
```ts
// Only attach aggregateRating when reviewCount >= 1
...(product.reviewCount > 0 ? {
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
    bestRating: 5,
    worstRating: 1,
  },
} : {}),
```
Omit fake reviews. When real reviews exist, prefer `Review` entities that match on-page content.

---

## High Priority (fix within 1 week)

### H1. BlogPosting uses relative URLs (image / mainEntityOfPage)

**Evidence** (`/blog/car-dashboard-god-idols-india`):

```json
"image": "/images/blog/dashboard-idols.svg",
"mainEntityOfPage": {
  "@type": "WebPage",
  "@id": "/blog/car-dashboard-god-idols-india"
}
```

Google expects absolute URLs for `image` and stable absolute `@id`/`url`.

**Repo:** `app/blog/[slug]/page.tsx` inline `jsonLd` builder.

**Fix:** Prefix with `Config.appUrl` / `https://www.tathastukeepsakes.in`. Prefer raster cover images (JPG/PNG/WebP) for Article image guidelines; SVG covers are weak for Article rich results. Add `publisher.logo` ImageObject (PNG/JPG).

### H2. Organization logo is SVG

**Evidence:** `"logo": "https://www.tathastukeepsakes.in/images/logo/tathastu-keepsakes-logo.svg"`

Google Organization logo guidelines historically require **JPG/PNG/GIF** (not SVG) for Knowledge Graph / logo treatment.

**Repo:** `lib/schema.ts` `getOrganizationSchema()`.

**Fix:** Point `logo` at an existing PNG (e.g. `/images/logo/logo-og.png` or dedicated square logo ≥112×112).

### H3. Breadcrumb category item points at query-string URL

**Evidence (PDP):**

```
3 Pooja & Decor → https://www.tathastukeepsakes.in/products?category=pooja-decor
```

Built from `category?.route` in `app/products/[id]/page.tsx` + `lib/categories.ts`.

**Fix:** After clean category paths exist, use those absolute URLs in `getBreadcrumbSchema`. Until then, breadcrumb to `/products` only, or accept weak category nodes.

### H4. Catalog & blog index lack CollectionPage / ItemList

**Evidence:** `/products` and `/blog` only inherit Organization JSON-LD.

**Fix:** Add `CollectionPage` + `ItemList` (or `ItemList` alone) listing visible products/posts with absolute URLs — server-rendered in `app/products/page.tsx` / `app/blog/page.tsx`.

---

## Medium Priority (fix within 1 month)

### M1. LocalBusiness / Store incomplete for local rich results

**Evidence (`/contact` Store schema):** Address has locality/region/country only — **no `streetAddress` or `postalCode`**. Present: telephone, geo, openingHoursSpecification, priceRange.

**Repo:** `lib/schema.ts` `getLocalBusinessSchema()`.

**Fix:** Add real street address + postal code if publicly publishable; add `image`/`url`; consider `@type: ["Store","LocalBusiness"]`. Optionally mirror a thinner LocalBusiness on `/about` (currently Organization only).

### M2. Offer availability hard-coded `InStock`

**Repo:** `getProductSchema()` always sets `availability: 'https://schema.org/InStock'`.

**Fix:** Map from real inventory / made-to-order status (`PreOrder`, `InStock`, `OutOfStock`) so Merchant listings stay truthful.

### M3. FAQPage — keep for UX/AI, no Google SERP upside

**Evidence:** `/faqs` emits valid FAQPage with 20 Q&A pairs (SSR). Blog posts also embed FAQPage **microdata**.

**Policy (May 7, 2026):** FAQ rich results retired for all sites. Priority = **Info**, not Critical. Do not remove solely for SEO; do not add new FAQPage expecting SERP stars. For genuine user-submitted Q&A threads, prefer **QAPage**.

### M4. WebSite SearchAction target consistency

`urlTemplate`: `https://www.tathastukeepsakes.in/shop?q={search_term_string}` with `query-input: required name=search_term_string` — structurally valid. Confirm `/shop` search results page shows matching products for `q=` (200 OK observed). Align with primary storefront canonical strategy (`/shop` vs `/products`).

### M5. Organization / Store address shared gap

Both Organization and Store omit street-level address — weakens local entity clarity.

---

## Low Priority (backlog)

### L1. Duplicate Organization on every page

Expected with root layout injection; acceptable. Optionally switch to `@graph` with shared `@id` for entity consolidation.

### L2. Blog body FAQ microdata + page FAQPage JSON-LD

Multiple FAQ encodings are redundant post-retirement; tidy when touching blog templates.

### L3. Product `category` as plain text

Acceptable (`Text`). Could later use CategoryCode / absolute category URL once path hubs exist.

### L4. `priceValidUntil` generated as +1 year at request time

OK for Offer validity window; ensure rebuild/ISR refreshes it (Next prerender already refreshes periodically).

---

## SSR vs CSR

| Signal | Result |
|--------|--------|
| JSON-LD in raw curl HTML | Yes on all audited types above |
| Requires Playwright/JS to appear | No for primary schemas |
| Next prerender header | `x-nextjs-prerender: 1` on homepage |
| Risk | Low for discovery; keep Product Offer fields in SSR for Merchant freshness |

---

## Missing opportunities (recommended additions)

1. **`ItemList` on `/products` and category hubs** — product discovery rich results / clearer entity graph.  
2. **Self-canonical + WebPage** per key URL (pairs with technical C1).  
3. **Complete LocalBusiness** on contact (and optionally about).  
4. **BlogPosting absolute URLs + publisher.logo**.  
5. **Conditional AggregateRating / real Review markup** only when reviews exist.  
6. Do **not** recommend HowTo / SpecialAnnouncement / new FAQPage for SERP.

---

## Suggested JSON-LD patches (illustrative)

### Conditionally omit empty AggregateRating

See C1 fix in `lib/schema.ts`.

### BlogPosting absolute fields

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[title]",
  "image": "https://www.tathastukeepsakes.in/images/blog/[cover].jpg",
  "datePublished": "2026-10-21",
  "dateModified": "2026-10-21",
  "author": { "@type": "Organization", "name": "Tathastu Keepsakes" },
  "publisher": {
    "@type": "Organization",
    "name": "Tathastu Keepsakes",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.tathastukeepsakes.in/images/logo/logo-og.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.tathastukeepsakes.in/blog/[slug]"
  }
}
```

### Organization logo swap

```json
"logo": "https://www.tathastukeepsakes.in/images/logo/logo-og.png"
```

---

## Score rationale

| Factor | Impact |
|--------|--------|
| SSR JSON-LD present for core e-commerce types | + |
| Product Offer + Brand + absolute images | + |
| BreadcrumbList on PDP | + |
| AggregateRating with 0 reviews | −− |
| Relative BlogPosting URLs | − |
| SVG Organization logo | − |
| Incomplete LocalBusiness address | − |
| Missing collection ItemList | − |
| FAQPage no longer yields Google rich results | neutral (Info) |

**Final: 61/100**

---

## Cross-links

- Technical crawl/index/canonical issues: `findings/technical.md` (especially root canonical inheritance — schema cannot compensate if Google consolidates pages to `/`).
- Schema builders: `lib/schema.ts`
