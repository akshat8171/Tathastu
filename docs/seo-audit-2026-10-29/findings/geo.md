# GEO / AI Search Findings — Tathastu Keepsakes

**Audit date:** 2026-10-29  
**Site:** https://www.tathastukeepsakes.in  
**Framing:** SEO fundamentals applied to AI-search surfaces (Google AI Overviews / AI Mode, ChatGPT Search, Perplexity, Bing Copilot). Google does **not** use `llms.txt` for ranking; it remains useful for other assistants.

## GEO Health Score

| Dimension | Weight | Score | Notes |
|-----------|-------:|------:|-------|
| Citability | 25% | 48/100 | FAQ schema stubs; price facts conflict across surfaces |
| Structural readability | 20% | 72/100 | Clear H1→H2; some Q-style FAQ/blog headings |
| Multi-modal content | 15% | 70/100 | Strong product photography; limited diagrams/video |
| Authority & brand signals | 20% | 58/100 | Agra + founder story; weak Wikipedia/YouTube/Reddit footprint |
| Technical accessibility | 20% | 82/100 | SSR-rich HTML; robots allow all; real 404s |
| **GEO Readiness** | | **64/100** | |

### Platform-oriented view (heuristic)

| Surface | Score | Limiter |
|---------|------:|---------|
| Google AI Overviews / AI Mode | 68 | Follows classic SEO; FAQ schema quality + entity clarity |
| ChatGPT Search | 55 | Relies on crawlable facts; `llms.txt` prices wrong; FAQ stubs |
| Perplexity | 60 | Needs citable passages + consistent prices |
| Bing Copilot | 62 | Same as crawlable SSR + brand entity |

---

