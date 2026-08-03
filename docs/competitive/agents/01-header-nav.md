# Agent report: 01-header-nav

## Scope: Header & Announcement

**Sources:** `components/layout/header.tsx`, `components/layout/announcement-bar.tsx`, `app/layout.tsx`, `app/globals.css`, `tailwind.config.js`, screenshots (competitor 3:24:11 / ours 3:24:13), live markup from https://3dprintshop.in/

**Quick parity snapshot**

| Area | Competitor | Tathastu |
|------|------------|----------|
| Sticky unit | Announcement + nav together (`sticky top-0 z-50`, backdrop-blur) | Announcement outside sticky; only `<Header>` sticks |
| Announce copy | 2 msgs: delivery + made-to-order | 3 msgs: delivery + made-to-order + free shipping ₹199 |
| Desktop nav | 5 category links | 9 links (Home + seasonal + categories + CTA + Blog) |
| NEW badge | 1× on Lab, brand/primary color | 2× on Rakhi & Keyrings, violet |
| Track Order | `/track-order` + package icon | `/account` (wrong; real page is `/account/track-order`) |

---

### H-01 — Sticky announcement scrolls away
- **Severity:** P0
- **Competitor:** Announcement lives inside `<header class="sticky top-0 z-50 … backdrop-blur">`; bar stays visible while scrolling.
- **Ours:** `AnnouncementBar` is a sibling above `Header` in `app/layout.tsx`; only header is `sticky top-0 z-40`. Announcement leaves the viewport on scroll.
- **Evidence:** `app/layout.tsx` L149–150; competitor HTML `header.sticky…` wrapping `bg-secondary` bar; ours `header.tsx` L58–59.
- **Recommended change:** Nest announcement inside the sticky header (or make a sticky chrome wrapper so both stick together). Match `z-50` / consider light backdrop-blur if desired.

---

### H-02 — Nav item count / density (9 vs 5)
- **Severity:** P0
- **Competitor:** `Pooja & Decor → Home Decor → Keyrings/BagTag → Workspace → 3DPrintShop Lab` (`gap-6`, `text-sm`).
- **Ours:** `Home, Rakhi, Pooja & Decor, Keyrings, Home Decor, Workspace, Gaming, Customise Now, Blog` at `text-[13px] px-2.5` — cramped, harder to scan.
- **Evidence:** Competitor screenshot + HTML nav; `header.tsx` L17–27, L83–97; ours screenshot.
- **Recommended change:** Cut desktop primary nav to ~5–6 shoppable categories + one CTA. Move Home/Blog to logo / footer / mobile-only. Consider mega-menu or “More” if all categories must stay.

---

### H-03 — Track Order destination wrong
- **Severity:** P0
- **Competitor:** `href="/track-order"` with package-search icon.
- **Ours:** Announcement “Track Order” → `/account`. Actual tracker exists at `/account/track-order`.
- **Evidence:** `announcement-bar.tsx` L41–46; `app/account/track-order/page.tsx`; competitor HTML `href="/track-order"`.
- **Recommended change:** Point to `/account/track-order` (and/or add `/track-order` alias). Add package/search icon like competitor.

---

### H-04 — Announcement layout / message strategy
- **Severity:** P1
- **Competitor:** Left: `Fast pan-India delivery 🇮🇳 · Custom 3D prints made to order` (`truncate`). Right: phone / Track / WhatsApp. Fixed `h-9`, `justify-between`, `text-xs`. No free-shipping claim in the bar.
- **Ours:** Three bullet messages including `Free shipping on orders above ₹199`; left block is `flex-1 text-center` while utilities sit right — reads left-heavy in screenshot, not a clean L/R split. CSS `.announcement-bar` also forces `text-sm font-semibold text-center` while inner uses `text-xs`.
- **Evidence:** `announcement-bar.tsx` L8–18; `globals.css` L89–92; competitor HTML; both screenshots.
- **Recommended change:** Use true `justify-between` + left `truncate` (not centered flex-1). Keep free-shipping as a differentiator or move it to promo strip; reconcile CSS vs inner typography conflict.

---

### H-05 — Announcement mobile behavior
- **Severity:** P1
- **Competitor:** Entire announce bar `hidden md:block` — gone on small screens.
- **Ours:** Always rendered; mobile short copy: `Free shipping above ₹199 • Pan-India delivery`. Utility links `hidden md:flex` so mobile loses phone/Track/WA from the bar.
- **Evidence:** Competitor `hidden … md:block`; `announcement-bar.tsx` L15–17, L21.
- **Recommended change:** Decide consciously: either hide bar on mobile (competitor) or keep a slim value prop + one tappable action (WA/phone). Don’t leave a bar with no actions and weaker hierarchy.

