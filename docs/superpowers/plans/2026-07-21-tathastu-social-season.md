# TathastuKeepsakes Rakhi→Diwali Social Season — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a complete, copy-paste-ready Instagram + WhatsApp content system (8 markdown files under `docs/social/`) covering TathastuKeepsakes' Aug 28 – Nov 11, 2026 festival season.

**Architecture:** Content-only deliverables (no app code). An always-on 4-pillar weekly engine forms the base; festival campaign bursts replace base slots during their windows. One master calendar resolves each day to a single post. All captions reference the REAL catalog and REAL URL patterns.

**Tech Stack:** Markdown files only. No build, no tests-as-code. "Verification" per task = a concrete content checklist (real product IDs/prices, no unfilled placeholders except intentional `{{OFFER}}` slots, correct dates, correct link patterns).

## Global Constraints

- **Brand voice:** warm, gift-focused, Indian-market, festival-aware. Tagline: *"If it exists, we can print it."* Origin: **made fresh to order in Agra**.
- **Real categories ONLY:** `pooja-decor`, `keyrings`, `lamps`, `organizers`, `planters`, `gaming`. Do NOT invent "couple-gifts", "lithophane", "photo-frame", "moon-lamp" SKUs — they do not exist in the catalog.
- **Category link pattern:** `https://www.tathastukeepsakes.in/products?category=<slug>`
- **Product link pattern:** `https://www.tathastukeepsakes.in/products/<id>` (e.g. `/products/pooja-decor-ganesha`)
- **Other links:** bulk → `/bulk-order`; custom → `/custom-3d-printing`.
- **Prices are ₹, exact from catalog.** Every product mention includes a "re-verify price/link before posting" implicit reminder (stated once in README, not repeated per post).
- **Offers = placeholders:** write as `{{RAKHI_OFFER: e.g. 10% off orders above ₹999}}`. Never invent a discount number.
- **Festival dates (verified, locked):** Rakhi Aug 28 (Fri), Janmashtami Sep 4 (Fri), Ganesh Chaturthi Sep 14 (Mon), Navratri begins Oct 11 (Sun), Dussehra Oct 20 (Tue), Karva Chauth Oct 29 (Thu), Dhanteras Nov 6 (Fri), Diwali Nov 8 (Sun), Bhai Dooj Nov 11 (Wed).
- **Ship cut-off rule:** festival date − 5 days, shown as guidance.
- **WhatsApp:** manual send only; opt-in audiences; no automation/API.
- **Collision rule:** during a festival burst window, burst beats REPLACE base-layer slots (weekly volume stays 4–5).
- **Every file commits on branch `social/rakhi-diwali-season`.**

## Reference: Real Catalog (use these, verify before posting)

**pooja-decor (₹299–1499):** Golden Ganesha Idol ₹899 `pooja-decor-ganesha` · Mahalakshmi Idol on Lotus ₹1099 `pooja-decor-lakshmi` · Bal Krishna Idol ₹799 `pooja-decor-krishna` · Maa Saraswati Idol ₹999 `pooja-decor-saraswati` · Meditating Mahadev Idol ₹1199 `pooja-decor-shiva` · Shiva Trishul & Om Stand ₹699 `pooja-decor-trishul` · Lotus Incense Holder ₹299 `pooja-decor-incense` · Kedarnath Temple Miniature ₹1499 `pooja-decor-temple` · Shrikrishna Devotional Sign ₹499 `pooja-decor-sign`

**keyrings (₹129–199, most customizable):** Custom Name Keychain ₹199 `keyrings-name` · Mahadev Face Keychain ₹149 `keyrings-shiva` · Custom Number Plate Keychain ₹199 · Piano Keys ₹149 · Pop-It Fidget ₹129 · +9 more

**lamps (₹1699–3199):** Lunar Night Lamp ₹1699 `lamps-lunar` (verify id) · Glow Arc Pendant Lamp ₹1999 `lamps-glow-arc` · Rustic Charm Lamp ₹2299 `lamps-lamp1` · Modern Elegance Lamp ₹2499 `lamps-lamp2` · Artistic Designer Lamp ₹3199 `lamps-lamp4`

**planters (₹699–3499):** Urban Pocket Pot Set ₹699 · Wall Bloom Hanging ₹899 · CACTIA Cactus ₹1499 · STEMRA Stackable ₹2199

