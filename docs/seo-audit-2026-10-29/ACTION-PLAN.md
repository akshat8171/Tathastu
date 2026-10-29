# SEO Action Plan — Tathastu Keepsakes (2026-10-29)

Diwali window: ship P0 this week; measure GSC after deploy.

## Phase 1 — Critical (this deploy) ✅ DONE IN CODE

- [x] Remove homepage canonical from root layout  
- [x] Add self-canonicals on key routes  
- [x] Omit Product AggregateRating when reviewCount is 0  
- [x] Stop “5★ rated” meta on zero-review PDPs  
- [x] FAQ JSON-LD uses real answer text  
- [x] Sync `llms.txt` Diwali sale prices + links  
- [x] AI crawler robots groups + private-path disallows  
- [x] Organization logo PNG  

**Verify after Vercel deploy:**

```bash
curl -sL https://www.tathastukeepsakes.in/products | rg -o 'rel="canonical"[^>]+|href="[^"]+" rel="canonical"'
curl -sL https://www.tathastukeepsakes.in/products/pooja-decor-dashboard-ganesha | rg -o 'AggregateRating|reviewCount'
curl -sL https://www.tathastukeepsakes.in/faqs | rg -o 'Visit the page for full details' || echo "OK: no stubs"
curl -sL https://www.tathastukeepsakes.in/llms.txt | head -40
curl -sL https://www.tathastukeepsakes.in/robots.txt | head -40
```

Falsifiable: Search Console URL Inspection on `/products`, `/about`, `/faqs` shows matching canonical (not `/`).

## Phase 2 — High (this week)

1. **Sitemap category URLs** — emit `/shop/{slug}` (or existing path hubs) instead of `/products?category=` in `app/sitemap.ts`  
2. **IndexNow** — add key under `public/` + notify Bing on catalog/blog publish  
3. **Collect real reviews** for dashboard idols before re-enabling AggregateRating  
4. **PSI / CrUX** — run with own API key; fix LCP if mobile LCP > 2.5s  

## Phase 3 — Content & authority (2–4 weeks)

1. Expand `/custom-3d-printing` (process, materials, turnaround, gallery, FAQ)  
2. Author/E-E-A-T on About + blog bylines  
3. Absolute BlogPosting image URLs  
4. Internal links from Diwali blog → each idol PDP  

## Phase 4 — Monitor

1. `/seo drift baseline https://www.tathastukeepsakes.in` after deploy  
2. Weekly GSC: impressions for “car dashboard idol”, “3D printing India”, brand  
3. Re-run `/seo ecommerce` on top 10 PDPs post-Diwali  

## How to re-run Claude SEO in Cursor

```bash
# Runtime (already set up)
"/Users/akshat.garg/Documents/GitHub new/claude-seo/scripts/claude-seo" doctor --json

# Scripts
"/Users/akshat.garg/Documents/GitHub new/claude-seo/scripts/claude-seo" run fetch_page.py https://www.tathastukeepsakes.in --json
"/Users/akshat.garg/Documents/GitHub new/claude-seo/scripts/claude-seo" run parse_html.py https://www.tathastukeepsakes.in/products/pooja-decor-dashboard-ganesha

# Skills/agents are symlinked at:
#   .cursor/claude-seo/{skills,agents,scripts}
#   ~/.claude/skills/seo-*  and  ~/.claude/agents/seo-*.md
```

Prompt pattern: `/seo audit https://www.tathastukeepsakes.in` or `/seo ecommerce https://www.tathastukeepsakes.in`.
