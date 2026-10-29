# Agentic Browsing Readiness — Tathastu Keepsakes

**Audit date:** 2026-10-29  
**Site:** https://www.tathastukeepsakes.in  
**Tools:** `agentic_check.py`, `agent_ux_check.py` (claude-seo); PSI Lighthouse Agentic category **unavailable** (HTTP 429 quota).  
**Standards dates:** vendor-matrix checked **2026-09-23** (WebMCP / Content-Signal / ARD = draft or proposal — absence is opportunity, not a ranking defect).

## Summary

| Signal | Result |
|--------|--------|
| Lighthouse Agentic Browsing | **Not measured** (PSI 429 — configure Google API key / `/seo google setup`) |
| Agent-UX heuristic (PDP Ganesha) | **100/100** (`score_status: complete`) |
| P0 failures measured | **0** (SSR pass, robots reachable, real 404) |
| P1 failures | **llms.txt** fails Lighthouse rules (no Markdown links) |
| What limits agents most today | Stale/unlinked `llms.txt` + no Markdown negotiation; commerce flows rely on normal a11y (which scores well) |

One-liner: The store is **SSR-friendly and accessibility-tree clean** for browse/act agents; discovery files and price facts for text-only assistants need a short cleanup before Diwali.

---

## Lighthouse Agentic Browsing

```
PSI mobile: error — Quota exceeded (pagespeedonline.googleapis.com)
Desktop: not run (same quota)
Fraction: unavailable (do not invent X/N)
```

**Next step:** Rerun  
`claude-seo run lighthouse_agentic.py https://www.tathastukeepsakes.in --strategy both --json`  
with a project API key. Report as `X/N` with Lighthouse version — never as a percentage.

Paths that typically add counted audits (options, not goals): agent-accessibility-tree, cumulative-layout-shift, webmcp-registered-tools, llms-txt, ard-schema — see `seo-agentic/references/lighthouse-agentic-category.md`.

---

## Agent-UX heuristic (PDP)

**URL:** `/products/pooja-decor-dashboard-ganesha`

| Metric | Value |
|--------|------:|
| Score | 100 |
| Tree present | yes |
| Interactive nodes | 103 |
| Unnamed interactive | **0** |
| Inputs without label/aria | **0** |
| div onclick widgets | 0 |
| Semantic landmarks | 10 |
| Real buttons / anchors | 38 / 66 |

Homepage/cart/checkout not separately scored this pass; PDP hero flow looks agent-operable.

---

## Findings by priority

### P0 — Access / SSR / robots

| Check | Status | Evidence |
|-------|--------|----------|
| Primary content without JS | **Pass** | Home: ~2453 words without JS; not an empty SPA shell |
| robots.txt reachable | **Pass** | 200, 1 group (`*`) |
| Unknown URLs return 404 | **Pass** | Probe URL returned 404 (not catch-all 200) |
| Accessibility names on PDP | **Pass** | Agent-UX unnamed_interactive = 0 |
| CLS ≤ 0.1 | **Not tested** (needs Lighthouse) | |
| WAF / CAPTCHA on content | **Not tested** (no `--ua-matrix`; would need owner authorization) | |

**robots.txt today:** Allow all under `*`; Disallow `/admin/`, `/api/`. No named AI groups — status **info**, not fail. Every AI agent falls through to `*`.

### P1 — Discovery & policy

| Check | Status | Fix |
|-------|--------|-----|
| `llms.txt` Lighthouse rules | **Fail** | Add Markdown links to products/blog; optional `>` summary; sync prices to ₹850/₹1150 |
| Content-Signal | **Info** (absent) | Optional: `Content-Signal: search=yes, ai-input=yes, ai-train=no` per group (preference only; Google does not act on it) |
| Markdown delivery | **Info** | Optional: `.md` sibling or `Accept: text/markdown` + `Vary: Accept` |
| User-triggered agents vs robots | **Pass** | No root blocks for ChatGPT-User / Claude-User / etc. |
| Real 404 | **Pass** | Supports Lighthouse llms/ard probes |

### P2 / P3 — Optional enhancements

| Check | Status | Note |
|-------|--------|------|
| WebMCP tools | Info (0 `registerTool` sites; 1 form unannotated) | Opportunity for search/cart — draft standard; WebKit opposes |
| `document.modelContext` | N/A | No WebMCP |
| `/.well-known/ai-catalog.json` | N/A (404) | Only if listing MCP/A2A resources |
| API Catalog / OAuth well-known | N/A | Not an API product surface |
| A2A agent card / UCP | N/A | No commerce-agent protocol published |

