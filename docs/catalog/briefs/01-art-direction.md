# Tathastu Keepsakes — Catalog Art Direction

**Print catalog visual system for 3D-printed keepsakes**  
**Location:** Agra, India  
**Format:** Premium product catalog

---

## Color Palette

Our brand colors reflect craftsmanship, heritage, and modern precision:

- **Petrol Teal** `#1F717A` — Primary brand color, accent elements, section dividers
- **Violet** `#4B2C78` — Secondary accent, category headers, premium highlights
- **Ink** `#16182B` — Body text, product descriptions, technical details
- **Surface** `#F8FAFC` — Page backgrounds, negative space
- **White** `#FFFFFF` — Photo backgrounds, clean product showcase areas
- **Soft Wash** `#EAF8F9` — Subtle tints, pricing panels, gentle backgrounds

**Usage:**
- Avoid pure black — use Ink (#16182B) for all text
- Petrol Teal for all primary branding touchpoints
- Violet sparingly for premium tier products or special collections
- Surface provides breathing room; never fill entire pages with color

---

## Typography Roles

### Display Title
**Purpose:** Product name, hero statements  
**Style:** Bold, 24–32pt, tracking +20, Petrol Teal or Ink  
**Font recommendation:** Helvetica Bold / Arial Bold (PIL-safe)

### Body Text
**Purpose:** Product descriptions, material details, care instructions  
**Style:** Regular, 10–11pt, line height 1.5, Ink color  
**Font recommendation:** Helvetica / Arial (PIL-safe)

### Price (Tabular)
**Purpose:** Pricing display  
**Style:** Medium, 14–16pt, tabular figures, Ink or Petrol Teal  
**Font recommendation:** Helvetica / Arial with fixed-width number rendering  
**Rule:** Prices come **ONLY** from `products-source.json` — never invented or estimated

### Category Eyebrow
**Purpose:** Product category labels (e.g., "Miniatures", "Wall Art", "Home Décor")  
**Style:** Uppercase, 8–9pt, tracking +50, Violet or Petrol Teal  
**Font recommendation:** Helvetica Bold / Arial Bold

---

## Page Format Recommendation

**Chosen format:** **A4 Landscape (297mm × 210mm)**

### Justification:
1. **Visual balance** — Landscape provides a natural 1:1 ratio for text-left, photo-right layout
2. **Product showcase** — 3D printed items often have horizontal dimension; landscape complements product aspect ratios
3. **Premium feel** — Coffee-table catalog aesthetic; more gallery-like than portrait
4. **Reading comfort** — Shorter line lengths on left panel improve readability
5. **Print efficiency** — Standard A4 stock, widely available, cost-effective

---

## Page Template Structure

### Two-Panel Layout

**LEFT PANEL (Copy):**
- Width: ~130mm (43% of page width)
- Contains: Category eyebrow, product name, description, price, material/size specs
- Margin from left edge: 15mm
- Margin from center gutter: 10mm

**RIGHT PANEL (Photograph):**
- Width: ~130mm (43% of page width)
- Contains: Hero product photo on white or soft wash background
- Margin from right edge: 15mm
- Margin from center gutter: 10mm

**CENTER GUTTER:**
- 7mm breathing space between panels
- Optional: hairline vertical rule in Surface color

---

## Print Specifications

### Margins & Safe Zones

**Outer margins:**
- Top: 15mm
- Bottom: 15mm
- Left: 15mm
- Right: 15mm

**Safe zone (critical content):**
- Inset 5mm from all outer margins (i.e., 20mm from page edge)
- No text or essential elements beyond safe zone
- Background colors/images can bleed to edge

**Grid:**
- 6-column grid (each column ~42mm)
- Baseline grid: 5mm increments
- All type aligns to baseline grid for visual rhythm

**Bleed:**
- 3mm bleed on all sides if printing with full-bleed photos
- Extend backgrounds 3mm beyond trim marks

---

## Photo Treatment Rules

### Photography Style
- **Clean, honest product photography** — no artifice, no clichés
- **White or Soft Wash backgrounds** — product is hero, not the backdrop
- **Soft, natural lighting** — avoid harsh shadows
- **Single product focus** — one item per photo (exceptions: sets or collections)

### Editing Guidelines
- ✅ **Soft vignette OK** — gentle fade at edges to draw eye to product
- ✅ **Color correction** — ensure accurate representation of 3D print material colors
- ✅ **Subtle shadows** — grounding shadow beneath product for depth
- ❌ **No neon or purple AI cliché gradients** — keep it real
- ❌ **No invented props** — no fake flowers, books, or random objects
- ❌ **No over-stylized composites** — product should feel tangible

### Technical Requirements
- Minimum 300 DPI at print size
- sRGB color space (for print conversion to CMYK by printer)
- Square or 3:4 aspect ratio preferred

---

## Cover & Back Cover Concept

### Front Cover
**Layout:**
- Full-bleed hero image: signature 3D-printed product (e.g., intricate miniature or iconic keepsake)
- Overlay: Petrol Teal gradient (20% opacity) from bottom third upward
- Title: "Tathastu Keepsakes" in Display Title style (white or Surface color)
- Subtitle: "Crafted in Agra | 3D Printed Art & Keepsakes" in Body style
- Season/year: Small eyebrow text (e.g., "2026 Collection")

**Mood:** Premium, artisanal, timeless

### Back Cover
**Layout:**
- Soft Wash background
- Grid of 4–6 small product thumbnails (2×2 or 2×3) — teaser of inside products
- Contact information: address, phone, email, website in Body style
- QR code: links to online store or catalog PDF
- Tagline: "Memories, Reimagined" or similar brand statement in Violet

**Mood:** Welcoming, informative, actionable

---

## Critical Rules

1. **Never invent prices** — all pricing data must come from `products-source.json`
2. **Maintain brand color palette** — no arbitrary colors
3. **Consistency** — every product page follows the same LEFT-copy, RIGHT-photo template
4. **Bleed & safe zones** — respect print margins; critical content stays in safe zone
5. **Honest photography** — no misleading edits, no props, no AI kitsch

---

## Implementation Notes for Automated Generation

- See `theme.json` for machine-readable design tokens
- PIL/reportlab scripts should reference theme.json for colors, fonts, dimensions
- Page template can be implemented as a reusable function/class
- Photo processing pipeline: crop → resize → vignette → place in right panel
- Price rendering: fetch from products-source.json, format with currency symbol

---

**Version:** 1.0  
**Last updated:** August 2026  
**Owner:** Art Direction / Print Production
