# Content Quality & E-E-A-T Findings — Tathastu Keepsakes

**Audit date:** 2026-10-29 (reference day for review dates)  
**Site:** https://www.tathastukeepsakes.in  
**Lens:** Google helpful-content Who/How/Why + Sept 2025 QRG-style E-E-A-T (internal weights; Google publishes no numeric E-E-A-T scores).

## Scores

| Factor | Weight | Score |
|--------|-------:|------:|
| Experience | 20% | 68/100 |
| Expertise | 25% | 62/100 |
| Authoritativeness | 25% | 42/100 |
| Trustworthiness | 30% | 55/100 |
| **E-E-A-T composite** | | **56/100** |
| AI citation readiness | | **52/100** |
| **Content quality overall** | | **58/100** |

---

## Who / How / Why (site level)

| Question | Verdict |
|----------|---------|
| **Who** | Strong on `/about` (Akshat Garg, founder). Weak on blog (Organization / “Team” byline) and PDPs (no maker byline). |
| **How** | Partial — Agra workshop, PLA/FDM, made-to-order mentioned in llms/about; little process photography or print-parameter disclosure on PDPs. |
| **Why** | Mixed — gift/Diwali utility is clear; some pages feel catalog/SEO-expanded (thin custom page, stub FAQ schema). |

---

## Reviews authenticity

### Homepage “Verified” reviews (`lib/reviews.ts` → `ReviewsSection`)

Sample dates visible live: **12 Jun 2026**, 15 Jun 2026, 11 Jun 2026, 7 Jun 2026, 14 Jun 2026, etc.

**Date check vs audit day (29 Oct 2026):** these are **past** (~4 months earlier), **not future**. No “review from the future” anomaly on the sampled cards.

### Trust caveats (still material)

| Issue | Detail |
|-------|--------|
| Hardcoded sample UGC | Reviews live in static `lib/reviews.ts`, not order-linked verification |
| Uniform “Verified” | All featured cards show Verified without explaining verification method |
| Aggregate claims | Homepage shows **4.7** average, **4,200+** happy customers, **98%** on-time — not backed by visible methodology or schema |
| New Diwali SKUs | Dashboard idols ship `rating: 5`, `reviewCount: 0` while meta/UI imply 5★ |
| Product-level reviews | Dashboard PDPs have no detailed `getReviewsForProduct` UGC; rakhi shows stronger count (96) |

**Fix direction:** Label featured quotes as “Customer stories” without “Verified” unless tied to paid orders; or wire real review collection. Never emit AggregateRating for zero-review Diwali SKUs. Soften or source “4,200+” / “98%” claims.

---

## About page — author signals

**URL:** `/about` (~600+ words)

**Strengths:**
- Named founder: Akshat Garg
- First-hand path: 7 years investment banking/PE in Dubai → return to India → Agra workshop
- Mission/values, custom/bulk B2B angle
- Location entity: Agra, Uttar Pradesh

**Gaps:**
- No `Person` JSON-LD for the founder (`Organization` only)
- No credentials/links (`sameAs` LinkedIn/personal) on the person
- Limited original workshop photos/process narrative in the extractable body
- Contact telephone appears in site chrome; About could restate NAP for trust

**Fix:** Add founder `Person` schema + short bio block reused as blog author; 2–3 workshop photos with descriptive alts.

---

## Thin / weak pages

| Page | Words (approx) | Issue | Priority |
|------|---------------:|-------|----------|
| `/custom-3d-printing` | ~170 | **No H1** in main content (nav h3s only); below service-page floor; high commercial intent | High |
| `/contact` | ~260 | Adequate for contact purpose; keep NAP + hours | Low |
| Dashboard PDPs | ~530 visible but short unique desc (~170–220 chars) + generic “Reasons…” | Thin unique product copy | High (Diwali) |
| `/about` | ~600 | Meets coverage floor | OK |
| `/faqs` | ~1100 visible | Good body; **schema answers broken** | Critical for trust/AI |
| Blog post (dashboard idols) | ~675 | Below 1500 “blog floor” but topical for a commercial guide; prices current | Medium — deepen FAQs + care/heat |

Word counts are coverage floors, not ranking factors — flag thinness only where intent is unmet.

---

## Blog quality

| Signal | Observation |
|--------|-------------|
| Volume | 30+ posts in sitemap — good topical footprint for 3D gifts India |
| Diwali relevance | `personalised-diwali-gifts-3d-printed-india`, dashboard idols post (21 Oct 2026) |
| Freshness | Dashboard idols post matches promo |
| Structure | H2s, price guide, FAQ — citable |
| Author E-E-A-T | Organization author; no Person bio |
| Risk | Several posts look programmatic (festival/gift templates) — watch for repetitive structure / thin unique insight |

**Fix for cornerstone Diwali post:** Expand to include PLA heat warning, size comparison table, shipping cutoff for Diwali delivery, and byline “Akshat Garg, Founder”. Align any leftover ₹1199 references in **repo** blog sources (`lib/blog-posts-trending.ts` still contains ₹1,199 in source — live HTML showed ₹850; verify deploy consistency).

---

## Templated metadata

PDP titles/descriptions follow one mold:

`Buy {Name} | 3D Printed {Category} Online India | ₹{price} ({pct}% Off) | Tathastu Keepsakes`  
`Buy {Name} online — 3D-printed {Category} at ₹{price}…, 5★ rated. Custom-made with PAN-India delivery…`

**site_risk:** High templating ratio on product URLs; shared CTA phrase; **false star claim** on zero-review SKUs elevates severity beyond ordinary template smell.

---

## AI citation readiness

| Asset | Ready? |
|-------|--------|
| Self-contained definitions | Partial (llms quick answers; blog lead) |
| FAQ extractable answers | **No** in JSON-LD; yes in HTML accordion |
| Consistent prices | **No** (llms/products.json vs live) |
| Attributed stats | Weak |
| Clear hierarchy | Yes on most pages |

---

## Prioritized content fixes

| Priority | Fix | Concrete location |
|----------|-----|-------------------|
| P0 | Real FAQ schema text (no “Visit the page…”) | `app/faqs/page.tsx` |
| P0 | No 5★ claims / AggregateRating without reviews | schema + meta + PDP UI |
| P1 | Expand `/custom-3d-printing` with H1 + 800+ word process/use-cases | page component |
| P1 | Unique 300–400 word Diwali idol descriptions + specs | CMS / product copy |
| P1 | Sync blog source prices if any still say ₹1199 | `lib/blog-posts-*.ts` |
| P2 | Person author schema + byline | about + blog |
| P2 | Honest review labeling / real UGC pipeline | `lib/reviews.ts`, homepage |
| P3 | Soften unsourced “4200+ / 98%” or add methodology | `reviews-section.tsx` |

---

## Summary verdict

Experience and founder story are the brand’s real content moat. Trust is undercut by **zero-review 5-star schema**, **stub FAQ JSON-LD**, and **static “Verified” marketing reviews** (dates are historically fine as of Oct 2026, but verification is not order-proven). Fix those before scaling more programmatic blog posts for Diwali.
