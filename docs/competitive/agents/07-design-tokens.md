# Agent report: 07-design-tokens

## Scope: Design Tokens

**Sources:** `tailwind.config.js`, `app/globals.css`, `app/layout.tsx` (Poppins/Inter), `components/homepage/hero-carousel.tsx`, screenshots `docs/competitive/assets/competitor-homepage.png` & `ours-homepage.png`.

Token inventory today: brand teal scale, violet/indigo promo, ink/muted, panel/surface, sale/discount, font-display/sans, radius card/card2/pill, shadows card/card-hover/badge. **Missing from theme.extend:** spacing scale, fontSize/lineHeight/letterSpacing, border colors, focus ring, WhatsApp green, price-strip accent, banner radius, elevation ladder.

---

### DT-01 — Primary teal hue mismatch
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | CTA / accents read as cooler forest-teal (~`#1D5D5E`–`#2E6F71`), slightly less saturated green. |
| **Ours** | `brand.DEFAULT` / `teal` = `#0E7A66` with scale 50–900; screenshots read greener/brighter than competitor. |
| **Evidence** | `tailwind.config.js` L12–24; both homepage screenshots (Shop CTAs, logo “T”, pagination). |
| **Recommendation** | Shift brand DEFAULT toward competitor cool teal (~`#1F6B6C`); regenerate 50–900 from that anchor; keep `#0E7A66` only if brand decision overrides parity. |

### DT-02 — Announcement / promo violet closeness
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Deep royal purple announcement bar (~`#4B2C78`). |
| **Ours** | `violet.DEFAULT` `#4C2A86`, `dark` `#3B1F6A`, `light` `#6B45A8`; `.announcement-bar` uses `bg-violet`. Visually close. |
| **Evidence** | `tailwind.config.js` L27–31; `globals.css` L89–92; screenshot tops. |
| **Recommendation** | Optional 1-step darken to `#4B2C78` for pixel parity; not blocking. |

### DT-03 — Promo gradient end token vs hardcoded CSS
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Teal→purple (or purple→indigo) wide promo band with soft corners. |
| **Ours** | `indigo.promo` `#3730A3` exists, but `.promo-gradient` hardcodes `linear-gradient(135deg, #4C2A86, #3730A3)` instead of Tailwind color refs. |
| **Evidence** | `tailwind.config.js` L32–34; `globals.css` L95–98. |
| **Recommendation** | Drive gradient from `violet` + `indigo.promo` (or CSS vars); add `promo-start` / `promo-end` tokens if direction differs from competitor teal→purple. |

### DT-04 — Hero wash: violet/mint vs cool gray-blue
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Soft cool gray-blue / lavender radial wash; very neutral. |
| **Ours** | `bg-gradient-to-br from-violet/10 via-surface to-brand-50` → mint + violet tint (`surface` `#F8FAFC`, `brand-50` `#e6f4f1`). |
| **Evidence** | `hero-carousel.tsx` L161; `tailwind.config.js` panel/surface; screenshots. |
| **Recommendation** | Add `hero-wash` / `hero-wash-end` tokens (e.g. `#F4F6FA` → `#E8EEF5`); drop violet/brand tints from hero background. |

### DT-05 — Sale / discount semantic colors diverge in use
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Discount chips often teal/green; price overlays are white pills with dark type; NEW in nav is bright green. |
| **Ours** | Tokens: `sale` `#E63946`, `discount` `#16A34A`, NEW via `badge-new` → `bg-violet`. Hero MiniCard also paints price bar with **untokenized** `from-orange-500 to-red-500`. |
| **Evidence** | `tailwind.config.js` L48–49; `globals.css` L61–74; `hero-carousel.tsx` L108–117. |
| **Recommendation** | Tokenize price-strip (`price-strip-from`/`to` or single `price-chip`); decide NEW = green (competitor) vs violet (ours) and align `badge-new`; stop raw `orange-500`/`red-500`. |

### DT-06 — WhatsApp / success green not in palette
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Green WhatsApp FAB; green NEW accents. |
| **Ours** | Hero outline uses `border-green-500 text-green-700 hover:bg-green-50`; float uses brand WhatsApp green ad hoc — no `whatsapp` / `success` token. |
| **Evidence** | `hero-carousel.tsx` L192; `tailwind.config.js` (no whatsapp/success); screenshots FAB. |
| **Recommendation** | Add `whatsapp: '#25D366'` (and optional `success` alias); wire float + Chat CTAs to it; stop default Tailwind green utilities. |