## AI crawler access (`robots.txt`)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://www.tathastukeepsakes.in/sitemap.xml
```

| Crawler | Governs | Status |
|---------|---------|--------|
| Googlebot | Search + AI Overviews inclusion | Allowed via `*` |
| OAI-SearchBot | ChatGPT **Search** | Allowed via `*` (no named group) |
| Claude-SearchBot | Claude **search** | Allowed via `*` |
| PerplexityBot | Perplexity search | Allowed via `*` |
| GPTBot | OpenAI **training** (not ChatGPT Search) | Allowed via `*` |
| ClaudeBot | Anthropic **training** | Allowed via `*` |
| Google-Extended | Gemini/Vertex training (+ gen-AI model training) | Allowed via `*` |
| Applebot-Extended | Apple Intelligence training | Allowed via `*` |

**Finding:** No deliberate named groups or `Content-Signal` lines. Access is open (good for visibility). Optional: add named groups if training vs search policy should differ. Do **not** cite GPTBot/ClaudeBot allow as proof of ChatGPT/Claude *search* optimization — use OAI-SearchBot / Claude-SearchBot.

---

## `llms.txt` status

| Check | Result |
|-------|--------|
| Present at `/llms.txt` | Yes (200, `text/plain`, ~2.1 KB) |
| Lighthouse / agentic_check | **Fail** — “contains no Markdown links” |
| Recommended `>` summary blockquote | Missing |
| `/llms-full.txt` | 404 |
| Fact quality | Useful heat note + Agra + dispatch; **prices stale** |

**Price mismatch (assistants will misquote Diwali sale):**

| Fact in llms.txt | Live site / Merchant |
|------------------|----------------------|
| Ganesha ₹1199 | **₹850** |
| Shiva ₹799 (called “lowest”) | **₹850** (and no longer lowest uniquely) |
| Laxmi pair ₹2149 | **₹1150** |
| Nandi ₹2899 | **₹1150** |

Quick answers also encode the wrong “lowest price” claim.

**Concrete fix (`public/llms.txt`):**
1. Sync price table to CMS sale (₹850 singles / ₹1150 pair & Nandi).
2. Add Markdown links, e.g. `[Lord Ganesha Car Dashboard Idol](https://www.tathastukeepsakes.in/products/pooja-decor-dashboard-ganesha)`.
3. Add opening blockquote summary per llmstxt.org.
4. Generate from `getCatalogProducts()` on deploy to prevent drift.
5. Optional: publish `/llms-full.txt` with full FAQ + shipping excerpts.

---

## Citability of FAQ / blog

### `/faqs` — high-impact defect

Visible accordion answers are solid (ordering, Razorpay, shipping, etc.).  
**FAQPage JSON-LD answers are stubs:** every `acceptedAnswer.text` = `"Visit the page for full details."`

**Root cause — `app/faqs/page.tsx` ~346:**
```ts
answer: typeof item.answer === 'string' ? item.answer : 'Visit the page for full details.',
```
Most answers are React nodes (`<p>…</p>`), so schema never gets real text. AI systems and rich results that read JSON-LD get non-answers.

**Fix:** Extract plain text (e.g. maintain parallel `answerText` strings, or `react-to-text` strip) and pass full answers into `getFAQSchema()`.

### Blog — better citability

- Index: 36+ posts; Diwali-relevant posts present (`personalised-diwali-gifts-…`, `car-dashboard-god-idols-india`).
- Hero post `/blog/car-dashboard-god-idols-india`: dated 2026-10-21, prices aligned to **₹850**, FAQ section, product links, ~675 words visible.
- Author in schema is **Organization** (“Tathastu Keepsakes”), byline “Tathastu Keepsakes Team” — weaker Who-signal than named founder (Akshat Garg on About).
- Microdata FAQ blocks exist in several posts (good for extractors that read HTML).

**Citability wins to add:**
- Lead each commercial blog section with a 40–60 word direct answer (“A car dashboard God idol is…”).
- Attribute stats (dispatch days, free shipping threshold) consistently with homepage.
- Prefer `Person` author + `sameAs` for cornerstone posts.

---

## Brand entity clarity

| Signal | Present? |
|--------|----------|
| Organization JSON-LD (name, logo, address Agra UP IN, phone, email, sameAs IG/FB/WA) | Yes |
| Locality “Agra” in About + contact | Yes |
| Founder narrative (Akshat Garg) | Yes on `/about` |
| Wikipedia entity | Not observed |
| YouTube / Reddit brand presence | Not audited live beyond site; likely thin |
| Consistent NAP | Phone + email consistent in contact/footer |

Entity is clear as **“Tathastu Keepsakes — 3D printed gifts / pooja decor, Agra, India”**. Strengthen with Google Business Profile consistency, YouTube unboxing/print-process videos (highest third-party correlation with AI citations per Ahrefs studies — treat as brand building, not a Google-mandated GEO trick).

---

## Markdown / agent readiness (GEO-adjacent)

| Capability | Status |
|------------|--------|
| SSR primary content | Pass (~2450 words without JS on home) |
| `Accept: text/markdown` / `.md` sibling | Not offered (info) |
| `ai-catalog.json` | 404 (optional) |
| Sitemap | 166 URLs including products + blog |

---

## Top 5 highest-impact GEO changes

| # | Change | Effort | Why |
|---|--------|--------|-----|
| 1 | Fix FAQPage answers to real text | S | Unblocks FAQ rich results + AI citation of policies |
| 2 | Sync + linkify `llms.txt` to sale prices | S | Stops wrong Diwali price citations |
| 3 | Omit invalid Product aggregateRating (0 reviews) | S | Cleaner product facts for AI + Google |
| 4 | Named Person author + process on dashboard blog | M | Who/How/Why for AI Overview selection |
| 5 | Optional robots named groups + Content-Signal | S | Clarifies training vs search policy |

---

## What not to over-index

- Google rejects “chunk for AI” / mention-farming as ranking tactics — keep optimizing for helpful, crawlable pages.
- `llms.txt` is not a Google ranking lever; still fix it for ChatGPT/Perplexity-class assistants and Lighthouse agentic checks.
