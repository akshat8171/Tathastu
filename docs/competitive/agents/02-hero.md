# Agent report: 02-hero

## Scope: Hero

Evidence sources: competitor screenshot (`3dprintshop.in`), ours screenshot (Tathastu Gaming slide), `components/homepage/hero-carousel.tsx`, `components/ui/button.tsx`, `components/ui/infinite-marquee.tsx`, `app/globals.css` (`btn-primary` / `rounded-pill`).

---

### HE-01 — CTA count / hierarchy clutter
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Exactly **2** CTAs in a single horizontal row: primary “Shop {Category}” + secondary “3DPrintShop Lab”. Clean primary/secondary hierarchy. WhatsApp is **not** in the hero CTA row (FAB only). |
| **Ours** | **3** CTAs: primary category shop, outline “Customise Now”, plus green “Chat on WhatsApp”. On desktop the third wraps or stacks under the first two, diluting focus. |
| **Evidence** | Screenshot (ours): three buttons under subcopy. Code: lines 180–207 — `Button primary`, `Button outline`, raw `<a>` WhatsApp. |
| **Recommendation** | Cap hero CTAs at **2**. Keep category primary + one secondary (`Customise Now` *or* Lab-equivalent). Rely on existing FAB / top-bar WhatsApp for chat. |

---

### HE-02 — Primary CTA affordance (arrow icon missing)
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Teal filled button with **white right-arrow** after label — clear “go shop” affordance. |
| **Ours** | Pill primary (“Shop Gaming”) — **label only, no icon**. `Button` has no icon slot; `btn-primary` is text-only. |
| **Evidence** | Competitor screenshot primary; ours screenshot; `button.tsx` renders children as-is. |
| **Recommendation** | Add a trailing chevron/arrow on the primary hero CTA only (inline SVG), matching competitor pattern without changing global Button API if undesired. |

---

### HE-03 — Secondary CTA label / destination mismatch
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Secondary = branded destination **“3DPrintShop Lab”** (productized custom/lab funnel). |
| **Ours** | Secondary = **“Customise Now”** → `/customize`. Functionally related, but weaker brand-product framing. |
| **Evidence** | Screenshots; ours `href="/customize"` (line 184). |
| **Recommendation** | Keep customise path, but consider a branded secondary label (e.g. “Tathastu Studio / Lab”) if that funnel exists; else leave label but ensure visual weight stays clearly secondary to shop. |

---

### HE-04 — WhatsApp as inline hero CTA
| | |
|---|---|
| **Severity** | High |
| **Competitor** | WhatsApp = **floating FAB** bottom-right only; hero stays commercial (shop + lab). |
| **Ours** | Inline green-border pill **plus** FAB (visible in screenshot). Double WhatsApp surfaces compete with shop CTA. |
| **Evidence** | Ours screenshot (inline + FAB); competitor screenshot (FAB only); hero lines 188–206. |
| **Recommendation** | Remove inline WhatsApp from hero. Keep FAB + header WhatsApp. |

---

### HE-05 — CTA shape language (pill vs soft-rect)
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Soft **rounded-rect** (moderate radius), not full pills — reads “ecommerce button”. |
| **Ours** | Full **`rounded-pill`** via `btn-primary` / `btn-outline` / WhatsApp classes — more consumer-app, less retail-catalog. |
| **Evidence** | `globals.css` `.btn-primary` / `.btn-outline` use `rounded-pill`; screenshots confirm. |
| **Recommendation** | For hero only, override to `rounded-xl` / `rounded-2xl` to match catalog-commerce feel; keep pills elsewhere if brand requires. |

---

### HE-06 — Product mini-card: price treatment (bar vs pill)
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Compact **white/translucent price pill** bottom-left on image; card image remains mostly visible; price feels like an overlay chip. |
| **Ours** | Full-width **orange→red gradient price bar** covering entire bottom of image (`from-orange-500 to-red-500`). Heavier, more “sale sticker strip,” obscures product feet. |
| **Evidence** | Screenshots; `MiniCard` lines 116–124. Comment in code even says “like competitor site” but implementation is a bar, not a pill. |
| **Recommendation** | Replace bar with bottom-left price pill (white/80 + ink price, optional struck original). Align with competitor anatomy. |

---