### DT-07 — Ink / muted vs competitor charcoal
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Headings near-black charcoal (~`#1A1A1A`); body mid-gray (~`#555`). |
| **Ours** | `ink` `#16182B` (navy-black), `ink.soft` `#2D2F45`, `muted` `#4B5563` (gray-600). Slightly cooler/navy vs competitor neutral black. |
| **Evidence** | `tailwind.config.js` L37–41; `globals.css` body/h* L9–15. |
| **Recommendation** | Optional: `ink` → `#1A1A1A`, body `muted` → `#555555` or `#52525B` for warmer parity; keep AA contrast. |

### DT-08 — Border / ring / divider tokens absent
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Soft hairline borders on secondary CTAs and cards; focus rings via shadcn `ring-ring`. |
| **Ours** | Cards use `border-gray-100`; forms use `border-gray-200` / `ring-brand` — no named `border`, `divider`, or `ring` tokens in config. `.btn-*` lack focus-visible rings entirely. |
| **Evidence** | `globals.css` `.card` L82–86, buttons L27–57; widespread `gray-100/200` in forms. |
| **Recommendation** | Add `border.DEFAULT`, `border.strong`, `ring` (e.g. `brand/50`); apply to `.card`, `.btn-*`, inputs. |

### DT-09 — Panel / surface roles under-specified
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Product thumbs sit on light gray panels; page mostly white. |
| **Ours** | `panel` `#EDF1F6`, `surface` `#F8FAFC`; `.image-panel` uses panel. Category grid often white-on-white with weak separation. |
| **Evidence** | `tailwind.config.js` L43–45; `globals.css` L124–126; ours screenshot category row. |
| **Recommendation** | Document when to use panel vs surface vs white; add `canvas` = `#FFFFFF` if needed; ensure category thumbs use `panel` like competitor. |

### DT-10 — Dual font stack vs competitor single geometric sans
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | One clean geometric sans for UI + headlines (Montserrat/Poppins-like). |
| **Ours** | `font-display` = Poppins; `font-sans` = Inter; `serif` aliased to Poppins. Headings forced `font-display` in base layer. |
| **Evidence** | `tailwind.config.js` L52–57; `layout.tsx` L15–27; `globals.css` L9–15. |
| **Recommendation** | Audit weight/feel vs competitor; either unify on one family for storefront or keep Poppins display + Inter body but tighten tracking so hero doesn’t feel “two brands.” |

### DT-11 — No type scale / leading / tracking tokens
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Clear hierarchy: large bold hero (~48–56px), section ~28–32px, nav `text-sm`, labels small uppercase. |
| **Ours** | Relies on default Tailwind sizes; `.section-heading__title` = `text-2xl sm:text-3xl`; hero sizes local; eyebrow uses `tracking-widest` ad hoc; **no** `fontSize` / `lineHeight` / `letterSpacing` in `theme.extend`. |
| **Evidence** | `tailwind.config.js` (absent); `globals.css` L115–116; hero classes. |
| **Recommendation** | Add tokens: `text-hero`, `text-section`, `text-body`, `text-caption`, `tracking-label`; map section-heading + hero to them. |

### DT-12 — Font weights loaded vs used
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Bold display + medium UI; restrained weight set. |
| **Ours** | Poppins 400–800; Inter 400–600. Buttons `font-semibold`; headings `font-bold`; little use of 800. |
| **Evidence** | `layout.tsx` L15–27; `globals.css` btn / section-heading. |
| **Recommendation** | Drop unused 800 (perf) or use it only for hero; document weight roles (400 body, 500 nav, 600 CTA, 700 heading). |

### DT-13 — Button radius language (pill vs rounded-rect) — critical
| | |
|---|---|
| **Severity** | P0 |
| **Competitor** | Primary/secondary CTAs are rounded rectangles (~8–12px / shadcn `rounded-md`), not capsules. |
| **Ours** | `borderRadius.pill` = `9999px`; `.btn-primary` / `.btn-outline` / WhatsApp hero CTA all `rounded-pill`. Screenshots show full pills vs competitor soft rects. |
| **Evidence** | `tailwind.config.js` L59–63; `globals.css` L27–47; `hero-carousel.tsx` L192; both screenshots. |
| **Recommendation** | Add `btn: '10px'` or use `rounded-lg`/`xl`; change `.btn-*` off `rounded-pill`. Reserve pill for chips, coupons, dots. |