**organizers (₹799–2199):** Cable Den Desk Tidy ₹799 · StackDesk Pro ₹999 · Multi-Purpose Desk Organizer ₹1899

**gaming (₹149–199):** Captain America Shield ₹199 · Gamepad ₹179 · AK-47 ₹179 · Toad ₹199

> Executor: before writing any product into a caption, confirm its `id` and `price` against `lib/products.json`. The list above is a curated starting set; ids marked "verify" must be checked.

---

### Task 1: Scaffold `docs/social/README.md` — the operating manual

**Files:**
- Create: `docs/social/README.md`

**Interfaces:**
- Produces: the entry-point doc every other file references. Defines the weekly ritual, the 🔴/⚪ flag legend, the `{{OFFER}}` placeholder rule, and the "re-verify price/link" reminder.

- [ ] **Step 1: Write the README** with these exact sections:
  - **What this is** — one paragraph: manual IG + WhatsApp season system, Aug–Nov 2026.
  - **The weekly ritual** — numbered: (1) Open `00-season-calendar.md` each Sunday. (2) Read the week's rows. (3) Open the referenced campaign file for full copy. (4) Capture images from `07-image-shotlist.md`. (5) Fill or DELETE every `{{ }}` placeholder. (6) Re-verify each product price/link against the live site. (7) Post/send across the week.
  - **Legend** — 🔴 must-post (do this even on your busiest week) · ⚪ optional (post if you have time).
  - **Placeholder rule** — `{{OFFER: ...}}` means insert your real discount or delete the beat. Never post a live `{{ }}`.
  - **File index** — bullet list of all 8 files with one-line purpose each.
  - **Golden rules** — real products only; link pattern reminder; WhatsApp = opt-in only, never post to strangers; festivals sell on craft + personalization, not just price.

- [ ] **Step 2: Verify** — file contains all 6 ritual steps, the legend, the placeholder rule, and an 8-file index. No `{{ }}` left unexplained.

- [ ] **Step 3: Commit**
```bash
git add docs/social/README.md
git commit -m "docs(social): add README operating manual for season engine"
```

---

### Task 2: `docs/social/01-content-pillars.md` — the reusable engine

**Files:**
- Create: `docs/social/01-content-pillars.md`

**Interfaces:**
- Consumes: Global Constraints (voice, catalog, links).
- Produces: 4 pillar definitions, each with (a) purpose, (b) a fill-in-the-blank caption template, (c) 2 fully-written example captions using REAL products, (d) a rotating hashtag set. The campaign files (Tasks 4–7) and calendar (Task 8) reference these pillars by name.

- [ ] **Step 1: Write the 4 pillars.** For EACH pillar write purpose + template + 2 real examples + hashtag set:
  - **Product Spotlight** — examples: Golden Ganesha Idol ₹899 (`/products/pooja-decor-ganesha`) and Glow Arc Pendant Lamp ₹1999. Template has slots for {product}, {price}, {one-line story}, {link}, {CTA}.
  - **Behind-the-Build** — examples: "watch a Ganesha print layer by layer in our Agra workshop" (reel concept), "PLA filament → finished lamp in X hours". Emphasize made-to-order, eco PLA.
  - **Customer Love / Social Proof** — examples: repost-a-review template, UGC prompt ("tag us in your unboxing #TathastuKeepsakes"). Include a note that real reviews must be sourced from actual customers.
  - **Festival Tie-in** — examples: "Bring Bal Krishna home this Janmashtami ₹799", "personalized name keychain rakhi gift ₹199". Template bridges {product} → {festival} → {gifting emotion}.

