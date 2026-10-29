# E-commerce SEO Findings — Tathastu Keepsakes

**Audit date:** 2026-10-29  
**Site:** https://www.tathastukeepsakes.in  
**Data source:** On-page analysis (static SSR HTML + `/api/catalog` + Google Merchant feed). DataForSEO Merchant not used.  
**Hero promo context:** Diwali / car dashboard God idols (New Arrival).

## Scores

| Category | Score | Weight |
|----------|------:|-------:|
| Schema completeness | 52/100 | 25% |
| Title & meta | 48/100 | 15% |
| Image optimization | 78/100 | 20% |
| Content quality | 58/100 | 20% |
| Internal linking | 82/100 | 10% |
| Technical (PDP) | 80/100 | 10% |
| **Overall** | **62/100** | |

---

## PDPs sampled

| URL | Live sale | Schema price | H1 | reviewCount (schema) |
|-----|----------:|-------------:|----|---------------------:|
| `/products/pooja-decor-dashboard-ganesha` | ₹850 | 850 | Lord Ganesha Car Dashboard Idol | **0** |
| `/products/pooja-decor-dashboard-shiva` | ₹850 | 850 | Lord Shiva Car Dashboard Idol | **0** |
| `/products/pooja-decor-dashboard-laxmi-ganesh` | ₹1150 | 1150 | Laxmi Ganesh Pair Idol | **0** |
| `/products/rakhi-personalised-name` (customizable) | ₹259 | 259 | Personalised Name Rakhi… | 96 |

Live CMS prices (`/api/catalog`) for the Diwali set: single idols **₹850**, Nandi + Laxmi pair **₹1150**. Merchant feed matches (`g:sale_price` 850.00 / 1150.00 INR).

---

## Critical / High findings

### 1. Critical — `aggregateRating` with `reviewCount: 0` and `ratingValue: 5`

**Evidence (Ganesha JSON-LD):**
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 5,
  "reviewCount": 0,
  "bestRating": 5,
  "worstRating": 1
}
```
Same pattern on Shiva and Laxmi Ganesh. Meta description also claims “5★ rated” with zero reviews.

Google Merchant / Product rich results reject or suppress invalid aggregate ratings. Emitting a perfect 5.0 with zero reviews is a trust and eligibility risk for the Diwali hero SKUs.

**Code fix — `lib/schema.ts` `getProductSchema`:**
```ts
// Only include aggregateRating when there is at least one review
...(product.reviewCount > 0
  ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }
  : {}),
