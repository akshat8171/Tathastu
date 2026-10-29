# Technical SEO Audit — Tathastu Keepsakes

**Target:** https://www.tathastukeepsakes.in  
**Date:** 2026-10-29  
**Agent:** seo-technical  
**Stack signals:** Next.js (SSR/SSG on Vercel), `x-nextjs-prerender: 1`, `server: Vercel`

## Technical Score: 58/100

Score reflects measured categories only. Core Web Vitals field/lab scores were **not measured** (PageSpeed Insights API rate-limited during this run).

### Category Breakdown

| Category | Status | Score | Notes |
|----------|--------|------:|-------|
| Crawlability | warn | 78/100 | robots + sitemap OK; no AI crawler policy; weak category URLs in sitemap |
| Indexability | fail | 32/100 | Root layout forces homepage canonical on most key URLs |
| Security | warn | 80/100 | Strong HSTS/frame/MIME headers; **no CSP** |
| URL Structure | warn | 68/100 | Clean PDP paths; category discovery via `?category=` |
| Mobile | warn | 82/100 | Responsive + viewport present; **duplicate viewport** meta |
| Core Web Vitals | not measured* | — | PSI rate-limited; source signals suggest LCP risk on homepage |
| Structured Data | warn | 70/100 | Present in SSR HTML; validation deferred to schema agent |
| JS Rendering | pass | 92/100 | Next.js prerender; ~2453 words without JS |
| IndexNow | fail | 15/100 | No key file / endpoint detected |

\*CWV deducted from overall via homepage weight heuristics only (not as a scored category).

---

## Critical Issues (fix immediately)

### C1. Root layout hard-codes homepage canonical — index collision across key pages

**Evidence:** Live HTML canonicals (2026-10-29):

| URL | `<link rel="canonical">` |
|-----|--------------------------|
| `/` | `https://www.tathastukeepsakes.in` (correct) |
| `/products` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/products?category=pooja-decor` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/about` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/faqs` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/blog` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/contact` | `https://www.tathastukeepsakes.in` (**wrong**) |
| `/products/pooja-decor-dashboard-ganesha` | self-canonical (OK) |
| `/blog/car-dashboard-god-idols-india` | self-canonical (OK) |

**Root cause in repo:** `app/layout.tsx` sets:

```ts
alternates: {
  canonical: 'https://www.tathastukeepsakes.in',
},
```

Child routes that do **not** override `alternates.canonical` inherit the homepage URL. PDPs and blog posts already override (`app/products/[id]/page.tsx`, `app/blog/[slug]/page.tsx`); listing/static pages do not (`app/products/page.tsx`, `app/about/page.tsx`, `app/faqs/page.tsx`, `app/blog/page.tsx`, `app/contact/page.tsx`).

**Impact:** Google may treat shop, about, FAQs, blog index, and contact as duplicates of the homepage and drop them from the index or suppress unique titles/snippets.

**Fix:**
1. Remove the absolute homepage canonical from root `app/layout.tsx` (keep `metadataBase` only).
2. Add self-referencing `alternates: { canonical: '/…' }` on every indexable page (or a shared helper).
3. For filtered catalog URLs, either (a) canonical to clean `/products` / future `/shop/[category]`, or (b) `noindex` parameter URLs — do not leave them pointing at `/`.

---

## High Priority (fix within 1 week)

### H1. Sitemap includes weak query-string category URLs

**Evidence:** Live sitemap (`/sitemap.xml`, 166 URLs) includes 8 entries like:

- `https://www.tathastukeepsakes.in/products?category=home-decor`
- `…?category=pooja-decor` … `rakhi`

Generated in `app/sitemap.ts` via `getProductCategories()` → `` `${BASE_URL}/products?category=${category.slug}` ``. Category routes in `lib/categories.ts` are also defined as `route: '/products?category=…'` (except `/rakhi`, `/customize`).

**Why it matters:** Query-parameter “category pages” share one document template, inherit the homepage canonical today, and are weaker ranking/landing URLs than path-based hubs.

**Fix:** Introduce path-based category URLs (e.g. `/shop/[slug]` or `/products/[category]`), update `lib/categories.ts` `route`, rewrite sitemap entries, 301 old `?category=` URLs, and set self-canonicals. Product coverage itself is good: **108 PDP URLs** are listed.

### H2. No IndexNow implementation

**Evidence:**
- `GET /indexnow-key.txt` → 404
- `GET /.well-known/indexnow` → 404
- `GET /api/indexnow` → 404
- No IndexNow references in homepage HTML

**Fix:** Publish a key file at site root (or `.well-known`), and ping IndexNow on product/blog publish/update (Vercel serverless or build hook). Speeds Bing/Yandex/Naver discovery; Google ignores IndexNow.

### H3. Homepage HTML payload is very large (~926 KB)

**Evidence:** Homepage raw HTML ≈ **926,316 bytes**, ~126 `<img>`, ~48 `<script>`, Next.js flight data present (`self.__next_f`). Still under Googlebot’s ~2 MB HTML cap, but LCP/INP risk is high for mobile.

**Repo touchpoints:** `app/page.tsx`, catalog/homepage defaults, image-heavy sections.

**Fix:** Reduce above-the-fold image count; lazy-load below-fold product grids; avoid shipping full catalog markup in the initial document; prefer smaller hero assets; verify with PSI after rate-limit clears.

### H4. Duplicate viewport meta tags

**Evidence:** Two viewport tags on every audited page:

1. Manual in `app/layout.tsx`: `width=device-width, initial-scale=1, maximum-scale=5`
2. Next.js default metadata viewport: `width=device-width, initial-scale=1`