- [ ] **Step 2: Write 3 rotating hashtag sets** (A/B/C, ~12 tags each) built on the existing Pinterest strategy: mix of brand (#TathastuKeepsakes #MadeInIndia), category (#PoojaDecor #3DPrinted), and intent (#GiftIdeas #CustomGifts #FestiveGifting). Instruct rotating A→B→C to avoid shadow-flagging.

- [ ] **Step 3: Verify** — 4 pillars present; every example uses a REAL product id + price from the reference list; 3 hashtag sets present; no invented SKUs; no unfilled placeholders (offer slots not used here).

- [ ] **Step 4: Commit**
```bash
git add docs/social/01-content-pillars.md
git commit -m "docs(social): add content-pillar engine with reusable templates"
```

---

### Task 3: `docs/social/07-image-shotlist.md` — what to capture

**Files:**
- Create: `docs/social/07-image-shotlist.md`

**Interfaces:**
- Consumes: pillar + campaign structure.
- Produces: named shot references (e.g. `SHOT-GANESHA-01`) that campaign files and the calendar point to, so "attach the image" is unambiguous.

- [ ] **Step 1: Write the shotlist** grouped as: (a) **Evergreen** shots reused all season (workshop/printing-in-progress, packaging, founder hands, PLA spools), (b) **Per-festival hero** shots (Rakhi: keychains + rakhi thread flatlay; Janmashtami/Ganesh: Ganesha & Krishna idols styled in a pooja setting; Diwali: Lakshmi idol + diya + lamp glow). Each entry = ID, description, format (photo/reel/carousel), which pillar/beat uses it.
- [ ] **Step 2: Add a "reels quick-guide"** — 5 reusable reel structures (time-lapse print, before/after room, unboxing, "3 gifts under ₹500", festival styling) with shot order and suggested trending-audio note (generic, since audio changes).
- [ ] **Step 3: Verify** — every hero shot maps to a real product/category; IDs are unique; formats specified.
- [ ] **Step 4: Commit**
```bash
git add docs/social/07-image-shotlist.md
git commit -m "docs(social): add image + reel shotlist mapped to posts"
```

---

### Task 4: `docs/social/02-rakhi-campaign.md` — Tier 1 (first & nearest)

**Files:**
- Create: `docs/social/02-rakhi-campaign.md`

**Interfaces:**
- Consumes: pillars (Task 2), shots (Task 3), Global Constraints.
- Produces: the fully-written Rakhi burst (Aug 21–28) that the calendar embeds.

- [ ] **Step 1: Write the expanded Rakhi burst** (Tier 1 = extra beats). For EACH beat: date, format, 🔴/⚪, full caption, hashtag set ref, shot ref, product link+price, and offer slot where applicable:
  - Aug 21 (Fri) — Gift-guide carousel "5 Rakhi gifts under ₹500" (real keychains ₹129–199 + Shrikrishna Sign ₹499). 🔴
  - Aug 23 (Sun) — **Ship cut-off day** last-order push: "Order by today to reach before Rakhi." 🔴
  - Aug 24 (Mon) — Hero reel: Custom Name Keychain ₹199 personalization. ⚪
  - Aug 25 (Tue) — Offer post `{{RAKHI_OFFER: e.g. 10% off + free Rakhi thread on orders above ₹499}}` **+ WhatsApp broadcast #1**. 🔴
  - Aug 27 (Thu) — Last-chance / COD reassurance (express metro note). 🔴
  - Aug 28 (Fri) — Rakhi greeting, no sell, brand love **+ WhatsApp broadcast #2**. 🔴
- [ ] **Step 2: Write both WhatsApp broadcasts** inline (opt-in tone, CTA, link).
- [ ] **Step 3: Verify** — dates match Aug 28 anchor; ship cut-off ≈ Aug 23 present; only real products; exactly the `{{RAKHI_OFFER}}` placeholder (no invented %); 2 WhatsApp messages present.
- [ ] **Step 4: Commit**
```bash
git add docs/social/02-rakhi-campaign.md
git commit -m "docs(social): add expanded Raksha Bandhan campaign + WhatsApp"
```

---

### Task 5: `docs/social/03-janmashtami-ganesh.md` — Tier 3 + Tier 2

**Files:**
- Create: `docs/social/03-janmashtami-ganesh.md`

**Interfaces:**
- Consumes: pillars, shots. Produces: Janmashtami (light) + Ganesh Chaturthi (standard) bursts.

- [ ] **Step 1: Janmashtami (Sep 4, light — tie-in + greeting):** Aug 31 tie-in (Bal Krishna Idol ₹799 `pooja-decor-krishna`, ship cut-off ~Aug 30 noted as tight → push COD/express); Sep 4 greeting. Optional `{{JANMASHTAMI_OFFER}}` slot.
- [ ] **Step 2: Ganesh Chaturthi (Sep 14, standard 5-beat):** T−7 Sep 7 teaser (pooja-decor collection); T−5 Sep 9 hero reel Golden Ganesha ₹899; T−3 Sep 11 offer `{{GANESH_OFFER}}` **+ WhatsApp #1**; T−1 Sep 13 last-chance; Sep 14 greeting **+ WhatsApp #2**. Each beat full caption + refs.
- [ ] **Step 3: Verify** — real Ganesha/Krishna ids + prices; dates match anchors; placeholders marked; WhatsApp copy present for Ganesh.
- [ ] **Step 4: Commit**
```bash
git add docs/social/03-janmashtami-ganesh.md
git commit -m "docs(social): add Janmashtami + Ganesh Chaturthi campaigns"
```

---

### Task 6: `docs/social/04-navratri-dussehra.md` — Tier 2

**Files:**
- Create: `docs/social/04-navratri-dussehra.md`

**Interfaces:**
- Consumes: pillars, shots. Produces: Navratri (Oct 11–18) + Dussehra (Oct 20) bursts.

- [ ] **Step 1: Navratri (standard, 9-night arc):** Oct 4 teaser (Maa Saraswati ₹999, Mahalakshmi ₹1099); Oct 6 ship cut-off push; Oct 8 hero reel; Oct 9 offer `{{NAVRATRI_OFFER}}` **+ WhatsApp #1**; daily story prompts across Oct 11–18 (list 9 quick story ideas); note Durga Ashtami Oct 19. Full captions for the 4 feed posts.
- [ ] **Step 2: Dussehra (Oct 20, light tie-in + greeting):** Oct 18 tie-in ("good over evil" + pooja-decor); Oct 20 greeting **+ WhatsApp #2 (combined Navratri-Dussehra broadcast)**.
- [ ] **Step 3: Verify** — real ids/prices; 9 story prompts; dates match; placeholders; WhatsApp present.
- [ ] **Step 4: Commit**
```bash
git add docs/social/04-navratri-dussehra.md
git commit -m "docs(social): add Navratri + Dussehra campaigns"
```

---

### Task 7: `docs/social/05-diwali-season.md` — Tier 1 (the big one)

**Files:**
- Create: `docs/social/05-diwali-season.md`

**Interfaces:**
- Consumes: pillars, shots. Produces: Karva Chauth (Oct 29) + the expanded Dhanteras→Diwali→Bhai Dooj run (Nov 1–11) — the season's revenue peak.

- [ ] **Step 1: Karva Chauth (Oct 29, light):** Oct 27 tie-in (personalized keychain / lamp as gift-for-her); Oct 29 greeting. `{{KARVACHAUTH_OFFER}}` optional.
- [ ] **Step 2: Diwali expanded run:** Oct 30 "Diwali gifting store is open" gift-guide carousel; Nov 1 Dhanteras teaser + **ship cut-off ~Nov 3** emphasized; Nov 3 hero reel (Mahalakshmi Idol ₹1099 + lamp glow); Nov 4 corporate/bulk Diwali gifting post (`/bulk-order`) **+ WhatsApp #1**; Nov 5 offer `{{DIWALI_OFFER}}`; Nov 6 Dhanteras "auspicious buy" post; Nov 7 last-chance; Nov 8 Diwali greeting (no sell) **+ WhatsApp #2**; Nov 11 Bhai Dooj tie-in (sibling gifts, callback to Rakhi keychains). Full caption per beat.
- [ ] **Step 3: Write countdown story series** (Nov 1–8, one prompt/day) + 2 WhatsApp broadcasts inline.
- [ ] **Step 4: Verify** — real Lakshmi/lamp ids + prices; Dhanteras Nov 6 & Diwali Nov 8 anchors correct; bulk link `/bulk-order`; `{{DIWALI_OFFER}}` placeholder only; countdown = 8 prompts; 2 WhatsApp messages.
- [ ] **Step 5: Commit**
```bash
git add docs/social/05-diwali-season.md
git commit -m "docs(social): add Karva Chauth + expanded Diwali season run"
```

---

### Task 8: `docs/social/06-whatsapp-playbook.md` — consolidated WhatsApp + list-building

**Files:**
- Create: `docs/social/06-whatsapp-playbook.md`

**Interfaces:**
- Consumes: the per-festival WhatsApp copy from Tasks 4–7.
- Produces: one place for all broadcast copy + ethical list-building guidance + status cadence.

- [ ] **Step 1: Consolidate** all festival broadcast messages (copy them here too, indexed by festival — the campaign files are the in-context copy; this is the master list for quick sending).
- [ ] **Step 2: List-building note** — ethical opt-in only: order-confirmation opt-in checkbox idea, "message us to join festive drops" story CTA, never-scrape rule, WhatsApp policy caution (broadcast lists vs groups, 256 limit, personal-tone to avoid blocks).
- [ ] **Step 3: Status cadence** — how often to post WhatsApp Status during bursts (mirror IG stories), with 6 reusable status ideas.
- [ ] **Step 4: Verify** — every festival's broadcasts present; list-building note covers opt-in + policy; no automation/API implied; placeholders consistent with campaign files.
- [ ] **Step 5: Commit**
```bash
git add docs/social/06-whatsapp-playbook.md
git commit -m "docs(social): add consolidated WhatsApp playbook + list-building"
```

---

### Task 9: `docs/social/00-season-calendar.md` — the master grid (LAST, depends on all)

**Files:**
- Create: `docs/social/00-season-calendar.md`

**Interfaces:**
- Consumes: EVERY prior file (pillars, all campaigns, shotlist, WhatsApp). This is the single source of truth per day; it must not contradict any campaign file.
- Produces: the day-by-day table the founder opens first.

- [ ] **Step 1: Write the master calendar** as weekly tables Aug 24 – Nov 12, columns: Date | Day | Post (pillar or festival beat) | Format | 🔴/⚪ | File ref | Shot ref | WhatsApp?. Apply the collision rule: on burst days show ONLY the burst beat (no doubled base post). Fill non-burst days with the base pillar rotation (Mon Spotlight / Wed Build / Fri Tie-in / weekend Customer Love).
- [ ] **Step 2: Add "must-post core" summary** — a trimmed list of only 🔴 rows per week for busy weeks.
- [ ] **Step 3: Add ship-cut-off banner row** before each festival.
- [ ] **Step 4: Verify (cross-file consistency):** every festival beat's date matches its campaign file exactly; no day has two feed posts during a burst; all File refs point to real filenames; all Shot refs exist in Task 3; festival anchor dates match Global Constraints.
- [ ] **Step 5: Commit**
```bash
git add docs/social/00-season-calendar.md
git commit -m "docs(social): add master season calendar (single source of truth)"
```

---

### Task 10: Final consistency sweep + season index update

**Files:**
- Modify: `docs/social/README.md` (confirm 8-file index matches reality)

- [ ] **Step 1: Cross-check** all 8 files exist and are committed; grep for accidental unfilled placeholders that AREN'T intentional `{{OFFER}}` slots; grep for banned invented SKUs (`couple-gift`, `lithophane`, `moon lamp`, `photo frame`) and remove/replace any that leaked.
```bash
cd "$(git rev-parse --show-toplevel)"
rg -n "\{\{" docs/social/ | rg -v "OFFER"   # should return only intentional non-offer slots or nothing
rg -ni "lithophane|couple.gift|moon lamp|photo frame" docs/social/  # should return NOTHING
ls docs/social/   # should list all 8 files
```
- [ ] **Step 2: Fix** anything the greps surface.
- [ ] **Step 3: Commit** (only if changes)
```bash
git add docs/social/
git commit -m "docs(social): final consistency sweep across season files"
```
- [ ] **Step 4: Report** to founder: files created, how to start (open `00-season-calendar.md`), and the list of `{{OFFER}}` placeholders they must fill.

---

## Self-Review (completed by planner)

**Spec coverage:** ✅ Pillars (T2), festival bursts all tiers (T4–7), manual WhatsApp (T4–8), calendar (T9), shotlist (T3), offers-as-placeholders (throughout), README ritual (T1), collision rule (T9), ship cut-offs (T4–9). Every spec §4–7 item maps to a task.

**Placeholder scan:** Only intentional `{{OFFER}}` slots remain, guarded by the Task 10 grep. No "TBD/TODO/implement later" in deliverables.

**Type/name consistency:** File names consistent across all tasks (`00`–`07` + README); pillar names identical in T2/T9; shot-ID convention (`SHOT-*`) defined T3, referenced T4–9; product ids/prices sourced from one reference block; festival dates identical in Global Constraints and every campaign task.

**Sequencing:** README → pillars/shotlist (foundations) → campaigns (depend on both) → WhatsApp consolidation → calendar (depends on all) → sweep. Calendar is last because it must not contradict any campaign file.
