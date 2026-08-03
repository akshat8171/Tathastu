# Agent report: 03-categories

## Scope: Categories

Parity already strong on **heading copy**, **centered title + subtitle**, **1:1 tiles**, **labels below image**, **top-left Starting-at**, and **hover image scale**. Main deltas: **desktop grid vs always-scroll rail**, **teal vs white badges**, **taxonomy (6 vs 8)**, and **Customized priced tile vs Customise CTA**.

---

### C-01 — Desktop layout: 6-col grid vs always-scroll rail
| | |
|---|---|
| **Severity** | High |
| **Competitor** | `flex` + snap on mobile; `sm:grid sm:grid-cols-3`; `lg:grid-cols-6` with `sm:overflow-visible` — all 6 tiles visible, no arrows |
| **Ours** | Always `ScrollRail` horizontal track; fixed `w-32 sm:w-40` tiles; desktop still scrolls |
| **Evidence** | Competitor HTML: `sm:grid … lg:grid-cols-6`; ours: `components/homepage/category-icons.tsx` + `components/ui/scroll-rail.tsx`; screenshots show 6 large tiles vs many small peeks |
| **Recommendation** | Match responsive pattern: mobile rail (peek), `sm:grid-cols-3`, `lg:grid-cols-6` (or 4×2 if keeping 8). Keep `ScrollRail` only below `sm`. |

### C-02 — Tile size / density
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Fluid width (`w-[42%]` mobile peek; full grid cell on desktop) — larger, shoppable tiles |
| **Ours** | Fixed `w-32` / `sm:w-40` (~128–160px) — denser, “icon-like” |
| **Evidence** | `category-icons.tsx` L42; competitor `w-[42%] … sm:w-auto`; screenshots |
| **Recommendation** | Drop fixed widths on `sm+`; use full grid cell. Mobile: ~40–42% width for 2+peek. |

### C-03 — Starting-at badge color (teal primary vs white glass)
| | |
|---|---|
| **Severity** | High |
| **Competitor** | `bg-primary` teal pill, white text (`text-primary-foreground`), `text-[11px]`, `px-2.5 py-1` |
| **Ours** | `bg-white/90 backdrop-blur` + `text-ink` + `text-[10px]` + `px-2 py-0.5` |
| **Evidence** | Competitor HTML `rounded-full bg-primary … text-primary-foreground`; `category-icons.tsx` L55–59; screenshots (teal vs white) |
| **Recommendation** | Use `bg-brand text-white` (or `.badge` teal). Keep top-left. Bump to ~11px / `px-2.5 py-1`. |

### C-04 — Category count & taxonomy
| | |
|---|---|
| **Severity** | High |
| **Competitor** | **6**: Pooja & Decor, Home Decor, Keyrings / Bag Tags, Workspace, Gaming, Customized |
| **Ours** | **8**: Pooja, Keyrings, Gaming, Lamps, Desk & Workspace, Planters, Rakhi, Customise Now — no dedicated Home Decor |
| **Evidence** | Competitor section hrefs/prices; `lib/categories.ts`; unused `public/images/3dps/categories/home-decor.png` |
| **Recommendation** | Add Home Decor tile (asset already exists) *or* clearly map lamps+planters as Home Decor. Cap homepage rail at 6–7 primary tiles; seasonal Rakhi can stay first or pin in nav. |

### C-05 — CTA / Custom tile treatment
| | |
|---|---|
| **Severity** | Medium–High |
| **Competitor** | **Customized** is a normal priced category (`Starting at ₹159` → `/customized`). Lab is nav/hero (`3DPrintShop Lab NEW`), not a violet category pill |
| **Ours** | `isCta` **Customise Now** with violet `Custom` pill → `/customize`; no starting price |
| **Evidence** | Competitor tile list; `lib/categories.ts` L91–100; `category-icons.tsx` L62–67 |
| **Recommendation** | Either (A) priced Customized-style tile like competitor, or (B) keep CTA but brand with teal + clearer “Upload / Lab” label — avoid violet-only “Custom” looking like a sale/new badge. |

### C-06 — Labels: weight / size / gap
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Below tile; `text-sm font-medium leading-snug`; `gap-3` image→label; hover → primary |
| **Ours** | Below tile; `text-xs sm:text-sm font-display font-semibold`; `mt-2.5`; hover → `text-brand` |
| **Evidence** | Competitor HTML; `category-icons.tsx` L70–73 |
| **Recommendation** | Use `text-sm font-medium` + `gap-3` on desktop for parity; keep display font only if brand requires it. |

### C-07 — Tile chrome: border + shadow strength
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `rounded-2xl border border-border bg-muted shadow-sm` → hover `shadow-md` |
| **Ours** | `rounded-card2` (16px), `bg-panel`, `shadow-card` → hover `shadow-card-hover` — **no border** |
| **Evidence** | Competitor HTML; `category-icons.tsx` L46; `tailwind.config.js` card2/shadows |
| **Recommendation** | Add light `border border-gray-100` (or token border); start at `shadow-card` / `shadow-sm` so hover lift is visible. |

### C-08 — Hover motion timing
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Image `scale-105` `duration-300`; shadow `transition-shadow` |
| **Ours** | Image `scale-105` `duration-500`; shadow `duration-300` |
| **Evidence** | Competitor HTML; `category-icons.tsx` L46–52 |
| **Recommendation** | Align image transform to `duration-300` for snappier parity. |

### C-09 — Scroll affordances / arrows
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Desktop grid → no arrows; mobile native snap scroll only |
| **Ours** | Floating prev/next on `md+`, opacity 0 until rail hover (`scroll-rail.tsx`) |
| **Evidence** | `components/ui/scroll-rail.tsx` L58–98; competitor `lg:grid-cols-6` |
| **Recommendation** | If adopting desktop grid, arrows unnecessary. If keeping rail, show arrows more persistently or add fade/peek edge. |

