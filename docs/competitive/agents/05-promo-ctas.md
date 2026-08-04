# Agent report: 05-promo-ctas

## Scope: Promo, Trust, CTAs

Sources: Tathastu components listed below vs live [3dprintshop.in](https://www.3dprintshop.in/) HTML/CSS (`primary` ≈ teal `hsl(186 60% 30%)` / `hsl(183 58% 53%)`, `secondary` ≈ purple `hsl(258 35% 46–56%)`).

---

### FIRST20 promo banner

| Aspect | 3dprintshop.in | Tathastu (`promo-strip.tsx` + `.promo-gradient`) |
|---|---|---|
| Shape | In-container `rounded-2xl` card + shadow | Full-bleed edge-to-edge section |
| Gradient | `bg-gradient-to-r from-primary via-primary to-secondary` (teal → purple) | `#4C2A86 → #3730A3` (purple only) |
| Icon | Lucide **ticket** in frosted `bg-white/20` circle | None |
| Headline | “Get **20% OFF** on your first order” | “**20% OFF** your first order” (no “Get”) |
| Subcopy | “On orders over ₹199 + Free Shipping · New customers · One-time use” | “One-time use · Min order ₹199 · Free shipping…” (no “New customers”) |
| Code UI | `button` dashed pill `border-2 border-dashed border-white/60 bg-white/15`, mono, white text | White solid `rounded-full` pill, violet text |
| Copy UX | Explicit copy control + copy icon; `aria-label="Copy coupon code FIRST20"` | `select-all` / `cursor-copy` only — **no** clipboard write, no copy icon, not a button |
| Layout | `justify-between`: left ticket+copy, right code button | Centered stack + vertical divider |

**PR-01** — Promo gradient not teal→purple; purple-only full-bleed vs competitor card gradient.  
**PR-02** — Missing ticket icon in frosted circular badge.  
**PR-03** — Code not a dashed translucent pill; solid white/violet chip instead.  
**PR-04** — No one-click copy button / copy icon / `navigator.clipboard` feedback (“Copied”).  
**PR-05** — Headline/subcopy mismatch (“Get…”, “New customers”, “On orders over ₹199 + Free Shipping”).  
**PR-06** — Promo chrome: missing `rounded-2xl` + shadow container treatment (full-bleed vs inset card).

---

### Trust band

| Aspect | Competitor | Tathastu (`trust-band.tsx`) |
|---|---|---|
| Section header | Eyebrow “Pan-India Delivery” + H2 + body | None — icons only |
| Item chrome | Bordered `rounded-2xl` cards, centered, circular icon | Flat row, `rounded-xl` square icon tiles |
| Sublabels | “Metro cities to remote towns”; “Made-to-order, then shipped fast”; “Trusted courier partners”; “On qualifying orders” | “Pan-India delivery”; “Made fresh per order”; “Full shipment visibility”; “No hidden charges” |
| Labels | Same four: PIN / 2–4 days / Tracked / Free over ₹199 | Same four labels (aligned) |

**PR-07** — No trust section intro (eyebrow + H2 + Kashmir→Kanyakumari body).  
**PR-08** — Trust items not carded/centered; icon shape and sublabel wording diverge.  
**PR-09** — Free-shipping sub says “No hidden charges” vs competitor “On qualifying orders”.

---

### Custom idea CTA

| Aspect | Competitor | Tathastu (`idea-cta.tsx`) |
|---|---|---|
| Layout | Horizontal split: copy left, CTAs right | Centered stack |
| Texture | Teal dot grid + purple ellipse washes | Blur orbs only |
| Primary CTA | “Customize in the Lab” → `/lab` + wand icon | “Customise Now” → `/customize` |
| Secondary | “Chat on WhatsApp” + arrow | WhatsApp icon + “Chat on WhatsApp” |
| Eyebrow | None on this block | “Custom 3D Printing” |
| Body | “Custom text, your own design, any colour…” | Upload/describe/message framing |

**PR-10** — Idea CTA not split left/right; missing teal-dot / ellipse atmosphere.  
**PR-11** — Primary CTA destination/label differ (`/lab` + wand vs `/customize`).  
**PR-12** — WhatsApp href hardcoded `https://wa.me/919154892790` instead of `SITE.whatsapp` / `whatsappUrl()` (footer/float use `SITE`).

---

### Photo upload section

| Aspect | Competitor | Tathastu (`photo-upload-section.tsx`) |
|---|---|---|
| Structure | Left intro + **Upload an image** → `/lab#upload`; right 2 cards | Centered header; 2 cards only |
| Card icons | Key / portrait-style Lucide | Camera / person-in-frame |
| Titles | “Photo → Keychain”, “Photo → Portrait Model” | Longer marketing titles + Bestseller/New badges |
| CTAs | “Create my keychain/portrait” | “Make my keychain” / “Create my portrait” |
| WhatsApp line | N/A on cards | “Chat to discuss” is a **non-link** `<span>` (dead UI) |
| Hover | `hover:-translate-y-1` lift | Shadow/top-bar only |

**PR-13** — Missing section-level “Upload an image” primary CTA (competitor `/lab#upload`).  
**PR-14** — Missing left-rail intro composition (badge + H2 + body + upload button beside cards).  
**PR-15** — “Chat to discuss” not wired to WhatsApp (decorative only).  
**PR-16** — Card iconography/titles don’t match Photo→Keychain / Photo→Portrait Model pattern.

---

### WhatsApp float

| Aspect | Competitor | Tathastu (`whatsapp-float.tsx`) |
|---|---|---|
| Position | `fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5` | `bottom-6 right-6` — **no safe-area** |
| Icon | Stroke `message-circle` | Filled WhatsApp glyph |
| Hover | `hover:scale-105` | `hover:-translate-y-0.5` |
| Aria | “Chat with us on WhatsApp” | “Chat on WhatsApp” |
| Admin hide | N/A | `globals.css` hides `.whatsapp-float`, but component has **no** `whatsapp-float` class (only `data-testid`) |

**PR-17** — Float missing `env(safe-area-inset-bottom)` / `right-5` parity.  
**PR-18** — Icon/hover language differ (message-circle + scale vs brand logo + lift).  
**PR-19** — Missing `whatsapp-float` class → admin CSS hide does not apply.

---

### Instagram section

| Aspect | Competitor | Tathastu (`instagram-reels.tsx`) |
|---|---|---|
| Homepage | No reels marquee (footer IG only) | Full marquee + embed modal (6 reels) |

**PR-20** — Not a competitor parity gap (Tathastu **ahead**). Optional: match footer-only if goal is strict clone; otherwise keep as differentiator.  
**PR-21** — Section uses `text-primary-600` / generic gray tokens vs site `brand`/`ink` elsewhere (visual inconsistency inside Tathastu).

---

### Reviews

| Aspect | Competitor | Tathastu (`reviews-section.tsx`) |
|---|---|---|
| Homepage block | **Absent** | 6 cards + 4.7 / 4,200+ / 98% stats |
| Data | — | Static sample reviews in `lib/reviews.ts` |

**PR-22** — Competitor has no homepage reviews; Tathastu is additive. Risk: sample/fabricated social proof vs empty competitor (policy: don’t invent reviews).  
**PR-23** — No link to full reviews / Google / product reviews (aggregate stats are orphaned).

---

### Newsletter

| Aspect | Competitor | Tathastu (`newsletter-form.tsx`) |
|---|---|---|
| Homepage form | **None** | Email + “Subscribe”, success/error/loading |
| Fields | — | Email only (no name/phone) |
| Button | — | Primary “Subscribe” / “Subscribing…” + Spinner |

**PR-24** — Newsletter is Tathastu-only (not on competitor). Fine as additive; no field/button parity target.  
**PR-25** — No marketing incentive in copy (competitor promo pushes FIRST20; newsletter doesn’t mention a signup perk).

---

### Section order (homepage)

Competitor (approx.): Hero → sale strip → **FIRST20 card** → categories → bestsellers → **trust (headed)** → rails → **photo+upload** → footer-top **idea CTA** → float.  
Tathastu (`app/page.tsx`): Hero → categories → **promo** → bestsellers → **trust** → rails → **reviews** → **photo** → **idea** → **Instagram** → **newsletter**.

**PR-26** — Extra mid-page reviews / Instagram / newsletter shift idea CTA later than competitor’s footer-adjacent placement.  
**PR-27** — Competitor idea CTA sits on dark footer continuum with border; Tathastu is a standalone dark band then IG then newsletter.

---

### Highest-impact parity (if matching screenshot)

1. **PR-01–04** — Rebuild FIRST20 as teal→purple ticket banner with dashed code + real copy.  
2. **PR-07–08** — Trust header + carded signals.  
3. **PR-13–15** — Photo section upload CTA + live WhatsApp affordance.  
4. **PR-10–12, PR-17–19** — Idea layout + float safe-area / class fix.

**GOAT Reminder**: Build boring systems that work when things break. Stop following sheep toward the cliff. 🐐
