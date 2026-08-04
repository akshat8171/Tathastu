# Catalog QA Report

**Date:** 2026-08-04  
**Verdict:** PASS (product catalog PDF)

## Deliverables
| Artifact | Status |
|---|---|
| `docs/catalog/exports/tathastu-product-catalogue.pdf` | PASS (~47 MB) |
| Product page PNGs | PASS — 66 / 66 |
| Cover + back cover | PASS |
| `03-catalog-entries.json` | PASS — 66 entries |
| Price integrity vs `lib/products.json` | PASS — **0 drifts** (no invented prices) |
| HTML preview | PASS — `exports/catalogue-preview.html` |

## Instagram fetch
| Check | Result |
|---|---|
| Meta Graph API tokens in `.env` | Missing |
| Public profile / oEmbed JSON | Login-wall HTML only |
| Curated reels available | 6 shortcodes + local thumbs in `public/images/reels/` |
| Full post/reel archive | **Blocked** until `IG_ACCESS_TOKEN` + `IG_USER_ID` |

Catalog pages use official product photography from `lib/products.json` (honest store prices). IG reels are mapped in `06-ig-product-map.json` for future editions when Graph API is connected.

## Layout
- LEFT: category, name, description, **store price**
- RIGHT: aesthetic product photograph on brand panel
- Theme: petrol teal `#1F717A`, violet `#4B2C78`, wash `#EAF8F9`

## Regen
```bash
python3 scripts/catalog/render-all-pages.py
python3 scripts/catalog/render-covers.py
python3 scripts/catalog/assemble-catalog-pdf.py
# or
python3 scripts/catalog/build-catalog.py
```