### C-10 — Mobile peek width
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `w-[42%]` → ~2 tiles + clear next-peek |
| **Ours** | Fixed `w-32` (~3+ tiny tiles) |
| **Evidence** | Competitor HTML; `category-icons.tsx` L42 |
| **Recommendation** | Use `w-[42%]` or `min-w-[42%]` on mobile for stronger peek UX. |

### C-11 — Section vertical spacing / surface
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | `section.container py-12 md:py-16`; heading `mb-6 … gap-1.5` |
| **Ours** | `py-14 sm:py-20 bg-surface`; `SectionHeading` `mb-6` + rail wrapper `mt-8` (extra gap) |
| **Evidence** | Competitor HTML pre-heading; `category-icons.tsx` L21–29; `section-heading.tsx` L21 |
| **Recommendation** | Tighten to `py-12 md:py-16`; drop redundant `mt-8` or reduce `SectionHeading` mb when used here. |

### C-12 — Section order vs promo
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Hero → **FIRST20 promo** → Shop by Category → Best Sellers |
| **Ours** | Hero → **Shop by Category** → Promo → Best Sellers |
| **Evidence** | `app/page.tsx` L33–42; competitor DOM order; screenshots |
| **Recommendation** | Move `CategoryIcons` below `PromoStrip` for conversion funnel parity (optional brand choice). |

### C-13 — Clean category URLs
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `/pooja-decor`, `/homedecor`, `/keyrings`, `/workspace`, `/gaming`, `/customized` |
| **Ours** | Mostly `/products?category=<slug>`; exceptions `/rakhi`, `/customize` |
| **Evidence** | `lib/categories.ts` routes; competitor hrefs |
| **Recommendation** | Prefer `/shop/<slug>` (already sketched in contract) for category tiles. |

### C-14 — Image treatment consistency
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Uniform lifestyle squares from admin CDN (matched set) |
| **Ours** | Mix: `3dps/categories/*` for some; `categories/lamps.jpg`, `planter.jpg` for others; `home-decor.png` unused |
| **Evidence** | `lib/categories.ts` image paths; `public/images/3dps/categories/` |
| **Recommendation** | One visual family for all tiles; wire `home-decor.png` if adding Home Decor; re-shoot lamps/planters to match 3dps lifestyle set. |

### C-15 — Gap between tiles
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | `gap-4` (16px) |
| **Ours** | `gap-3 sm:gap-4` |
| **Evidence** | Competitor HTML; `category-icons.tsx` L30 |
| **Recommendation** | Use `gap-4` consistently. |

### C-16 — Subtitle typography
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | `text-sm … sm:text-base text-muted-foreground` |
| **Ours** | `text-sm text-muted` only (`section-heading.tsx`) |
| **Evidence** | Competitor heading block; `section-heading.tsx` L27–30 |
| **Recommendation** | Add `sm:text-base` on category subtitle (or SectionHeading prop). |

### C-17 — Starting-at price strategy / perceived value
| | |
|---|---|
| **Severity** | Medium (merch) |
| **Competitor** | Aggressive floors: ₹49 keyrings, ₹149 pooja/gaming, ₹159 customized |
| **Ours** | Computed mins: keyrings ₹129, pooja ₹299, lamps ₹1699, organizers ₹799, planters ₹699, rakhi ₹259 — lamps/workspace look expensive in the rail |
| **Evidence** | Competitor prices from HTML; `minPriceByCategory` in `category-icons.tsx` + `lib/products.json` |
| **Recommendation** | Keep dynamic mins, but ensure entry SKUs exist in high-intent cats; don’t lead rail with ₹1699+ lamps first. |

### C-18 — Aspect ratio (confirmed parity; screenshot crop misleading)
| | |
|---|---|
| **Severity** | Info / verify |
| **Competitor** | `aspect-square` |
| **Ours** | `aspect-square` |
| **Evidence** | Both codebases; screenshots crop labels so tiles look portrait |
| **Recommendation** | No change. Don’t switch to 4:5 — that would diverge. |

### C-19 — Labels overlay vs below (confirmed parity)
| | |
|---|---|
| **Severity** | Info |
| **Competitor** | Labels **below** image (not overlay) |
| **Ours** | Labels **below** (`category-icons.tsx` comment + markup) |
| **Evidence** | Competitor `</div><span class="text-center…">Name</span>`; ours L70–73 |
| **Recommendation** | Keep below. Avoid overlay/gradient labels. |

### C-20 — Lab as separate entry (nav/hero, not category grid)
| | |
|---|---|
| **Severity** | Low (scope-adjacent) |
| **Competitor** | Lab in nav with **NEW** + hero secondary CTA; category grid has priced Customized |
| **Ours** | Customise in nav + category CTA tile; no Lab/NEW pattern on category row |
| **Evidence** | Competitor nav/hero scrape; ours nav + `isCta` tile |
| **Recommendation** | Don’t duplicate Lab into grid if Customized/Customise tile exists; align naming (Customise vs Lab) site-wide. |

---

### Priority patch order
1. **C-01 + C-02 + C-09 + C-10** — responsive grid + tile sizing  
2. **C-03** — teal Starting-at badges  
3. **C-04 + C-05 + C-14** — taxonomy / Home Decor / CTA  
4. **C-07 + C-06 + C-11** — chrome, label, spacing polish  
5. **C-12 + C-13 + C-17** — order, URLs, price floors  

**GOAT Reminder**: Build boring systems that work when things break. Stop following sheep toward the cliff. 🐐