### HE-07 — Product mini-card: missing cart action
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Teal **square cart button** bottom-right on every mini-card — add-to-cart without leaving hero. |
| **Ours** | Entire card is a **Link to PDP only**. No cart control on card. |
| **Evidence** | Competitor cards; ours `MiniCard` is single `<Link>` (lines 92–127), no cart button. |
| **Recommendation** | Add bottom-right cart icon button (`stopPropagation` / `preventDefault` on click) calling existing add-to-cart; keep image/name → PDP. |

---

### HE-08 — Sale / discount badge placement
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | **Both badges stacked top-left** (red “Sale” + green “% OFF”) as a vertical cluster. |
| **Ours** | “Sale” **top-left**, “% OFF” **top-right** — splits attention across card width; matches code intent but not competitor. |
| **Evidence** | Screenshots; lines 107–115 (`left-2` Sale, `right-2` discount). |
| **Recommendation** | Stack both badges top-left (`flex-col gap-1`) to free top-right and match competitor scan path. |

---

### HE-09 — Price format / precision
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Prices like **₹449.00** (two decimals). |
| **Ours** | Whole rupees **₹179** / struck **₹259** — no decimals. |
| **Evidence** | Screenshots; `₹{product.price}` interpolation. |
| **Recommendation** | Optional: format with `.00` or shared currency helper for catalog consistency; not blocking if brand prefers integers. |

---

### HE-10 — Product row motion: marquee vs static
| | |
|---|---|
| **Severity** | High |
| **Competitor** | **Static** horizontal row of ~4 fully visible cards — stable, scannable, no motion competition with carousel. |
| **Ours** | **`InfiniteMarquee`** continuous loop (`durationSec` ≈ `max(24, n*3.5)`), pauses on hover/focus of product pane. Cards clip mid-card on the right. |
| **Evidence** | Competitor static row; ours marquee (lines 218–230); `infinite-marquee.tsx` CSS `marquee-scroll`. Screenshot shows 4th card cut off mid-scroll. |
| **Recommendation** | Prefer **static 3–4 cards** + optional prev/next or swipe; or marquee only below fold. Auto-slide of copy + marquee of products = dual motion tax. |

---

### HE-11 — Carousel slide count & theming
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | **2** dots → ~2 hero themes. |
| **Ours** | **3** slides (`Pooja & Decor`, `Keyrings & Bag Tags`, `Gaming & Fun`) — more rotation, shorter dwell per theme. |
| **Evidence** | Competitor 2 dots; `SLIDES` length 3; dots map `SLIDES.map` (lines 235–249). |
| **Recommendation** | Either match competitor with 2 strongest themes, or keep 3 but slow auto-advance and ensure static product row so dots feel deliberate. |

---

### HE-12 — Carousel dots visual language
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Two **equal-size circles**; active = solid teal, inactive = light gray — classic, quiet. |
| **Ours** | Active = **elongated pill** (`w-7 h-2.5`), inactive = small circle (`w-2.5`); large `w-11 h-11` hit areas. Screenshot shows awkward active state (pill + frame-like affordance). |
| **Evidence** | Lines 244–246; screenshots. |
| **Recommendation** | Use equal circular dots; active = brand fill, inactive = brand/30. Keep large hit target via invisible padding without changing visible shape. |

---

### HE-13 — Auto-advance timing / pause behavior
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Auto-rotates themes (2 slides); product row stays still — one motion channel. |
| **Ours** | `AUTO_ADVANCE_MS = 5500`; pause when hovering/focusing **product** region only — **copy/CTAs do not pause** the timer unless focus moves into products. Slide change remounts marquee via `key={slide.eyebrow}`. |
| **Evidence** | Lines 84, 139–144, 211–220. |
| **Recommendation** | Pause on hover of **entire** hero section; consider 7–8s if keeping 3 slides + any product motion; avoid remount jank (crossfade products without hard `key` reset if possible). |

---

### HE-14 — Eyebrow pill styling
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Soft **neutral gray** pill, **title case** (“Pooja & Decor”), subdued — category tag, not brand shout. |
| **Ours** | **Violet tint** (`bg-violet/10 text-violet`), **UPPERCASE** + `tracking-widest` — louder, more “badge/marketing chip”. |
| **Evidence** | Screenshots; line 170. |
| **Recommendation** | Soften to neutral gray pill + title case matching slide eyebrow string as authored in `SLIDES` (already title case in data; CSS forces uppercase). |