### DT-14 — Badge radius: soft square vs competitor pill
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Sale / %OFF / NEW read as small pills (`rounded-full`). |
| **Ours** | `.badge-*` use default Tailwind `rounded` (~4px) + `shadow-badge`. |
| **Evidence** | `globals.css` L61–78; hero MiniCard `rounded` badges L108–112; screenshots. |
| **Recommendation** | Token `radius.badge = 9999px` (or `rounded-full`); apply to all badge utilities. |

### DT-15 — Card / image radius numeric parity
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Product/category tiles ~12–16px; promo band ~24–32px. |
| **Ours** | `card` 12px, `card2` 16px; `.card` → `rounded-card2`; `.image-panel` → `rounded-card`. No `banner` / `promo` radius token. |
| **Evidence** | `tailwind.config.js` L59–62; `globals.css` L82–86, L124–126; screenshots. |
| **Recommendation** | Keep card/card2 if visually matched; add `banner: '24px'` (or 28–32) for promo strip; verify category tiles use same token as competitor. |

### DT-16 — Secondary outline CTA radius & border width
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Ghost/secondary = white fill, thin dark/neutral border, same md radius as primary. |
| **Ours** | `.btn-outline` = `border-2 border-brand` + full pill — thicker, brand-colored, capsule. |
| **Evidence** | `globals.css` L40–47; competitor “Customise” style in screenshot. |
| **Recommendation** | Tokenize `border-btn` width (1px) + neutral or ink border option; share `radius.btn` with primary. |

### DT-17 — Shadow elevation ladder incomplete
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Very soft card/promo elevation; buttons flat. |
| **Ours** | `shadow.card` and `shadow.card-hover` + `shadow.badge` only — no sm/md/lg/fab ladder; scroll-rail reuses `shadow-card-hover` for circular controls. |
| **Evidence** | `tailwind.config.js` L65–68; `globals.css` `.card`; screenshots. |
| **Recommendation** | Add `shadow-sm`/`md`/`lg` brand elevations; map rest/hover/fab; keep buttons shadowless like competitor. |

### DT-18 — Badge shadow may over-elevate chips
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Badges largely flat on imagery. |
| **Ours** | `shadow-badge: 0 1px 4px rgba(0,0,0,.15)` on all `.badge-*`. |
| **Evidence** | `tailwind.config.js` L68; `globals.css` L61–78. |
| **Recommendation** | Soften or remove badge shadow for competitor flatness; reserve shadow for floating FABs. |

### DT-19 — No spacing / container tokens beyond utility defaults
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Wide gutters, ~16–24px grid gaps, generous hero vertical padding, calm density. |
| **Ours** | No custom `spacing` in theme; `.container-page` = `max-w-7xl mx-auto px-5 sm:px-6 lg:px-8`; `.section-heading` `mb-6`; btn `px-6 py-3` hardcoded. |
| **Evidence** | `tailwind.config.js` (no spacing extend); `globals.css` L101–103, L111–112, L27–30. |
| **Recommendation** | Add semantic spacing: `gutter`, `section-y`, `stack`, `card-gap` (16/20/24); wire container + homepage sections. |

### DT-20 — Button padding / height not tokenized
| | |
|---|---|
| **Severity** | P1 |
| **Competitor** | Consistent control heights (`h-9` / `h-11` style). |
| **Ours** | Only `px-6 py-3 text-sm` on `.btn-*`; product cards override `text-xs py-2` — no size scale in tokens. |
| **Evidence** | `globals.css` L27–47; product-card overrides. |
| **Recommendation** | Define `btn-height-sm/md/lg` + horizontal padding tokens; ban one-off py on marketing CTAs. |

