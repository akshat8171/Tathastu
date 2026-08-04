# Agent report: 10-a11y-perf-seo

## Scope: A11y Perf SEO Mobile

Audit vs prior docs (`docs/superpowers/specs/2026-07-25-seo-a11y-audit.md`, `…-performance-audit.md`) + current code. Several prior findings are **fixed** (sitemap products, muted contrast `#4B5563`, WebSite/FAQ JSON-LD, robots.txt, search Escape, marquee `motion-reduce:animate-none`). Gaps below are still open or newly verified.

### Already strong (baseline)
- Root OG/Twitter/robots/canonical + Org JSON-LD; homepage WebSite SearchAction; contact LocalBusiness; FAQs FAQPage; PDP Product + Breadcrumb + Pinterest product metas
- `next.config.js`: AVIF/WebP; security headers (no CSP despite older perf doc claim)
- Hero dots `w-11 h-11` (44px); WhatsApp float `w-14 h-14`; InfiniteMarquee respects `motion-reduce`
- Announcement + TrustBand + footer: pan-India / free shipping / COD messaging present
- Speed Insights + Analytics wired

---

### SEO / meta / structured data

| ID | Gap | Evidence / impact |
|----|-----|-------------------|
| **AX-01** | **Broken OG/Twitter image** — metadata uses `/images/logo/logo-og.png`; disk only has `logo-og.svg` | Share cards 404 / blank; competitor-quality social previews fail |
| **AX-02** | JSON-LD `BASE_URL` falls back to `http://localhost:3000` if `NEXT_PUBLIC_APP_URL` unset | Contaminates rich results / absolute URLs in schema |
| **AX-03** | Product schema hardcodes `InStock` — no `isSoldOut` → `OutOfStock` | Misleading Offer availability |
| **AX-04** | `/shop` redirect has **no metadata** export | Crawl/redirect edge: empty title/desc |
| **AX-05** | Sitemap categories use `/products?category=…` query URLs, not clean `/shop/[category]` | Weaker indexation vs path-based competitor URLs |
| **AX-06** | **Rotating hero `<h1>`** changes every 5.5s with slide copy | Unstable primary keyword H1; a11y unpredictability |
| **AX-07** | `availableLanguage: ['en','hi']` but `html lang="en"` only — no `hreflang` / Hindi pages | Locale claim without delivery |
| **AX-08** | Manifest missing recommended **192×192** (`favicon-192x192.png` exists unused) | PWA / install icon gap |
| **AX-09** | No Twitter `site`/`creator` handles | Incomplete large-card attribution |
| **AX-10** | Manual `<meta name="viewport">` duplicates Next metadata viewport | Redundant; risk of conflicting viewport policy |
| **AX-11** | Blog covers still raw `<img>` (index + slug) — no next/image, no AVIF/WebP, weak `sizes` | SEO CWV + LCP on content pages |
| **AX-12** | Default OG is logo-only, not lifestyle/product hero | Competitor share cards usually show product photography |

---

### Accessibility

| ID | Gap | Evidence / impact |
|----|-----|-------------------|
| **AX-13** | **No skip-to-content link** | Keyboard users tab through announcement + full header every page |
| **AX-14** | Mobile menu: **no focus trap**, no Escape, no `inert`/scroll lock on body | Focus escapes to page behind open menu |
| **AX-15** | Search overlay: Escape + scroll lock OK; **no focus trap** / return-focus pattern | Dialog incomplete vs WCAG modal guidance |
| **AX-16** | Hero carousel **auto-advance ignores `prefers-reduced-motion`** (JS timer always runs) | CSS marquee pauses; slide H1/content still auto-cycles |
| **AX-17** | Carousel lacks `aria-live` / announced slide changes; `aria-roledescription` without previous/next controls | SR users don’t hear theme changes |
| **AX-18** | Header icon buttons `p-2` + `w-5`/`w-6` ≈ **36–40px** (search/account/wishlist/cart/hamburger) | Below 44×44 WCAG AAA / Apple HIG |
| **AX-19** | Footer social icons `w-8 h-8` (32px); cart qty `w-8 h-8`; color swatches `w-8 h-8`; wishlist remove `w-8 h-8` | Sub-44 touch targets on mobile |
| **AX-20** | Catalog mobile filter chips `py-1.5` — height often **&lt;44px** | Hard to tap vs competitor filter drawers |
| **AX-21** | Announcement bar uses emoji (🇮🇳) as content | Ambiguous for some AT; decorative noise |
| **AX-22** | Sticky header + fixed WA float with **no `safe-area-inset`** | iPhone notch/home-indicator overlap risk |
| **AX-23** | Checkout saved-address radios rely on outer `<label>` only — no explicit `aria-label` on input | Works for many AT but fragile if markup splits |
| **AX-24** | Marquee duplicates product links (clone is `aria-hidden` — good) but continuous motion still hard for vestibular / keyboard focus into moving targets | Competitor often static grids or pause-first |
| **AX-25** | Quantity stepper: `aria-live` exists on PDP; boundary `aria-disabled` still weak (prior audit) | Min/max feedback incomplete |

---

### Performance / images / CLS

