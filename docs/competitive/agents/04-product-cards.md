# Agent report: 04-product-cards

## Scope: Product Cards & Rails

Tathastu’s homepage rails (`BestSellers` + `CategoryRails` → `ProductRail` → `ScrollRail` + `ProductCard`) largely mirror [3dprintshop.in](https://3dprintshop.in/) structure (Best Sellers copy, per-category rails, Sale/% OFF, “From ₹…”, “Add to cart”). Gaps are mostly **card chrome**, **ATC affordance**, **touch wishlist**, and **loading/empty consistency**.

---

### Current architecture (evidence)

| Piece | Path | Role |
|---|---|---|
| Canonical card | `/Users/akshat.garg/Documents/GitHub new/Tathastu/components/ui/product-card.tsx` | Image, badges, heart, rating, price, full-width ATC |
| Legacy re-export | `components/products/product-card.tsx` | Re-exports UI card only |
| Rail wrapper | `components/homepage/product-rail.tsx` | `carousel` (default) or `grid` |
| Best sellers | `components/homepage/best-sellers.tsx` | Hardcoded IDs → `ProductRail` |
| Category rails | `components/homepage/category-rails.tsx` | 5 category rails × 10 products |
| Scroll + arrows | `components/ui/scroll-rail.tsx` | Snap rail, md+ arrows, 85% peek scroll |
| Hero mini cards | `components/homepage/hero-carousel.tsx` (`MiniCard`) | Marquee tiles with **bottom price bar** |
| Catalog grid | `app/products/catalog-client.tsx` | 2–4 col grid + empty + load more |
| Skeletons | `components/ui/skeleton.tsx`, `app/products/loading.tsx` | Catalog loading only |
| Tokens | `tailwind.config.js`, `app/globals.css` | `rounded-card2` 16px, `sale` red, `discount` green |

---

### Gaps PC-01…

**PC-01 — Card radius dual tokens**  
**Severity:** Low  
**Competitor:** Uniform rounded product tiles.  
**Ours:** `.card` uses `rounded-card2` (16px); `.image-panel` uses `rounded-card` (12px) but the card image area does **not** use `.image-panel` — it’s a square block inside an overflow-hidden 16px card.  
**Evidence:** `app/globals.css` L82–86, L124–126; `tailwind.config.js` L59–62; `product-card.tsx` L155–159.  
**Rec:** Single radius token for catalog + rail cards.

**PC-02 — Image aspect inconsistency (square vs 4:5)**  
**Severity:** High  
**Competitor:** Hero/listing tiles read taller (portrait-ish); homepage scrape shows image-forward cards.  
**Ours:** Catalog/`ProductCard` = `aspect-square`; hero `MiniCard` = `aspect-[4/5]`. Rails inherit square.  
**Evidence:** `product-card.tsx` L159; `hero-carousel.tsx` L98.  
**Rec:** Align rail + catalog aspect to one ratio (likely 4:5 to match hero/competitor).

**PC-03 — Sale badge vs Customizable conflict (top-left)**  
**Severity:** Medium  
**Competitor:** Sale + % OFF shown together on discounted tiles (hero scrape: “Sale43% OFF₹199.00”).  
**Ours:** Customizable **replaces** Sale on top-left; Sale only when `!isCustomizable`.  
**Evidence:** `product-card.tsx` L174–186.  
**Rec:** Stack or pair Sale + Customizable; don’t hide Sale.

**PC-04 — Sale / % OFF position & color**  
**Severity:** Low (mostly aligned)  
**Competitor:** Sale + % OFF on image; price often overlaid on hero tiles.  
**Ours:** Sale top-left (`badge-sale` / `#E63946`); `% OFF` top-right (`badge-discount` / `#16A34A`). Matches intended system.  
**Evidence:** `product-card.tsx` L181–207; `globals.css` L61–68; `tailwind.config.js` L48–49.  
**Rec:** Keep colors; resolve PC-03 stacking.

**PC-05 — Price presentation: bottom bar only on hero MiniCard**  
**Severity:** High  
**Competitor:** Hero tiles use bottom price chrome (Sale/% OFF + ₹ on image). Listing cards put price under title with compare-at.  
**Ours:** `MiniCard` has orange→red bottom bar (“like competitor site”); `ProductCard` puts price in body via `Price` / “From ₹…” — **no** image bottom bar or price pill on rails/catalog.  
**Evidence:** `hero-carousel.tsx` L116–124; `product-card.tsx` L254–261; `components/ui/price.tsx`.  
**Rec:** Decide one system: bottom bar for compact tiles only, or add a subtle price pill on hover for rails; stop diverging MiniCard vs ProductCard.

**PC-06 — Currency / decimal formatting drift**  
**Severity:** Low  
**Competitor:** `₹199.00` style.  
**Ours:** `Price` → `Intl` `₹2,299` (0 decimals); “From” path and MiniCard use raw `₹{price}` without `.00` / locale grouping consistency.  
**Evidence:** `price.tsx` L7–14; `product-card.tsx` L256–257; `hero-carousel.tsx` L119–121.  
**Rec:** One formatter everywhere.

**PC-07 — No floating cart icon button on card image**  
**Severity:** Medium  
**Competitor / e-com bar:** Quick-add often = circular cart icon on image (hover). Competitor rails still expose text “Add to cart”.  
**Ours:** Full-width text CTA only (`btn-primary-full` + `rounded-lg` override). No icon ATC overlay.  
**Evidence:** `product-card.tsx` L287–311; `globals.css` L27–37.  
**Rec:** Icon quick-add on image (simple SKUs) + keep text CTA or swap to icon-only on dense rails.

**PC-08 — ATC button shape vs design system**  
**Severity:** Low  
**Ours:** `btn-primary` is `rounded-pill`; card forces `rounded-lg`.  
**Evidence:** `globals.css` L27–30; `product-card.tsx` L291.  
**Rec:** Match pill or document card exception.

**PC-09 — Wishlist heart: hover-only (broken on touch)**  
**Severity:** High  
**Competitor-class:** Heart always visible or always on mobile.  
**Ours:** `opacity-0 group-hover:opacity-100` — invisible until hover; touch users rarely see it. When % OFF present, heart shifts to `top-9`.  
**Evidence:** `product-card.tsx` L209–238.  
**Rec:** Always-visible heart on mobile; keep hover fade on desktop only.

**PC-10 — Wishlist vs % OFF collision**  
**Severity:** Medium  
**Evidence:** Heart uses `top-9` when discount badge present (`product-card.tsx` L211). Crowded top-right on narrow rail cards (`w-40`).  
**Rec:** Heart bottom-right of image or left of discount.

**PC-11 — Rating stars always on card**  
**Severity:** Low  
**Competitor homepage scrape:** Titles + prices + ATC; stars not evident in text extract.  
**Ours:** Always renders `<Rating>` (`product-card.tsx` L252; `rating.tsx`). Adds height on dense rails.  
**Rec:** Optional `showRating` for rails; keep on catalog/PDP.

**PC-12 — Title truncation**  
**Severity:** Low (aligned)  
**Ours:** `line-clamp-2` on title. Competitor titles are long H3s; clamp is fine.  
**Evidence:** `product-card.tsx` L244–248.  
**Rec:** Keep; ensure rail fixed widths don’t orphan one word oddly.

**PC-13 — Rails = arrows + snap, not marquee**  
**Severity:** Medium (intentional fork)  
**Competitor:** Continuous feel on hero product strip; Best Sellers / category sections behave as carousels.  
**Ours:** Product rails = `ScrollRail` (manual + arrows). Marquee only on hero `MiniCard`s + Instagram.  
**Evidence:** `product-rail.tsx` L48–64; `scroll-rail.tsx`; `hero-carousel.tsx` L218–230; `infinite-marquee.tsx`.  
**Rec:** Keep arrows for Best Sellers/category (better a11y); don’t marquee catalog rails.

**PC-14 — Peek cards incomplete on mobile**  
**Severity:** Medium  
**Ours:** Fixed item widths `w-40 sm:w-48 lg:w-56`; track bleed `-mx-5 px-5` on mobile; scroll step `clientWidth * 0.85`. Peek depends on viewport math, not an explicit “show N.3 cards”.  
**Evidence:** `product-rail.tsx` L55–58; `scroll-rail.tsx` L51–52, L78–79.  
**Rec:** Use `%` / `calc` widths so ~2.3 / 3.3 cards always peek.

**PC-15 — Rail arrows desktop-only + hover-gated**  
**Severity:** Medium  
**Ours:** `hidden md:flex`; visible only on `group-hover/rail`. Mobile = swipe only; desktop discoverability weak.  
**Evidence:** `scroll-rail.tsx` L58–66, L85–93.  
**Rec:** Always-visible faint arrows when `canNext`/`canPrev`; optional mobile chevrons.

**PC-16 — Empty ProductRail has no empty state**  
**Severity:** Medium  
**Ours:** If `products=[]`, still renders heading + empty track (no message). Catalog empty is handled separately.  
**Evidence:** `product-rail.tsx` (no empty guard); `catalog-client.tsx` L85–97.  
**Rec:** Hide section or show compact empty when filter yields 0.

**PC-17 — Homepage rails have no loading skeletons**  
**Severity:** Low  
**Ours:** Best sellers / category rails hydrate from static JSON client-side; no `ProductCardSkeleton` in homepage path. Catalog has `ProductGridSkeleton` via `app/products/loading.tsx`.  
**Evidence:** `best-sellers.tsx`, `category-rails.tsx`, `skeleton.tsx`, `app/products/loading.tsx`.  
**Rec:** Acceptable for static JSON; add Suspense shells if data becomes async.

**PC-18 — ProductCardSkeleton ≠ real card layout**  
**Severity:** Medium  
**Ours:** Skeleton: image + title + price + button. Missing rating row, badge placeholders, heart. Grid skeleton starts at `grid-cols-1` while live catalog is `grid-cols-2`+.  
**Evidence:** `skeleton.tsx` L18–51; `catalog-client.tsx` L100; `products/page.tsx` L235.  
**Rec:** Mirror real card + match grid breakpoints.

**PC-19 — Dead `badge` prop**  
**Severity:** Low  
**Ours:** `badge?: string | null` on `ProductCardData` is destructured but never rendered (label driven by `labelType` / discount / customizable).  
**Evidence:** `product-card.tsx` L53, L82.  
**Rec:** Wire or remove.

**PC-20 — MiniCard always shows “Sale”**  
**Severity:** Medium  
**Ours:** Hero `MiniCard` always paints Sale even when `discountPct === null`.  
**Evidence:** `hero-carousel.tsx` L107–110.  
**Rec:** Gate Sale on real discount (match `ProductCard`).

**PC-21 — Best Sellers curation vs competitor density**  
**Severity:** Low  
**Competitor:** Long Best Sellers strip (many keychains).  
**Ours:** 10 hardcoded IDs; “View all → `/products`”. Copy matches competitor subtitle almost verbatim.  
**Evidence:** `best-sellers.tsx` L8–34; competitor homepage Best Sellers section.  
**Rec:** Ensure IDs stay top-rated; consider “Customized Items” rail (competitor) vs our “Gaming & Fun”.

**PC-22 — Category rail set mismatch**  
**Severity:** Medium  
**Competitor:** Keyrings, Pooja & Decor, Customized Items (+ more).  
**Ours:** Keyrings, Pooja, Gaming, Lamps, Planters — no dedicated “Customized Items” rail (custom flow is `PhotoUploadSection` / `IdeaCta`).  
**Evidence:** `category-rails.tsx` L17–50; competitor scrape.  
**Rec:** Add Customized/customizable product rail for parity.

**PC-23 — Color swatches / “Available in”**  
**Severity:** Low  
**Competitor:** Customized cards show “Available in:” + swatches.  
**Ours:** Swatches on card when `colors` present (`product-card.tsx` L263–285) — good — but label is “Colors:” not “Available in:”.  
**Rec:** Match copy if chasing parity.

**PC-24 — Catalog listing UX extras**  
**Severity:** Low–Medium  
**Ours:** Sort, load-more (24), filter empty state — solid. No quick-view modal, no per-card compare, wishlist page uses a **different** card layout (not `ProductCard`). Search results are list rows, not cards.  
**Evidence:** `catalog-client.tsx`; `app/wishlist/page.tsx` L112+; `search-overlay.tsx` L163+.  
**Rec:** Reuse `ProductCard` on wishlist for visual consistency.

---

### Parity checklist (what already matches)

- Best Sellers title/subtitle + View all pattern (`best-sellers.tsx` ≈ competitor).
- Per-category horizontal product sections (`category-rails.tsx`).
- Sale (red) + % OFF (green) badge vocabulary (`globals.css` / tokens).
- “From ₹…” for options/variants (`product-card.tsx` L254–258).
- Text “Add to cart” / “Choose options” / “Customize” CTAs on cards.
- Hover secondary image swap (`product-card.tsx` L97–99).
- Catalog empty + load more (`catalog-client.tsx`).

---

### Priority cut

| Priority | IDs |
|---|---|
| P0 | PC-02, PC-05, PC-09 |
| P1 | PC-03, PC-07, PC-10, PC-14, PC-15, PC-18, PC-20, PC-22 |
| P2 | PC-01, PC-06, PC-08, PC-11, PC-16, PC-19, PC-21, PC-23, PC-24 |

**GOAT Reminder**: Build boring systems that work when things break. Stop following sheep toward the cliff. 🐐