```

Also gate the on-page “5.0 / Loved by N+ customers” UI and meta “5★ rated” when `reviewCount === 0` (`app/products/[id]/page.tsx`, product meta builders).

**Expected impact:** Restores Product rich-result eligibility; removes false-star risk before Diwali traffic peaks.

---

### 2. Critical — `llms.txt` / static catalog price drift vs live sale prices

| SKU | `public/llms.txt` (+ `lib/products.json`) | Live CMS / PDP / Merchant |
|-----|------------------------------------------:|--------------------------:|
| dashboard-shiva | 799 | **850** |
| dashboard-ganesha | 1199 | **850** |
| dashboard-baby-shiva | 1399 | **850** |
| dashboard-hanuman | 1499 | **850** |
| dashboard-shiva-nandi | 2899 | **1150** |
| dashboard-laxmi-ganesh | 2149 | **1150** |
| (all other single idols) | 999–1499 | **850** |

Assistants reading `llms.txt` will quote **wrong Diwali prices** (and still say “lowest is Shiva at ₹799”). Homepage, PDPs, blog post, and Merchant feed are aligned on the sale; only static LLM/catalog snapshot files lag.

**Fix:**
1. Update `public/llms.txt` table to sale prices (₹850 / ₹1150) and rewrite the “lowest priced” quick answer.
2. Prefer generating `llms.txt` (or a `/llms.txt` route) from `getCatalogProducts()` so CMS sale edits cannot drift.
3. Sync `lib/products.json` seed prices or document that CMS is source of truth for live price.

**Expected impact:** Correct AI/assistant citations during Diwali; fewer support disputes.

---

### 3. High — Title / meta too long and templated; star claim dishonest on new SKUs

**Ganesha title (117 chars):**  
`Buy Lord Ganesha Car Dashboard Idol | 3D Printed Pooja & Decor Online India | ₹850 (71% Off) | Tathastu Keepsakes`

**Meta (~169 chars):** restates title + “5★ rated” + stock CTA.

SERP truncation ~60 / ~155. Pattern is identical across dashboard PDPs (templated metadata risk).

**Fix (content + generator):**
- Title pattern: `Lord Ganesha Car Dashboard Idol | ₹850 | Tathastu` (~50 chars)
- Meta: unique benefit + price + CTA; **omit star rating** until `reviewCount > 0`
- Keep brand suffix short; drop redundant “Online India | 3D Printed Pooja & Decor” on every PDP

---

### 4. High — Product descriptions unique but thin for complex / gift SKUs

| Product | Schema description length | Notes |
|---------|--------------------------:|-------|
| Ganesha | 184 chars | Unique deity angle; no PLA heat caveat, size table, or care |
| Shiva | 214 chars | Best of the set |
| Laxmi pair | 172 chars | Diwali mention good; still short |
| Name Rakhi | 227 chars | Customization clear; only **1 image** in schema |

Body below H1 is mostly generic “Reasons to make it yours” (Handcrafted / Unique / Eco / Returns) — same across products — then related grid. No specs table (size mm, weight, base type, material grade).

**Fix:** Expand PDP body to 300–400+ words with: material + heat note (PLA ~55–60°C — already in llms.txt), size options, gift-box, dispatch 2–4 days, Diwali use-case. Add a specs `<table>` or definition list. For rakhi, add ≥3 images (hero, detail, lifestyle).

---

## Medium / Low findings

### 5. Medium — Breadcrumbs & related products: strong

JSON-LD `BreadcrumbList`: Home → Shop → Pooja & Decor → Product. Visible related “You may also like”. Keep as-is.

### 6. Medium — Images mostly good

Dashboard PDPs: 8 images, descriptive alts (`… — view 1`, thumbnails). Empty `alt=""` only on small logo/UI icons (acceptable if decorative). Filenames are descriptive (`01-hero.png`). Prefer WebP/AVIF via Next image pipeline (already).

### 7. Medium — Customizable PDP (rakhi) schema healthier

Has `sku`, `brand`, `offers` (price/currency/availability/url), `aggregateRating` with **reviewCount: 96**. Title still oversized (146 chars). Image count = 1 — weakest image signal of the sample.

### 8. Low — Organization on PDP omits telephone

Homepage Organization schema includes `+91 91548 92790`; PDP Organization block is thinner (no telephone). Prefer one shared `getOrganizationSchema()` everywhere.

---

## Product schema checklist (dashboard Ganesha)

| Field | Status |
|-------|--------|
| name | Pass |
| image (≥1, absolute) | Pass (8) |
| offers.price / priceCurrency | Pass (850 INR) |
| offers.availability | Pass InStock |
| brand | Pass |
| sku | Pass |
| description | Pass (thin) |
| aggregateRating | **Fail** (reviewCount 0 + ratingValue 5) |
| review[] | Missing (OK if no UGC yet — then omit aggregate too) |
| BreadcrumbList | Pass |

---

## Prioritized action list (Diwali)

| Priority | Action | Owner file(s) |
|----------|--------|----------------|
| P0 | Omit `aggregateRating` when `reviewCount === 0`; stop “5★” in meta/UI | `lib/schema.ts`, PDP meta, `page.tsx` |
| P0 | Sync `llms.txt` (+ seed JSON) to ₹850/₹1150 sale | `public/llms.txt`, catalog pipeline |
| P1 | Shorten titles; unique metas without false stars | product metadata helpers |
| P1 | Enrich dashboard PDP copy + specs + heat note | product descriptions / CMS |
| P2 | More images on customizable rakhi | catalog images |
| P2 | Single Organization schema helper with phone | `lib/schema.ts` |

---

## Notes

- Internal linking and SSR Product JSON-LD are strengths — do not gut schema; **fix** the rating branch.
- Merchant feed already reflects sale prices; Shopping ads are ahead of `llms.txt`.
- Collect real verified reviews for dashboard idols ASAP; then re-enable aggregateRating with honest counts.