Do **not** prioritize WebMCP while P1 `llms.txt` fails and Lighthouse fraction is unmeasured.

---

## Access policy (separate lines)

| Purpose | Policy observed | Notes |
|---------|-----------------|-------|
| **Training** crawlers (GPTBot, ClaudeBot, Google-Extended, …) | Allowed via `*` | Decide deliberately if you want `ai-train=no` signal later |
| **Search** crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot) | Allowed via `*` | Good for AI search visibility |
| **User-triggered** agents (ChatGPT-User, Claude-User, Google-Agent, …) | Not blocked at robots root | Some vendors ignore robots for user fetches — protect private paths with auth, not robots alone |

---

## Key flows — agent accessibility (manual + Agent-UX)

| Flow | Assessment |
|------|------------|
| Discover Diwali idols (home hero “Bless the drive.”) | SSR text + links present; H1 is campaign-led |
| Open PDP (dashboard Ganesha) | Schema + H1 + Add to cart controls named in a11y tree |
| Customizable product (rakhi name) | SSR product page; personalization fields not deep-tested this pass |
| FAQs / policies | Crawlable HTML; JSON-LD answers stubby (hurts text agents that prefer LD) |
| Custom 3D printing CTA | Page thin / missing H1 — agents get weak task framing |

---

## `llms.txt` (agent discovery)

Present and useful in intent (Agra, PLA heat note, SKU table, quick answers) but:

1. **Fails** Lighthouse: no Markdown links  
2. **Prices wrong** vs live sale (see ecommerce/geo findings)  
3. No blockquote summary  
4. No `llms-full.txt`

**Concrete patch shape:**
```markdown
# Tathastu Keepsakes

> 3D-printed gifts and car dashboard God idols from Agra, India. Diwali sale: most dashboard idols ₹850.

- [Lord Ganesha Car Dashboard Idol](https://www.tathastukeepsakes.in/products/pooja-decor-dashboard-ganesha): ₹850
- [Car dashboard idols guide](https://www.tathastukeepsakes.in/blog/car-dashboard-god-idols-india)
```
(Keep the heat note and size table; drive prices from CMS.)

---

## Standards status (label drafts)

| Item | Status (as of 2026-09-23 matrix) |
|------|----------------------------------|
| WebMCP | W3C CG **draft**; not a standard |
| Content-Signal | Cloudflare policy + expired IETF draft; preference only |
| ai-catalog / ARD | Spec checked by Lighthouse; optional |
| Web Bot Auth | IETF draft |
| llms.txt | Community convention; Google Search ignores |

Absence of WebMCP / ai-catalog / Markdown ≠ defect. Fix measured P1 `llms.txt` first.

---

## Recommendations (confirm by re-running named checks)

| Priority | Action | Confirm with |
|----------|--------|--------------|
| P0 | Keep SSR product/content (already good) | `agentic_check.py` → `server-rendered` |
| P0 | After API key: measure Lighthouse `X/N` + CLS | `lighthouse_agentic.py` |
| P1 | Fix `public/llms.txt` links + sale prices | `agentic_check.py` → `llms-txt` |
| P1 | Optional Content-Signal + named AI groups | robots.txt review |
| P2 | Consider Markdown alternate for FAQ/shipping | `markdown-delivery` |
| P2 | WebMCP for add-to-cart only if investing in ChatGPT desktop tools | Lighthouse `webmcp-registered-tools` |
| P3 | ai-catalog only if exposing agent resources | `ard-catalog` |

---

## JSON-shaped findings (for audit-data.json)

```json
{
  "category": "AI Search Readiness",
  "findings": [
    {
      "title": "llms.txt fails Lighthouse (no Markdown links) and lists stale Diwali prices",
      "severity": "high",
      "description": "llms.txt returns 200 but agentic_check marks lighthouse fail; table prices (e.g. Ganesha 1199) disagree with live ₹850 sale.",
      "recommendation": "Add Markdown product links, sync prices from getCatalogProducts(), add optional blockquote summary."
    },
    {
      "title": "Lighthouse Agentic fraction not measured (PSI 429)",
      "severity": "medium",
      "description": "Anonymous PSI quota exceeded; CLS and WebMCP audits unknown.",
      "recommendation": "Configure Google API key and rerun lighthouse_agentic.py --strategy both."
    },
    {
      "title": "SSR and Agent-UX on hero PDP are strong",
      "severity": "info",
      "description": "server-rendered pass; Agent-UX 100/100 with 0 unnamed interactive nodes on Ganesha PDP.",
      "recommendation": "Preserve SSR for catalog pages; spot-check checkout a11y next."
    }
  ]
}
```