---

### H-06 — Logo treatment / brand lockup
- **Severity:** P1
- **Competitor:** Single wordmark image `150×42`, `h-10 w-auto`, always visible; tagline appears baked into brand art in screenshot (“CRAFTING…”).
- **Ours:** 34px mark + wordmark; text `hidden lg:inline` so tablet/narrow desktop shows icon only. “Keepsakes” is `text-brand` (teal), not a script face despite screenshot impression of softer weight.
- **Evidence:** `header.tsx` L66–80; competitor `<img alt="3DPrintShop" … class="h-10 w-auto">`; ours screenshot.
- **Recommended change:** Show wordmark from `md` (or always). Optionally ship a combined logo asset with clearer hierarchy; avoid icon-only at common laptop widths.

---

### H-07 — Nav labels / order / missing “Lab” framing
- **Severity:** P1
- **Competitor:** Category-first order; customize positioned as branded **3DPrintShop Lab** with NEW.
- **Ours:** Starts with Home + seasonal Rakhi; customize is “Customise Now”; Keyrings lacks “BagTag”; no Lab framing; Gaming/Blog inflate list.
- **Evidence:** `header.tsx` navItems; competitor nav HTML; screenshots.
- **Recommended change:** Align labels where product lines match (`Keyrings / Bag Tags`). Promote customise as a named Lab/studio item with NEW. Drop or demote Home; reorder to category-first.

---

### H-08 — NEW badge placement & color
- **Severity:** P1
- **Competitor:** One NEW on Lab — `sup.rounded-full bg-primary` (mint/teal brand), tiny uppercase.
- **Ours:** NEW on Rakhi + Keyrings via `Badge variant="new"` → `bg-violet` (`#4C2A86`), rectangular-ish with badge shadow — competes with announcement violet, not primary teal.
- **Evidence:** `header.tsx` L19–21, L91–95; `globals.css` `.badge-new`; competitor Lab `<sup class="rounded-full bg-primary…">NEW</sup>`; screenshots.
- **Recommended change:** Put NEW on the customise/Lab CTA; use `brand` (or primary) pill, not violet. Limit to one nav NEW.

---

### H-09 — Nav hover states
- **Severity:** P1
- **Competitor:** Animated underline: `h-0.5 w-0 … group-hover:w-full bg-primary`; text `text-foreground/80 → hover:text-foreground`.
- **Ours:** `hover:text-brand` + `hover:bg-surface` rounded pill — no underline motion.
- **Evidence:** Competitor nav anchors; `header.tsx` L88.
- **Recommended change:** Add underline grow (or bottom border) hover; keep brand color shift. Prefer one hover language, not soft fill alone.

---

### H-10 — Cart count badge visibility
- **Severity:** P1
- **Competitor:** Screenshot shows persistent circular brand-colored count on cart (incl. `0` / `1`). SSR markup has no badge (likely client-hydrated).
- **Ours:** Badge only when `itemCount > 0`; empty cart looks identical to “no cart affordance.” Screenshot shows no badge.
- **Evidence:** `header.tsx` L157–165; competitor/ours screenshots.
- **Recommended change:** Always show count (incl. `0`) in brand color for cart affordance, or show a subtle empty-state pip. Keep `99+` cap.

---

### H-11 — Wishlist icon visibility on small screens
- **Severity:** P1
- **Competitor:** Wishlist always in icon row (`inline-flex`); account hidden until `sm`.
- **Ours:** Wishlist `hidden sm:flex`; account always shown. On xs, wishlist only via mobile menu.
- **Evidence:** `header.tsx` L126–129 vs competitor wishlist always + account `hidden … sm:inline-flex`.
- **Recommended change:** Match commerce priority: keep wishlist visible; hide account under `sm` if space is tight.

---

### H-12 — Announcement utility iconography & separators
- **Severity:** P2
- **Competitor:** Phone (lucide-phone), Track (package-search), WhatsApp (message-circle); `gap-5`; hover `opacity-80`; no pipe dividers.
- **Ours:** Phone + WhatsApp brand glyph; Track is text-only; `|` separators `text-white/30`.
- **Evidence:** `announcement-bar.tsx` L21–62; competitor announce `<nav class="flex … gap-5">`.
- **Recommended change:** Add package icon on Track; drop pipes for spacing; keep or swap WA glyph for consistency with lucide set if desired.

