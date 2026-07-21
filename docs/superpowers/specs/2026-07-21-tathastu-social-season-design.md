# TathastuKeepsakes — Rakhi→Diwali Social Media Season Engine

**Date:** 2026-07-21
**Owner:** Akshat Garg (founder, TathastuKeepsakes)
**Status:** Approved design — ready for implementation planning
**Approach:** C (Hybrid: always-on pillar engine + festival campaign bursts)

---

## 1. Purpose & Scope

Deliver a complete, ready-to-execute Instagram + WhatsApp content system covering
TathastuKeepsakes' peak revenue window: **Raksha Bandhan (Aug 28) through Diwali /
Bhai Dooj (Nov 8–11), 2026.**

The founder manages social **manually**: Claude authors all content (captions, reel/
story concepts, hashtags, WhatsApp broadcast copy, image shotlists) and the founder
reviews, then posts and sends from the real accounts.

### Explicitly OUT of scope
- No posting on the founder's behalf.
- No logging into or automating live Instagram / WhatsApp accounts.
- No API integration (WhatsApp Cloud API / Instagram Graph API) — deferred to a
  possible future phase, per the founder's decision.
- No paid-ads / performance-marketing plan (organic content only).

### Success criteria
- Founder can open one file per day and know exactly what to post, with copy-paste
  caption, hashtags, and a named image/reel to attach.
- Content is drawn from the **real** 54-product catalog and brand voice, not generic
  templates.
- Every festival's shipping cut-off ("order by X to arrive before the festival") is
  explicit, because delivery is 3–5 days.
- Sustainable at **4–5 posts/week**, with a marked "must-post" core that can be
  trimmed to on busy weeks.

---

## 2. Brand Facts (source of truth, from the repo)

- **Brand:** Tathastu Keepsakes — *"If it exists, we can print it."*
- **Product:** Custom 3D-printed keepsakes — lamps, pooja decor, couple gifts,
  keyrings, home decor, gaming, photo lithophanes.
- **Made in:** Agra, India. PAN-India delivery. "Printed fresh to order."
- **Site:** https://www.tathastukeepsakes.in
- **Catalog:** 54 products, price band ~₹149 (keychains) to ~₹2,499 (lamps).
- **Payments:** Razorpay (UPI/card/netbanking/wallet) + COD.
- **Material:** PLA / PLA+, multi-colour FDM, eco-friendly framing.
- **Existing social pattern:** 8 Pinterest pins with category-mapped, hashtag-rich,
  gift-focused copy (in `pinterest-pins/`). This voice is the baseline.

---

## 3. Verified 2026 Festival Calendar (locked)

Cross-checked against panchang sources and weekday-verified.

| Festival | Date | Day | Ship-by cut-off* |
|---|---|---|---|
| Raksha Bandhan | Aug 28 | Fri | ~Aug 23 |
| Janmashtami | Sep 4 | Fri | ~Aug 30 |
| Ganesh Chaturthi | Sep 14 | Mon | ~Sep 9 |
| Navratri begins | Oct 11 | Sun | ~Oct 6 |
| Dussehra | Oct 20 | Tue | ~Oct 15 |
| Karva Chauth | Oct 29 | Thu | ~Oct 24 |
| Dhanteras | Nov 6 | Fri | ~Nov 1 |
| **Diwali** | **Nov 8** | **Sun** | **~Nov 3** |
| Bhai Dooj | Nov 11 | Wed | ~Nov 6 |

*Cut-off = festival date minus 5 days (upper bound of the 3–5 day delivery window).
Shown as guidance; founder confirms against real dispatch capacity per festival.

**Priority tiers:**
- **Tier 1 (expanded campaigns):** Raksha Bandhan, Diwali (incl. Dhanteras run).
- **Tier 2 (standard campaigns):** Ganesh Chaturthi, Navratri/Dussehra, Karva Chauth.
- **Tier 3 (light tie-in only):** Janmashtami, Bhai Dooj.

---

## 4. Architecture — Two Layers

### 4a. Base layer — the pillar engine (always-on)
A fixed weekly rhythm of 4–5 posts that runs continuously Aug–Nov. Four rotating
pillars, each with a reusable caption template + hashtag set:

1. **Product Spotlight** — one hero SKU: story, price, link. (Real catalog items.)
2. **Behind-the-Build** — the printing process, "made fresh in Agra," time-lapse
   reel concepts, material story.
3. **Customer Love / Social Proof** — reviews, unboxings, gifting moments; includes
   UGC-request prompts.
4. **Festival Tie-in** — bridges a product to the nearest upcoming festival.

Default weekly cadence (trim to 🔴 must-post when busy):
- 🔴 Mon — Product Spotlight (static/carousel)
- ⚪ Wed — Behind-the-Build (reel)
- 🔴 Fri — Festival Tie-in (reel or carousel)
- ⚪ Sat/Sun — Customer Love (static/story)
- Stories: 3–4×/week, prompts supplied.

