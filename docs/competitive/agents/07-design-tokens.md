# Agent report: 07-design-tokens

## Scope: Design Tokens

Evidence: `tailwind.config.js`, `app/globals.css`, `app/layout.tsx`, homepage/header components, screenshots (Desktop 3.24.11 competitor / 3.24.13 ours), plus competitor CSS `:root` from [3dprintshop.in](https://3dprintshop.in/).

### Current Tathastu token inventory

| Token | Value | Source |
|---|---|---|
| `brand` DEFAULT | `#0E7A66` (HSL ~169° 79% 27%) | `tailwind.config.js` |
| `violet` DEFAULT | `#4C2A86` | same |
| `indigo.promo` | `#3730A3` | same |
| `sale` / `discount` | `#E63946` / `#16A34A` | same |
| `ink` / `muted` | `#16182B` / `#4B5563` | same |
| `panel` / `surface` | `#EDF1F6` / `#F8FAFC` | same |
| display / sans | Poppins / Inter | `layout.tsx` + Tailwind `fontFamily` |
| radius | `card` 12px, `card2` 16px, `pill` 9999 | Tailwind |
| shadows | `card`, `card-hover`, `badge` | Tailwind |
| container | `.container-page` → `max-w-7xl` (1280px) | `globals.css` |
| promo gradient | `#4C2A86 → #3730A3` (purple→indigo) | `.promo-gradient` |

### Competitor token inventory (from CSS `:root`)

| Token | Value |
|---|---|
| `--primary` | `186 60% 30%` → **`#1F717A`** (cool petrol teal) |
| `--secondary` | `258 35% 46%` → **`#654C9E`** |
| `--accent` | light teal wash `#EAF8F9` |
| `--destructive` | `0 72% 46%` → **`#CA2121`** |
| `--radius` | `0.6rem` (~9.6px) base; pills still `9999px`; cards up to `1–1.75rem` |
| Font | **Outfit** only (`--font-outfit`) |
| Container | `max-width: 1280px` |
| Hardcoded accents | `#41C6CC` (bright cyan), `#634C9F`, `#25D366`, `#E11D48` |

Screenshot cluster confirmation: competitor CTA teal ~`#186068`/`#1D666F`; ours ~`#106858`/`#11705C` (matches `#0E7A66`). Ours announcement ~`#43257B` ≈ `#4C2A86`.

---

### DT-01 — Primary brand hue (warm green-teal vs cool petrol)
| | |
|---|---|
| **Severity** | High |
| **Competitor** | `#1F717A` / HSL 186° — cyan-teal petrol |
| **Ours** | `#0E7A66` / HSL 169° — greener, more “brand green” |
| **Evidence** | Screenshot left-mid teal avg `#1D666F` vs `#11705C`; competitor CSS `--primary: 186 60% 30%` |
| **Recommendation** | Shift `brand.DEFAULT` toward `#1F717A` (or `#1A6B73`) and rebuild scale 50–900 around HSL 186°. Keep a named alias `brand.legacy` only if migration needs it. Do **not** copy competitor identity wholesale if Tathastu wants distinct IP — but close the ~18° hue gap if parity is the goal. |

### DT-02 — Missing bright cyan “energy” accent
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `#41C6CC` used heavily (borders, fills, glow accents) |
| **Ours** | No equivalent; only muted `brand-50` `#e6f4f1` |
| **Recommendation** | Add `brand.bright: '#41C6CC'` (or `#3DB8C0`) for highlights, rings, promo accents — not for primary CTA fill. |

### DT-03 — Purple secondary / announcement mismatch
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `--secondary` → `#654C9E`; screenshot purple cluster `#584090` / avg `#5A4594` |
| **Ours** | `#4C2A86` (deeper, more saturated); screenshot announce `#43257B` |
| **Evidence** | `.announcement-bar { @apply … bg-violet }` |
| **Recommendation** | Lighten `violet.DEFAULT` to ~`#5B4194`–`#654C9E`; keep `violet.dark` for hover. Announcement should use the secondary token explicitly (`bg-secondary` or `bg-violet`). |

### DT-04 — Promo gradient is purple-only (should be teal→purple)
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Promo banner reads teal → purple (screenshot + Agent 5 scope) |
| **Ours** | `linear-gradient(135deg, #4C2A86 0%, #3730A3 100%)` — purple→indigo only |
| **Evidence** | `globals.css` `.promo-gradient` |
| **Recommendation** | Tokenize: `--gradient-promo: linear-gradient(90deg, var(--brand) 0%, var(--violet) 100%)` and drop hardcoded indigo end. Prefer horizontal `to right` like competitor. |

### DT-05 — Sale badge red too bright / off competitor destructive
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Destructive `#CA2121` / screenshot `#C01818`–`#D83334`; also `#E11D48` in CSS |
| **Ours** | `sale: '#E63946'` |
| **Recommendation** | Set `sale: '#DC2626'` or `#CA2121`; keep white text. Optionally add `sale.soft` for backgrounds. |

### DT-06 — Discount / %OFF green vs competitor bright green
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Brighter `#20C858` / `#22C55E` family on badges |
| **Ours** | `discount: '#16A34A'` (Tailwind green-600) |
| **Recommendation** | Either keep `#16A34A` for WCAG on white, or split: `discount: '#16A34A'` (text-on-light) and `discount.badge: '#22C55E'` (white-on-fill). Don’t use WhatsApp green for commerce %OFF. |

### DT-07 — Price strip uses untokenized orange→red
| | |
|---|---|
| **Severity** | High (token hygiene + visual noise) |
| **Competitor** | Clean light/white price area on hero cards (little orange mass) |
| **Ours** | `bg-gradient-to-r from-orange-500 to-red-500` on hero mini-cards |
| **Evidence** | `hero-carousel.tsx` L117; screenshot orange cluster `#F2661F` |
| **Recommendation** | Add `price.strip.from` / `price.strip.to` **or** remove gradient strip and use ink price on white (closer to competitor). Prefer removing — it’s the loudest non-token divergence. |

### DT-08 — WhatsApp greens not in the design system
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Explicit `#25D366` |
| **Ours** | Hardcoded `border-green-500 text-green-700 hover:bg-green-50` (+ float) |
| **Evidence** | `hero-carousel.tsx` L192; contact/account also use raw `green-*` |
| **Recommendation** | Add `whatsapp: { DEFAULT: '#25D366', dark: '#128C7E', soft: '#DCF8C6' }` and wire all WA CTAs to it. Never reuse as brand primary. |

### DT-09 — Font family: Outfit vs Poppins/Inter
| | |
|---|---|
| **Severity** | High (visual language) |
| **Competitor** | Single family **Outfit** for UI + display |
| **Ours** | Display **Poppins**, body **Inter** |
| **Evidence** | Competitor CSS `font-family: var(--font-outfit)…`; ours `layout.tsx` |
| **Recommendation** | For parity: switch both `font-display` and `font-sans` to Outfit (400–800). If keeping dual-font brand, at least use one geometric for H1+nav (Outfit or Poppins only) and reserve Inter for long body — competitor feels more unified. |

### DT-10 — H1 size/weight mostly aligned; highlight color differs by brand
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Large bold H1 (~48–60px), highlight in primary teal |
| **Ours** | `text-4xl sm:text-5xl lg:text-6xl font-extrabold`; highlight `text-brand` |
| **Evidence** | `hero-carousel.tsx` L173–175 |
| **Recommendation** | Add typed scale tokens: `text-hero: clamp(2.25rem, 4vw, 3.75rem)`. Keep highlight on `brand` after DT-01 retune. |

### DT-11 — Nav type: display at 13px vs competitor ~14–16px
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Medium-weight sans ~14–16px |
| **Ours** | `text-[13px] font-display font-medium` |
| **Evidence** | `header.tsx` L88 |
| **Recommendation** | Token `text-nav: 0.875rem` (14px); use `font-sans` or Outfit medium, not Poppins for dense nav. Logo can stay `font-display text-lg`. |

### DT-12 — Announcement bar type size inconsistency
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | ~12px white on purple |
| **Ours** | Class says `text-sm` in `.announcement-bar`, component overrides to `text-xs` |
| **Evidence** | `globals.css` L89–91 vs `announcement-bar.tsx` L10 |
| **Recommendation** | Single token `text-announce: 0.75rem`; remove conflicting utilities. |

### DT-13 — Border radius: close, but base system differs
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | `--radius: 0.6rem`; also `1rem` / `1.5rem` / `1.75rem` / pills |
| **Ours** | `card` 12px, `card2` 16px, `pill` 9999 — no CSS var `--radius` |
| **Recommendation** | Expose `--radius: 0.75rem` in `:root`; map `rounded-card`→12px, `rounded-card2`→16px, add `rounded-promo: 1.25rem` for promo banner corners (competitor promo is more rounded than our full-bleed strip). |

### DT-14 — Badge radius too sharp vs competitor pills
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Sale/%OFF read as soft pill/capsule |
| **Ours** | `.badge-*` use `rounded` (4px) |
| **Evidence** | `globals.css` L61–78 |
| **Recommendation** | Change badges to `rounded-md` or `rounded-full`; add `radius.badge` token. |

### DT-15 — Shadows: ours softer; competitor has richer elevation set
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Multiple elevations including `0 10px 25px rgba(15,23,42,.14)`, FAB-like shadows |
| **Ours** | Light `card` / `card-hover` / `badge` only |
| **Recommendation** | Keep current card shadows (good). Add `shadow-float` for WhatsApp FAB and `shadow-promo` if promo becomes a raised rounded panel. |

### DT-16 — Max container width: already matched
| | |
|---|---|
| **Severity** | None (parity) |
| **Competitor** | `1280px` |
| **Ours** | `max-w-7xl` = 1280px |
| **Recommendation** | Tokenize as `--container-max: 80rem` for documentation; no visual change. Gutters `px-5 sm:px-6 lg:px-8` are fine. |

### DT-17 — Hero background gradient language
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Soft pastel lavender / sky / white (cool) |
| **Ours** | `from-violet/10 via-surface to-brand-50` (lilac→mint) |
| **Evidence** | `hero-carousel.tsx` L161 |
| **Recommendation** | After DT-01, use competitor-like wash: `from-[#EAF8F9] via-white to-[#F3EEF9]` via tokens `accent` + `violet.soft`. Avoid warm beige creep. |

### DT-18 — No CSS custom properties layer (tokens trapped in Tailwind)
| | |
|---|---|
| **Severity** | High (maintainability) |
| **Competitor** | shadcn-style `:root { --primary: … }` HSL channels |
| **Ours** | Hex only inside `theme.extend.colors`; `globals.css` hardcodes promo hex |
| **Recommendation** | Add `:root` CSS vars mirroring competitor pattern; point Tailwind colors at `hsl(var(--brand) / <alpha-value>)`. Enables one-place retunes for DT-01–04. |

### DT-19 — Incomplete semantic color roles
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | primary, secondary, accent, destructive, muted, ring |
| **Ours** | brand, violet, sale, discount, ink, muted, panel, surface — missing ring, destructive, success, warning, whatsapp, price |
| **Recommendation** | Map: `primary←brand`, `secondary←violet`, `destructive←sale`, `success←discount`, add `ring: brand`. |

### DT-20 — Hardcoded hex / Tailwind palette leakage
| | |
|---|---|
| **Severity** | High |
| **Ours** | Rakhi page `#9f1239`/`#ffb74d`; blog HTML `#7c3aed`/`#059669`; hero orange/red; WA greens |
| **Recommendation** | Ban raw `#` and `green-*`/`orange-*` in storefront components except product filament swatches. Festival themes get named token sets (`festival.rakhi.*`). |

### DT-21 — Section heading scale not tokenized
| | |
|---|---|
| **Severity** | Low |
| **Ours** | `.section-heading__title` → `text-2xl sm:text-3xl`; photo section goes to `lg:text-4xl` ad hoc |
| **Recommendation** | `fontSize.section` / `fontSize.sectionLg` in Tailwind theme. |

### DT-22 — Font weight: `extrabold` (800) everywhere vs competitor medium hierarchy
| | |
|---|---|
| **Severity** | Low |
| **Ours** | Hero/CTA sections lean `font-extrabold`; Inter only loaded 400–600 |
| **Recommendation** | Display max 700 for H2; reserve 800 for H1 only. Ensure Outfit/Poppins loads 700–800 if used. |

### DT-23 — Cart/count badge uses `brand` (OK) but competitor may use brighter green
| | |
|---|---|
| **Severity** | Low |
| **Ours** | Cart count `bg-brand` |
| **Competitor** | Screenshot description: bright green cart badge |
| **Recommendation** | Optional `badge.count: brand` or `brand.bright` after DT-02 — minor. |

### DT-24 — Panel/image background vs competitor product card ground
| | |
|---|---|
| **Severity** | Low |
| **Ours** | `panel: #EDF1F6` |
| **Competitor** | Cooler muted `#F2F6F8` (`--muted`) |
| **Recommendation** | Nudge `panel` to `#F2F6F8` or `muted` surface token for cooler airiness. |

---

### Recommended token patch (priority order)

1. **Retune** `brand` → `#1F717A` (+ scale); add `brand.bright` `#41C6CC`.
2. **Retune** `violet` → `#654C9E`; keep dark hover.
3. **Rewrite** `.promo-gradient` → brand → violet (horizontal).
4. **Add** `whatsapp`, fix sale/discount; **remove** hero orange price gradient (or tokenize).
5. **Fonts** → Outfit (or keep Poppins-only, drop Inter for UI chrome).
6. **Introduce** `:root` CSS variables; eliminate hardcoded hex in storefront CSS/components.
7. **Radius/type** micro-tokens: nav 14px, badge pill, `--container-max: 80rem`.

Parity is high on structure (1280 container, pills, dual teal+purple story). The eye-level gaps are **primary hue**, **promo gradient direction**, **typeface unity**, and **untokenized orange/green utilities**.

**GOAT Reminder**: Build boring systems that work when things break. Stop following sheep toward the cliff. 🐐