---

### H-13 — Icon hit targets / focus rings / icon weight
- **Severity:** P2
- **Competitor:** `size-10` targets, `focus-visible:ring-2`, icons `size-5`, foreground-colored.
- **Ours:** `p-2` (~36px), muted icons `text-muted`, hover brand; no focus-visible ring classes.
- **Evidence:** `header.tsx` L101–166; competitor icon row HTML.
- **Recommended change:** Standardize `size-10` + focus rings; darken default icon color toward ink for contrast.

---

### H-14 — Sticky chrome polish (blur / border / z-index)
- **Severity:** P2
- **Competitor:** `bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80`, `z-50`, border-b.
- **Ours:** Solid `bg-white`, `z-40`, shadow only after `scrollY > 4`.
- **Evidence:** Competitor header class string; `header.tsx` L36–41, L58–59.
- **Recommended change:** Optional translucent blur sticky bar; raise z-index above floats if needed; keep scroll shadow as enhancement.

---

### H-15 — Desktop nav typography & spacing
- **Severity:** P2
- **Competitor:** `text-sm font-medium`, `gap-6`, `mx-auto` centered cluster.
- **Ours:** `text-[13px] font-display font-medium`, `gap-0.5` / `px-2.5` — tighter, display font on every link.
- **Evidence:** `header.tsx` L83–88; competitor `nav.mx-auto … gap-6 text-sm font-medium`.
- **Recommended change:** After pruning items, increase gap to ~24px and use `text-sm`; consider `font-sans` for nav vs display.

---

### H-16 — Mobile hamburger pattern
- **Severity:** P2
- **Competitor:** `lg:hidden` menu button, lucide-menu, `aria-label="Open menu"`, `size-10`; sheet/drawer pattern (button present; panel client-side).
- **Ours:** Inline expanding panel under header (`border-t`), X toggle, outside-click close; duplicates account/wishlist/cart in list.
- **Evidence:** `header.tsx` L168–267; competitor hamburger HTML before `</header>`.
- **Recommended change:** Prefer full-height drawer/sheet for parity and thumb reach; keep a11y (`aria-expanded`, focus trap). Not a blocker if inline menu is polished.

---

### H-17 — Account CTA labeling
- **Severity:** P2
- **Competitor:** Header account `aria-label="Sign in"` → `/account`.
- **Ours:** `aria-label="My account"` → `/account`; mobile list “My Account”.
- **Evidence:** Competitor icon link; `header.tsx` L115–119, L221–230.
- **Recommended change:** If most visitors are guests, “Sign in” / “Account” copy may convert better; optional only.

---

### H-18 — Announcement free-shipping claim vs competitor silence
- **Severity:** P2 (advantage / consistency)
- **Competitor:** Free shipping messaging lives elsewhere (promo/hero), not in top bar.
- **Ours:** Third announce claim uses `FREE_SHIPPING_THRESHOLD` (199) — strong differentiator in chrome.
- **Evidence:** `announcement-bar.tsx` L12; `lib/pricing.ts`; competitor announce paragraph (2 clauses only).
- **Recommended change:** Keep as intentional advantage, but ensure it doesn’t crowd L/R layout (see H-04). Don’t remove solely for parity.

---

### Already close / not material gaps
- Icon set order (Search → Account → Wishlist → Cart): **matched**.
- Cart icon metaphor: both shopping-cart (not bag) in live markup.
- Header height `h-16`: **matched**.
- Desktop breakpoint for full nav `lg`: **matched**.
- Violet announcement background: **visually matched** (`bg-violet` / `#4C2A86` vs competitor secondary purple).
- Search overlay pattern: both button-triggered search.

---

### Suggested fix order
1. **P0:** H-01 sticky unit, H-02 nav prune, H-03 Track Order href  
2. **P1:** H-04/H-05 announce layout, H-06 logo, H-07–H-09 nav/NEW/hover, H-10–H-11 badges/wishlist  
3. **P2:** polish icons, typography, mobile drawer, blur  

**GOAT reminder:** Ship the sticky chrome + correct Track URL before polishing hover underlines. Boring nav that fits the bar beats nine clever links that wrap at 1280px.