### DT-21 — Motion duration tokens absent (token-adjacent)
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Subtle, short transitions. |
| **Ours** | Durations hardcoded (`duration-200`, `duration-300`, fade-in `0.5s`); keyframes in config but no `transitionDuration` theme tokens. |
| **Evidence** | `tailwind.config.js` L71–78; `globals.css` buttons/card/utilities. |
| **Recommendation** | Optional: `duration-fast/base/slow` tokens; keep reduced-motion rules. |

### DT-22 — Hardcoded color escapes undermine the token system
| | |
|---|---|
| **Severity** | P0 |
| **Competitor** | Coherent single palette in UI chrome. |
| **Ours** | Token file exists, but homepage still uses raw Tailwind greens/oranges and hex in `.promo-gradient`; color swatches duplicate hex maps outside tokens. |
| **Evidence** | `hero-carousel.tsx` L117, L192; `globals.css` L97; `product-card.tsx` / `product-options.tsx` COLOR_HEX maps. |
| **Recommendation** | Lint/ban raw palette utilities on storefront chrome; route accents through `theme.extend.colors` only. |

### DT-23 — Focus / selection tokens missing
| | |
|---|---|
| **Severity** | P1 (a11y + system) |
| **Competitor** | Explicit `ring-2 ring-ring ring-offset-2` language. |
| **Ours** | No `ringColor` / `ringOffset` in config; design-system buttons omit focus styles; sporadic `ring-brand` on forms only. |
| **Evidence** | `tailwind.config.js`; `globals.css` `.btn-*`. |
| **Recommendation** | Add `ring: brand` (or `brand/40`) + offset white; bake into component layer. |

### DT-24 — Coupon / dashed chip tokens missing
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Dashed-border pill for `FIRST20` on promo. |
| **Ours** | No `radius`/`borderStyle` tokens for coupon chip; promo implementation separate from token file. |
| **Evidence** | Competitor screenshot promo; `tailwind.config.js` radius list. |
| **Recommendation** | Add `coupon` radius (pill) + `border-dashed` + contrast fill token for code chip. |

### DT-25 — Pagination / FAB geometry tokens
| | |
|---|---|
| **Severity** | P2 |
| **Competitor** | Calm carousel; floating circular cart on cards. |
| **Ours** | Active pager `w-7 h-2.5 rounded-full bg-brand`; WhatsApp circle ad hoc; no `fab` size/radius/shadow tokens. |
| **Evidence** | `hero-carousel.tsx` L244–245; screenshots. |
| **Recommendation** | Tokenize `dot`, `dot-active`, `fab-size`, `fab-shadow` for reusable chrome. |

---

### Token gap summary

| ID | Area | Sev | One-line fix |
|----|------|-----|--------------|
| DT-01 | Color | P1 | Cooler primary teal |
| DT-02 | Color | P2 | Violet nudge optional |
| DT-03 | Color | P2 | Gradient from tokens |
| DT-04 | Color | P1 | Neutral hero wash |
| DT-05 | Color | P1 | Sale/NEW/price-strip semantics |
| DT-06 | Color | P1 | WhatsApp/success token |
| DT-07 | Color | P2 | Ink/muted warmth |
| DT-08 | Color | P1 | Border + ring tokens |
| DT-09 | Color | P2 | Panel/surface docs |
| DT-10 | Font | P1 | Stack pairing audit |
| DT-11 | Font | P1 | Type scale tokens |
| DT-12 | Font | P2 | Weight subset |
| DT-13 | Radius | P0 | Buttons off pill |
| DT-14 | Radius | P1 | Badge pills |
| DT-15 | Radius | P1 | Banner radius token |
| DT-16 | Radius | P1 | Outline CTA border/radius |
| DT-17 | Shadow | P2 | Elevation ladder |
| DT-18 | Shadow | P2 | Flatten badges |
| DT-19 | Spacing | P1 | Semantic spacing |
| DT-20 | Spacing | P1 | Button size tokens |
| DT-21 | Motion | P2 | Duration tokens |
| DT-22 | System | P0 | Kill hardcoded chrome colors |
| DT-23 | System | P1 | Focus ring tokens |
| DT-24 | Radius | P2 | Coupon chip tokens |
| DT-25 | Spacing | P2 | Dot/FAB tokens |

**P0 first:** DT-13 (button radius), DT-22 (hardcoded colors). Then P1 color/type/spacing (DT-01,04–06,08,10–11,14–16,19–20,23).