| ID | Gap | Evidence / impact |
|----|-----|-------------------|
| **AX-26** | **8 font files** (Poppins 5 + Inter 3 weights) | Extra FCP/FOUT vs 3–4 weight competitor budgets |
| **AX-27** | Hero LCP: only **first MiniCard** `priority`; slide remount (`key={slide.eyebrow}`) reloads marquee | LCP regression on slide 2/3; layout thrash |
| **AX-28** | **CLS risk — marquees**: InfiniteMarquee + Instagram rail; slide swap remounts track; hover `scale-105` on images | Motion without reserved static LCP plane |
| **AX-29** | Homepage **heavy client islands** (HeroCarousel, BestSellers, CategoryRails, ProductCard) | Hydration cost / INP vs SSR product shells |
| **AX-30** | PDP gallery `sizes="… 50vw"` still coarse (perf audit MED) | Over-fetch desktop LCP image |
| **AX-31** | No custom `deviceSizes` / `imageSizes` in `next.config.js` | Default breakpoints may miss mobile DPR sweet spots |
| **AX-32** | Blog `<img>` bypasses image optimizer (see AX-11) | No lazy priority control, no modern formats |
| **AX-33** | Product-card secondary hover image not preloaded | Perceived jank (not CWV, UX) |
| **AX-34** | `experimental.optimizeCss: true` — useful but fragile across Next versions | Ops/perf risk if build regresses |
| **AX-35** | No Lighthouse CI in repo despite go-live charter targets (90+/CWV) | Regression detection gap vs competitor ops |

---

### Mobile responsiveness / nav parity

| ID | Gap | Evidence / impact |
|----|-----|-------------------|
| **AX-36** | Brand wordmark **`hidden lg:inline`** — mobile header is mark-only | Weak brand signal vs full-name competitor headers |
| **AX-37** | Wishlist icon **`hidden sm:flex`** — absent on smallest viewports (only inside hamburger) | Extra tap; parity miss vs always-visible heart |
| **AX-38** | Announcement utility links (phone / Track / WhatsApp) **`hidden md:flex`** | Mobile loses header chrome competitors keep in sticky bar or drawer top |
| **AX-39** | Mobile nav = **inline accordion under header**, not full-screen drawer/sheet | No overlay, no trap, weaker competitor pattern (mega-menu / full-bleed sheet) |
| **AX-40** | Catalog: desktop facet sidebar; mobile = **horizontal chips only** — no filter sheet for price/customizable parity | Incomplete filter UX vs Shopify competitor drawers |
| **AX-41** | ScrollRail arrows `hidden md:flex` — mobile relies on swipe only (OK) but no peek indicator / progress | Discoverability weaker |
| **AX-42** | Hero CTA stack 3 buttons (Shop / Customise / WhatsApp) on narrow screens | First-viewport CTA crowding vs lean competitor heroes |

---

### Geo / shipping messaging consistency

| ID | Gap | Evidence / impact |
|----|-----|-------------------|
| **AX-43** | Messaging is present but **inconsistent numbers**: TrustBand “Dispatched in **2–4** days”; shipping policy highlight “**2–6** business days”; photo-upload “**3–5**”; FAQs metro “**3–5** after dispatch” | Trust erosion; competitor usually one SLA |
| **AX-44** | Free shipping threshold **₹199** (`FREE_SHIPPING_THRESHOLD`) shown in bar/trust/cart — good — but COD fee / PIN eligibility only deep in FAQs/checkout | Mobile first-fold rarely surfaces COD (competitors often do) |
| **AX-45** | “Every PIN code” / pan-India vs COD “not for orders &gt; ₹5,000 or some PINs” (FAQs) | Overclaim risk if not mirrored near CTAs |
| **AX-46** | Agra / made-to-order strong in meta & policies; **hero H1 is seasonal theme copy**, not geo value prop | SEO geo keywords not reinforced in visible H1 |
| **AX-47** | LocalBusiness schema on contact only — no geo in homepage trust band as structured data | Missed local pack assist |

---

### Heading hierarchy (spot)

| ID | Gap |
|----|-----|
| **AX-48** | Homepage: single rotating H1 (OK count) but content unstable (AX-06); sections use H2 via `SectionHeading` — good |
| **AX-49** | PDP: Reasons + Reviews use `SectionHeading` H2 — improved vs older audit; verify `ProductInfo` H1 is sole H1 (gallery region has no competing H1) |
| **AX-50** | Photo-upload section uses **H3 before H2** in DOM order (`photo-upload-section.tsx`) | Hierarchy skip |

---

### Priority cut (vs competitor quality bar)

1. **P0:** AX-01 (OG PNG), AX-06/AX-16 (H1 + reduced-motion carousel), AX-14/AX-18 (mobile menu + touch targets), AX-43 (shipping SLA sync)  
2. **P1:** AX-02–03, AX-11/32, AX-27–29, AX-36–40, AX-13  
3. **P2:** AX-05, AX-07–10, AX-08, AX-35, AX-47  

**Fixed since July audits (do not re-open):** product sitemap entries, muted contrast, WebSite + FAQ schemas rendered, `public/robots.txt`, search Escape, InfiniteMarquee `motion-reduce:animate-none`.
