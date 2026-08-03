# Agent report: 08-buttons-motion

## Scope: Buttons, Icons, Motion

Evidence base: Tathastu `components/ui/{button,badge,spinner,skeleton,infinite-marquee,product-card}.tsx`, `app/globals.css`, `tailwind.config.js`, `package.json`, hero/cart/header; competitor live markup from [3dprintshop.in](https://3dprintshop.in/) (shadcn-style `rounded-md` CTAs, `lucide-*` icons, `focus-visible:ring-*`, floating cart FAB on cards).

---

### BI-01 — Primary CTA shape: pill vs rounded-md
| | |
|---|---|
| **Severity** | High |
| **Competitor** | Primary CTAs are `h-11 rounded-md px-8` (shadcn button); not full pills. |
| **Ours** | `.btn-primary` / `.btn-outline` use `rounded-pill` (`9999px`) in `app/globals.css`. |
| **Evidence** | `globals.css` L27–46; competitor classes `… h-11 rounded-md px-8 …` |
| **Recommendation** | Align storefront primary/outline to `rounded-md` or `rounded-lg` (or a shared `--radius`); keep pill only for chips/filters/newsletter. |

### BI-02 — Product-card CTA radius fights the design system
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Card ATC is a circular icon button, not a full-width text bar. |
| **Ours** | Card uses `btn-primary-full` then overrides with `rounded-lg` → neither pill nor competitor FAB. |
| **Evidence** | `components/ui/product-card.tsx` L288–291 |
| **Recommendation** | Pick one: system pill, md radius, or competitor-style FAB; stop one-off overrides. |

### BI-03 — Floating cart-icon ATC on product image
| | |
|---|---|
| **Severity** | High |
| **Competitor** | `absolute bottom-1.5 right-1.5 … size-8 rounded-full` + `lucide-shopping-cart size-4` over image. |
| **Ours** | Full-width text button under card (`Add to cart` / `Customize` / `Choose options`); no cart icon on grid cards. |
| **Evidence** | Competitor button markup; `product-card.tsx` L287–311; `AddToCartButton` bag icon only on PDP (`add-to-cart-button.tsx` L129–134) |
| **Recommendation** | Add hover/persistent circular cart FAB on simple SKUs; keep text CTA for options/custom. |

### BI-04 — Arrow icons + hover translate on CTAs
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Widespread `lucide-arrow-right` with `group-hover:translate-x-0.5` on Shop/Customize/Create CTAs. |
| **Ours** | Hero CTAs are label-only (`hero-carousel.tsx` L181–186). “View all →” is a unicode arrow, not an icon + motion (`section-heading.tsx` L40). |
| **Evidence** | Competitor `lucide-arrow-right`; no ArrowRight usage in homepage components |
| **Recommendation** | Add Lucide (or shared SVG) arrow on primary marketing CTAs with subtle `translate-x` on hover. |

### BI-05 — Icon library inconsistency
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Consistent Lucide storefront (`shopping-cart`, `arrow-right`, `heart`, chevrons, etc.). |
| **Ours** | `lucide-react` in `package.json` but storefront uses inline SVGs; Lucide mostly admin (`admin-shell.tsx`). |
| **Evidence** | `package.json` L27; grep `from 'lucide-react'` under `components/` → admin only |
| **Recommendation** | Standardize storefront icons on Lucide (or one SVG set); drop one-off path copies. |

### BI-06 — Button size scale incomplete / uneven
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Explicit heights (`h-9`, `h-11`) + `px-3`/`px-8`. |
| **Ours** | `sm` / `md` (empty = CSS default) / `lg`; card forces `text-xs py-2`; many pages bypass `Button` with raw `btn-primary` + ad-hoc padding. |
| **Evidence** | `button.tsx` L15–18; `product-card.tsx` L291; `catalog-client.tsx` `rounded-lg` / `rounded-xl` overrides |
| **Recommendation** | Encode `h-*` in size tokens; ban ad-hoc height overrides outside the component. |

### BI-07 — Focus rings missing on design-system buttons
| | |
|---|---|
| **Severity** | High (a11y) |
| **Competitor** | Buttons/links ship `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Hero cards also ring on focus. |
| **Ours** | `.btn-primary` / `.btn-outline` / `.btn-ghost` have **no** focus-visible styles. Rings exist sparsely (forms, WhatsApp float, FAQ, color swatches). Header icon buttons: hover only, no focus ring. |
| **Evidence** | `globals.css` L27–57; competitor focus-visible counts; `header.tsx` L103–106 |
| **Recommendation** | Add `focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2` to all `.btn-*` and icon buttons. |

### BI-08 — Disabled states incomplete
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | `disabled:pointer-events-none disabled:opacity-50` on button primitive. |
| **Ours** | Primary/outline: `opacity-50 cursor-not-allowed` only. Ghost: no disabled styles. No `pointer-events-none` / `aria-disabled` pattern on Link-as-button. |
| **Evidence** | `globals.css` L33, L46 vs L53–57 |
| **Recommendation** | Mirror competitor disabled contract on all variants; prevent link clicks when disabled. |

### BI-09 — Badge shape & focusability
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Sale/discount badges are `rounded-full` pills with focus ring utilities on badge component. |
| **Ours** | Badges use small `rounded` + `shadow-badge`, not pills (`globals.css` L61–78). `Badge` is a non-interactive `<span>` (fine) but shape diverges. Nav NEW badges squash to `text-[9px]`. |
| **Evidence** | `badge.tsx`; competitor `rounded-full … bg-destructive` / `bg-emerald-700` |
| **Recommendation** | Switch storefront badges to `rounded-full`; keep Sale red / %OFF green pairing (already close). |

### BI-10 — Icon+label patterns uneven
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Systematic `gap-2` + `[&_svg]:size-4`; cart on ATC; arrows on marketing CTAs. |
| **Ours** | `gap-2` in `.btn-*` is good, but: PDP `AddToCartButton` has bag icon; grid card has none; WhatsApp hero CTA has icon; primary hero CTAs do not; photo-upload CTA is a styled `<span>` inside a link (not a real button). |
| **Evidence** | `add-to-cart-button.tsx` L129–134; `hero-carousel.tsx` L181–206; `photo-upload-section.tsx` L140 |
| **Recommendation** | Define icon-left / icon-right slots on `Button`; use them consistently. |

### BI-11 — Loading spinners: three implementations
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Page loader: `animate-spin rounded-full border-2 border-t-primary` + “Loading, please wait”. |
| **Ours** | Shared `Spinner` (SVG arc) in forms; **duplicate** inline SVG spinners in `product-card.tsx` and `add-to-cart-button.tsx`; admin uses border-ring spinners. No full-page competitor-style wait copy. |
| **Evidence** | `spinner.tsx`; `product-card.tsx` L300–306; `add-to-cart-button.tsx` L120–124; `app/admin/page.tsx` border spinner |
| **Recommendation** | Always use `Spinner`; optionally add a `variant="ring"` for page overlays matching competitor. |

### BI-12 — ATC success micro-interaction weaker / inconsistent
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Instant FAB feedback (typical cart bump / toast pattern on Shopify-class sites). |
| **Ours** | PDP: spinner → “Added ✓” ~1.2s (`add-to-cart-button.tsx`). Card: “Adding...” 800ms then silent reset—no checkmark, no cart-count animation. |
| **Evidence** | `product-card.tsx` L132–143, L300–307 |
| **Recommendation** | Unify Added ✓ + optional header cart badge pulse. |

### BI-13 — Skeleton = pulse, not shimmer
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Explicit loading overlay (“Loading… / please wait”) + spin; modern e-com often uses shimmer gradient. |
| **Ours** | `animate-pulse bg-gray-200` only; no shimmer keyframes; `aria-label="Loading..."` on decorative divs (prefer `aria-hidden` + parent `aria-busy`). |
| **Evidence** | `skeleton.tsx` L6–12; `tailwind.config.js` only defines `fade-in`, not shimmer |
| **Recommendation** | Add `@keyframes shimmer` + gradient skeleton; fix a11y labeling. |

### BI-14 — No framer-motion / motion library
| | |
|---|---|
| **Severity** | Low (intentional) |
| **Competitor** | CSS transitions + likely client motion for carousels; Lucide hover transforms. |
| **Ours** | No `framer-motion` / `motion` in `package.json`. Motion is CSS (`transition-*`, `animate-spin`, `animate-pulse`, marquee keyframes, `fade-in`). |
| **Evidence** | `package.json` dependencies |
| **Recommendation** | Stay CSS-first (GOAT); don’t add framer for polish alone—fix tokens/interactions first. |

### BI-15 — Marquee smoothness & reduced motion
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Hero product strip uses continuous scroll; focus-visible rings on mini cards. |
| **Ours** | `InfiniteMarquee` + `marquee-scroll` translateX(-50%), linear, pause on hover; `motion-reduce:animate-none` present. Hero remounts marquee via `key={slide.eyebrow}` (hard restart on slide change). Mini cards lack focus-visible ring (competitor has `focus-visible:ring-2 focus-visible:ring-primary`). |
| **Evidence** | `infinite-marquee.tsx`; `globals.css` L158–165; `hero-carousel.tsx` L218–230, L92–126 |
| **Recommendation** | Add focus rings on mini cards; soften slide-change restart (crossfade or keep track). |

### BI-16 — Hero carousel chrome vs competitor
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Dot controls `h-6 min-w-6`; rail Previous/Next `size-9 rounded-full border`. |
| **Ours** | Pill dots with 44px hit area (good); no prev/next on hero marquee (pause-only). ScrollRail arrows exist elsewhere but hide until hover and lack focus-visible. |
| **Evidence** | `hero-carousel.tsx` L234–248; `scroll-rail.tsx` L58–98 |
| **Recommendation** | Always-visible or focusable rail arrows; add focus rings. |

### BI-17 — Hover transitions: good base, thin motion vocabulary
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Color + shadow + arrow translate + social `hover:-translate-y-0.5`. |
| **Ours** | Buttons: `transition-colors` 150–200ms only (no elevation/scale). Cards: shadow 300ms + image `scale-105` 500ms. Wishlist heart: opacity fade. WhatsApp float: translate-y (good). Ghost: underline only. |
| **Evidence** | `globals.css` L27–85; `product-card.tsx` L170, L211; `whatsapp-float.tsx` |
| **Recommendation** | Add 1–2 intentional motions (arrow nudge, ATC press `active:scale-[0.98]`) without glow/purple fluff. |

### BI-18 — `active:` press feedback limited
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Relies on hover bg + disabled; press feel via browser defaults. |
| **Ours** | Primary has `active:bg-brand-700`; outline/ghost lack active; no scale press. |
| **Evidence** | `globals.css` L31 vs L40–57 |
| **Recommendation** | Add `active:scale-[0.98]` (or darker fill) on outline too. |

### BI-19 — Duplicate / ad-hoc button styling sprawl
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Single button primitive classes reused. |
| **Ours** | Mix of `<Button>`, raw `btn-primary`, and one-offs (`rounded-lg`, `rounded-xl`, `not-found` `rounded-lg`, blog CTA, watch-shop). |
| **Evidence** | `app/not-found.tsx`; `app/blog/[slug]/page.tsx`; `app/products/catalog-client.tsx` |
| **Recommendation** | Route all CTAs through `Button`; delete stray class soups. |

### BI-20 — Ghost / secondary CTA parity
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | Outline secondary: `border border-input … h-11 rounded-md` with full focus/disabled. |
| **Ours** | Outline is pill + 2px brand border (strong); ghost is underline text (weak for conversion). Hero WhatsApp is a third ad-hoc green outline. |
| **Evidence** | `hero-carousel.tsx` L188–206; `globals.css` L40–57 |
| **Recommendation** | Formalize `variant="whatsapp"` or share outline tokens; don’t invent a third shape. |

### BI-21 — Header icon buttons: no focus, no pressed cart motion
| | |
|---|---|
| **Severity** | Medium |
| **Competitor** | Icon buttons `rounded-md` + focus-visible rings; cart uses Lucide. |
| **Ours** | Inline SVGs, `hover:bg-surface`, no focus-visible; cart count badge exists but no bump animation on add. |
| **Evidence** | `header.tsx` L100–156 |
| **Recommendation** | Focus rings + optional badge scale keyframe on `itemCount` change. |

### BI-22 — Wishlist heart vs competitor
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | `lucide-heart` in chrome; card heart `size-9 rounded-full` top-right with focus ring. |
| **Ours** | Custom heart SVG, `opacity-0 group-hover:opacity-100` (hidden for keyboard/touch until hover), no focus-visible on the control. |
| **Evidence** | `product-card.tsx` L209–238 |
| **Recommendation** | Always-visible on touch / focus-visible; Lucide heart; ring styles. |

### BI-23 — Page-level loading UX
| | |
|---|---|
| **Severity** | Low–Medium |
| **Competitor** | Centered spinner + “Loading, please wait”. |
| **Ours** | Route skeletons (`app/loading.tsx` → `HeroSkeleton`; PDP/catalog skeletons). Better for perceived performance, but no branded wait message on slow client navigations. |
| **Evidence** | `app/loading.tsx`; competitor “Loading, please wait” |
| **Recommendation** | Keep skeletons; optionally overlay Spinner + short status for client-heavy flows (checkout already uses Spinner). |

### BI-24 — `fade-in` underused / dual definition
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | N/A |
| **Ours** | `fade-in` in `tailwind.config.js` and again via `.animate-fade-in` in `globals.css`; little storefront usage for section enter. Hero slide copy doesn’t animate on change (stable DOM by design). |
| **Evidence** | `tailwind.config.js` L71–78; `globals.css` L140–154 |
| **Recommendation** | Either use `animate-fade-in` on section mounts or delete dead utility. |

### BI-25 — Spinner not used in card ATC (DRY + a11y)
| | |
|---|---|
| **Severity** | Low |
| **Competitor** | N/A |
| **Ours** | Card spinner `aria-hidden` with text “Adding...”; shared `Spinner` has `role="status"` + `aria-label`. |
| **Evidence** | `product-card.tsx` L302 vs `spinner.tsx` L37–44 |
| **Recommendation** | Replace inline SVG with `<Spinner size="xs" />`. |

---

### Summary matrix

| Area | Competitor | Tathastu | Gap IDs |
|------|------------|----------|---------|
| CTA radius | `rounded-md` | `rounded-pill` (+ card `rounded-lg`) | BI-01, BI-02, BI-19 |
| Card ATC | Round cart FAB + Lucide | Full-width text, no icon | BI-03, BI-05, BI-10 |
| CTA arrows | Lucide + hover translate | Rare unicode `→` | BI-04 |
| Focus rings | Systemic on buttons | Missing on `.btn-*` / many icons | BI-07, BI-16, BI-21, BI-22 |
| Disabled | opacity + pointer-events | Partial; ghost none | BI-08 |
| Badges | Pill `rounded-full` | Slightly squared `rounded` | BI-09 |
| Spinners | Border ring + copy | SVG Spinner + duplicates | BI-11, BI-25 |
| Skeletons | Wait overlay | Pulse only | BI-13, BI-23 |
| Motion lib | CSS + Lucide transforms | CSS only, no framer | BI-14, BI-17, BI-18 |
| Marquee | Focusable cards | Solid loop; weak focus/restart | BI-15 |

**Highest-impact fixes:** BI-01/02 (radius consistency), BI-03 (cart FAB), BI-07 (focus rings), BI-04 (arrow micro-interaction), BI-11/13 (loader/skeleton polish).

**GOAT Reminder**: Build boring systems that work when things break. Stop following sheep toward the cliff. 🐐