**Fix:** Remove the manual `<meta name="viewport">` from `app/layout.tsx` and configure viewport via the Next.js Metadata / Viewport API only (`export const viewport = {…}`).

---

## Medium Priority (fix within 1 month)

### M1. robots.txt has no explicit AI crawler policy

**Evidence:** Live `public/robots.txt` / `https://www.tathastukeepsakes.in/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://www.tathastukeepsakes.in/sitemap.xml
```

No named groups for `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Bytespider`, `Applebot-Extended`, `CCBot`.

**Agentic check:** `robots-ai-groups` = info — every AI agent falls through to `*`.

**Note:** Site already publishes `llms.txt` (200) with product facts — training/search allowance is currently implicit allow-all.

**Fix:** Decide policy deliberately. Example patterns:
- Allow search citability (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`) while blocking training-only bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Bytespider`, `CCBot`) — or allow all if GEO visibility is desired.
- Document the choice in `public/robots.txt` comments.

### M2. Content-Security-Policy header missing

**Evidence:** Response headers include HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`, COOP — but **no `Content-Security-Policy`**. Configured in `next.config.js` `headers()`.

**Fix:** Add a staged CSP (Report-Only first) covering Razorpay, GA/AdSense, Vercel Analytics, image CDNs.

### M3. HTTP → HTTPS and apex → www redirects are good (308)

**Evidence:**
- `http://tathastukeepsakes.in/` → 308 → `https://tathastukeepsakes.in/` → 308 → `https://www.tathastukeepsakes.in/`
- Two hops to final www HTTPS. Prefer collapsing to a single 301/308 to final host when possible (Medium, not Critical).

### M4. `/shop` vs `/products` dual storefront surfaces

**Evidence:** Sitemap lists both `/products` and `/shop` at priority 0.9; WebSite `SearchAction` targets `/shop?q={search_term_string}` (200 OK). Without careful canonicals, this splits equity.

**Fix:** Pick one primary collection URL; canonical the other; align SearchAction `urlTemplate` to the primary search results URL that returns matching product listings.

---

## Low Priority (backlog)

### L1. llms.txt present but fails stricter Lighthouse/agent rules

`GET /llms.txt` → 200 with useful product tables. Agentic check reported `llms-txt` fail against community/Lighthouse shape rules (Google Search ignores llms.txt). Improve structure later; not a ranking issue.

### L2. Security header set is otherwise strong

HSTS `max-age=63072000; includeSubDomains; preload` is preload-ready. Confirm actual HSTS preload list submission separately if desired.

### L3. Trailing slash policy consistent

`next.config.js` `trailingSlash: false`; sitemap URLs have no trailing slashes (except root host without path slash variance issues). Good.

---

## Category detail notes

### Crawlability — pass/warn
- robots.txt reachable, allows public content, blocks `/admin/` and `/api/`.
- Sitemap declared and valid urlset (166 URLs: 108 products, 36 blog posts, 8 category query URLs, static pages).
- No accidental sitewide `noindex` (`index, follow` on audited pages).
- Googlebot fetch budget: homepage ~0.9 MB HTML — monitor growth.

### Indexability — fail
- Dominated by C1 canonical inheritance.
- Parameter category pages indexable + wrong canonical → worst combination.

### Security — warn
- HTTPS enforced; no mixed-content audit of every asset in this pass.
- Stack: Next.js/Vercel (not PHP CVE class).
- Missing CSP only major gap among standard SEO-adjacent headers.

### Mobile — warn
- Viewport present; responsive classes in HTML; mobile-first indexing compatible.
- Duplicate viewport is the main HTML defect found.

### Core Web Vitals — not measured
- PSI/CrUX call returned rate-limit error during audit.
- **Inferred risks:** oversized homepage HTML, many images/scripts → LCP/INP pressure. Re-run `pagespeed_check.py` / CrUX when quota available. Do **not** treat this as a lab score.

### JS Rendering — pass
- `agentic_check` / raw fetch: ~2453 words without JS; `is_spa: false`; `x-nextjs-prerender: 1`.
- Critical SEO tags (title, robots, JSON-LD) appear in initial HTML for audited routes — **SSR/SSG, not CSR-only**.
- Prefer keeping Product JSON-LD in server HTML (already done on PDPs).

### IndexNow — fail
- See H2.

### Structured Data (detection only)
- Homepage: Organization + WebSite JSON-LD in SSR HTML.
- PDP: Product + BreadcrumbList + Organization.
- FAQs: FAQPage.
- Contact: Store (LocalBusiness subtype).
- Full validation → `findings/schema.md`.

---

## Recommendations checklist (implementation order)

1. **Remove root homepage canonical; add per-page self-canonicals** (`app/layout.tsx` + page metadata).
2. **Path-based category URLs** + sitemap rewrite (`app/sitemap.ts`, `lib/categories.ts`).
3. **IndexNow** key + ping on catalog/content publish.
4. **Trim homepage HTML** / image weight.
5. **Dedupe viewport**; add CSP Report-Only; explicit AI robots groups.

---

## Evidence artifacts (this audit)

- `docs/seo-audit-2026-10-29/robots.txt`
- `docs/seo-audit-2026-10-29/sitemap-live.xml` / `sitemap-discovery.json`
- `docs/seo-audit-2026-10-29/homepage-headers.txt`
- `docs/seo-audit-2026-10-29/pages/*.html` (fetched 2026-10-29)
- `docs/seo-audit-2026-10-29/pages/home-agentic.json`
- `docs/seo-audit-2026-10-29/pages/home-psi.json` (rate-limited)