---

### HE-15 — Headline split / color emphasis
| | |
|---|---|
| **Severity** | Low (parity / brand choice)
| **Competitor** | Headline reads as **single-weight dark** line: “Devotion, beautifully printed” — no second-color split in screenshot. |
| **Ours** | Split: dark `{headline}` + **`text-brand` highlight** (“made to order.”) — stronger brand accent, intentional. |
| **Evidence** | Screenshots; lines 173–176. |
| **Recommendation** | Keep brand split (differentiator). Ensure line break feels intentional (`<br />` after comma on lg) so two-line rhythm matches screenshot; avoid accidental wrap mid-phrase on mid widths. |

---

### HE-16 — Subcopy length / width
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | ~2 lines, muted gray, sits tight under headline before CTAs. |
| **Ours** | Same pattern (`text-muted`, `max-w-md`) — strong parity. |
| **Evidence** | Screenshots; lines 177–179. |
| **Recommendation** | No change required; preserve max-width so CTAs don’t float under a long wrap. |

---

### HE-17 — Background gradient atmosphere
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Soft **cool blue / white radial** wash — calm retail. |
| **Ours** | `bg-gradient-to-br from-violet/10 via-surface to-brand-50` — violet + brand tint. Slightly more “brand purple” than competitor cool blue. |
| **Evidence** | Line 161; both screenshots. |
| **Recommendation** | If matching competitor calm retail: shift toward cool blue/white radial, keep brand in CTAs/highlight only. Avoid stacking violet eyebrow + violet wash + brand pills. |

---

### HE-18 — Layout, spacing, mobile stacking
| | |
|---|---|
| **Severity** | Medium (mobile), Low (desktop parity) |
| **Competitor** | Desktop: **copy left / products right**, generous gap, products dominate right half. |
| **Ours** | Same desktop intent: `flex-col lg:flex-row`, `gap-10 lg:gap-16`, `min-h-[320–400]`. Mobile: **copy centered first**, then full-width marquee — stacking correct, but center-aligned CTAs + 3 buttons = tall hero before products. |
| **Evidence** | Lines 165–166, 169; screenshots desktop. |
| **Recommendation** | Desktop: keep split. Mobile: left-align copy (or keep center but **2 CTAs max**), show **2–3 static cards** before fold, dots closer under products. Reduce `py-10 sm:py-14 lg:py-20` slightly if hero exceeds one mobile viewport with 3 CTAs + marquee. |

---

### HE-19 — Mini-card size / visibility budget
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | ~4 **complete** cards readable at once. |
| **Ours** | Cards `w-36 / sm:w-44 / lg:w-48`; marquee always clips trailing card — feels unfinished vs competitor’s tidy four-up. |
| **Evidence** | Line 95; screenshots. |
| **Recommendation** | Fixed visible set of 3–4 cards at `lg` with consistent gap; no partial card unless intentional peek for carousel. |

---

### HE-20 — Card chrome (shadow / radius / image aspect)
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Soft rounded cards, light elevation, product-forward. |
| **Ours** | `rounded-card2`, `shadow-card`, hover lift, `aspect-[4/5]`, image zoom on hover — solid parity / slightly richer motion. |
| **Evidence** | Lines 95–105. |
| **Recommendation** | Keep; after switching to price pill + cart, re-check bottom overlay collision. |

---

## Priority stack (ship order)

1. **HE-01 / HE-04** — Reduce to 2 CTAs; drop inline WhatsApp  
2. **HE-06 / HE-07** — Price pill + cart button (true competitor card anatomy)  
3. **HE-10 / HE-19** — Static product row (or peek-carousel), stop dual motion  
4. **HE-08 / HE-12** — Badge stack + simple circular dots  
5. **HE-02 / HE-05 / HE-14 / HE-17** — Arrow, rect buttons, quieter eyebrow/gradient  

**Already at parity:** overall split layout (HE-18 desktop), themed eyebrow→headline→subcopy→CTA flow, sale + % OFF badges exist, auto-advance exists, brand highlight on headline is a valid differentiator (HE-15).

---

**GOAT Reminder**: Ship the boring hero that converts — two CTAs, static cards, clear cart — not three motions fighting for the same viewport. 🐐