### 4b. Peak layer — festival campaign bursts
At each festival, a concentrated burst drops on top of the base rhythm, timed
backward from the date. **Standard 5-beat template:**

| Beat | Timing | Content |
|---|---|---|
| Teaser | T−7 | "Gifting season is here" + relevant collection |
| Hero | T−5 | Hero-product reel |
| Offer | T−3 | Offer/bundle **+ WhatsApp broadcast #1** *(offer = placeholder)* |
| Last chance | T−1 | "Order today to arrive before [festival]" (ties to ship cut-off) |
| Greeting | Day 0 | Festival greeting, pure brand love, no sell **+ WhatsApp broadcast #2** |

Tier 1 festivals (Rakhi, Diwali) get extra beats (early "gift guide" carousel,
countdown stories). Tier 3 collapse to a single tie-in + greeting.

**Layer interaction (collision rule):** during a festival's active burst window,
the burst beats *replace* the base-layer slots for those days rather than posting on
top of them — so weekly volume stays at 4–5, not doubled. Outside burst windows, the
base rhythm runs alone. The master calendar (`00-season-calendar.md`) resolves every
day to a single source of truth so there is never a "which post today?" ambiguity.

---

## 5. Offers

Founder is running festival discounts. Campaigns include **offer beats with clearly
marked placeholders** — e.g. `{{RAKHI_OFFER: e.g. 10% off orders above ₹999}}` — so
the founder fills exact numbers/terms. Where no offer applies, the beat falls back to
value/urgency messaging (craft, personalization, "made fresh in Agra," ship cut-off).

Each offer beat also flags: coupon code (if any), validity window, and whether it
applies to COD + Razorpay both.

---

## 6. WhatsApp Approach (manual)

Zero-risk, manual send. Deliverables:
- **Broadcast copy** for each festival (2 per Tier-1/2 campaign), respecting WhatsApp
  norms: opt-in audiences only, personal tone, not spam, clear CTA + link.
- **Status/story series** copy (WhatsApp Status mirrors IG Stories cadence).
- **List-building note:** short, ethical guidance on growing an opt-in broadcast list
  (order-confirmation opt-in, "message us to join drops," never scraped numbers).

No API, no automation — the founder pastes and sends from WhatsApp Business.

---

## 7. Deliverables & File Structure

All under `docs/social/` in the repo:

```
docs/social/
├── README.md                  How to use everything; the weekly ritual
├── 00-season-calendar.md      Master day-by-day grid (Aug 24 – Nov 12), must-post flags
├── 01-content-pillars.md      Pillar defs + reusable caption/hashtag templates
├── 02-rakhi-campaign.md       Tier-1: full expanded 5-beat + WhatsApp + offer slots
├── 03-janmashtami-ganesh.md   Tier-3 + Tier-2 campaigns
├── 04-navratri-dussehra.md    Tier-2 campaigns
├── 05-diwali-season.md        Tier-1: Dhanteras→Diwali→Bhai Dooj expanded + Karva Chauth
├── 06-whatsapp-playbook.md    Broadcast copy + status series + list-building note
└── 07-image-shotlist.md       Photos/reels to capture, mapped to specific posts
```

**Content conventions:**
- Each post entry = { date, pillar/beat, format, 🔴/⚪ flag, caption, hashtag set,
  image ref → shotlist, product link + price }.
- Captions in the brand's warm, gift-focused Indian-market voice.
- Prices/links pulled from live catalog; re-verify before posting (catalog can change).
- Hashtag sets built on the existing Pinterest strategy, rotated to avoid staleness.

---

## 8. Assumptions & Risks

- **Assumption:** 4–5 posts/week is sustainable; plan degrades gracefully to must-post
  core if not.
- **Assumption:** Festival dates are the general-observance panchang dates; regional
  variation possible — founder adjusts if their audience skews to a specific region.
- **Risk — shipping cut-offs:** if real dispatch is slower than 5 days, "arrive before"
  claims mislead. Mitigation: cut-offs shown as guidance, founder confirms per festival.
- **Risk — offer placeholders left unfilled:** posts would ship with `{{...}}` visible.
  Mitigation: README ritual step "fill or delete all `{{ }}` before posting"; calendar
  flags which posts contain placeholders.
- **Risk — catalog drift:** prices/SKUs change. Mitigation: "re-verify price/link"
  reminder baked into each spotlight entry.

---

## 9. What Success Looks Like (post-implementation)

The founder opens `docs/social/00-season-calendar.md` each Sunday, sees the week's
posts, opens the referenced campaign file for full copy, captures the images from the
shotlist, fills any offer placeholder, and posts/sends across the week — a repeatable
system that outlives this one season.
