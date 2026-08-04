# Product Catalog Generation

## Overview

This directory contains the automated product catalog generation pipeline for Tathastu Keepsakes. The catalog system transforms structured product data into a print-ready PDF catalog with professional page layouts.

## What is the Catalog?

The catalog is a **multi-page PDF document** designed for:
- Print distribution (physical catalogs)
- Digital sharing via WhatsApp, email, and social media
- Customer browsing without internet access
- Trade shows and exhibitions
- Bulk order references

Each catalog page features a **consistent two-column layout**:
- **LEFT**: Product name, description, and price
- **RIGHT**: High-quality product photograph

## Pipeline Architecture

```
products-source.json
       ↓
[Product Data Processing]
       ↓
Page PNGs (one per product)
       ↓
[PDF Assembly]
       ↓
catalog.pdf (print-ready)
```

### Pipeline Stages

#### 1. Source Data (`products-source.json`)
- **Location**: `docs/catalog/briefs/products-source.json`
- **Format**: JSON array of product objects
- **Schema**:
  ```json
  {
    "id": "category-product-id",
    "name": "Product Name",
    "price": 1299,
    "originalPrice": 1599,
    "category": "category-name",
    "description": "Product description...",
    "image": "/images/products/category/product/image.jpg"
  }
  ```

#### 2. Page Generation
Each product is rendered as a **high-resolution PNG** (page image) with:
- Product photograph on the right side
- Product name, description, and pricing on the left side
- Consistent typography and spacing
- Brand colors and styling

#### 3. PDF Assembly
All page PNGs are compiled into a single multi-page PDF:
- One product per page
- Consistent margins and bleed areas
- Print-ready resolution (300 DPI recommended)

## Instagram Limitation

### Why We Can't Auto-Fetch Instagram Media

The pipeline **cannot automatically fetch product images from Instagram** without the **Instagram Graph API** for the following reasons:

1. **No Public API**: Instagram's oEmbed API returns HTML embed code, not raw media URLs
2. **Authentication Required**: Graph API requires:
   - Facebook App setup
   - Business Instagram account
   - Access tokens and permissions
3. **Rate Limits**: Public scraping is unreliable and violates Instagram's ToS

### Current Workaround

Product images are:
- **Manually downloaded** from Instagram posts
- **Stored locally** in `public/images/products/`
- **Referenced by path** in `products-source.json`

**Instagram metadata** (`instagram-media-seed.json`) is maintained for reference:
- Reel shortcodes for product showcase videos
- Profile handle verification
- Manual thumbnail paths

## Regeneration Commands

### Prerequisites
Ensure all scripts in `scripts/catalog/` are present and executable:

```bash
chmod +x scripts/catalog/*.js
# or
chmod +x scripts/catalog/*.ts
```

### Step 1: Update Product Data
Edit `docs/catalog/briefs/products-source.json` with new products or price changes.

### Step 2: Generate Page Images
```bash
# Generate PNG for each product (expected script)
npm run catalog:generate-pages
# or
node scripts/catalog/generate-pages.js
```

**Expected behavior**:
- Reads `products-source.json`
- Resolves product image paths
- Renders each product as a PNG page
- Outputs to `docs/catalog/pages/` (or similar)

### Step 3: Assemble PDF
```bash
# Compile all pages into a single PDF (expected script)
npm run catalog:build
# or
node scripts/catalog/build-pdf.js
```

**Expected behavior**:
- Reads all PNG pages from output directory
- Assembles them in product order (by category, then ID)
- Outputs `catalog.pdf` to `docs/catalog/` or `public/catalog/`

### Full Rebuild
```bash
# Clean, regenerate, and build (ideal workflow)
npm run catalog:clean
npm run catalog:generate-pages
npm run catalog:build
```

## Layout Specification

### Two-Column Design

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌──────────────┐   ┌───────────────┐  │
│  │              │   │               │  │
│  │  Product     │   │               │  │
│  │  Name        │   │   Product     │  │
│  │              │   │   Photo       │  │
│  │  Description │   │               │  │
│  │  text here   │   │   (right-     │  │
│  │  with full   │   │    aligned)   │  │
│  │  details...  │   │               │  │
│  │              │   │               │  │
│  │  ₹1,299      │   │               │  │
│  │  ₹1,599      │   │               │  │
│  │              │   │               │  │
│  └──────────────┘   └───────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### LEFT Column (Text)
- **Product Name**: Large, bold, prominent
- **Description**: 2-4 sentences, readable font size
- **Current Price**: Bold, highlighted (e.g., green or brand color)
- **Original Price**: Strikethrough, smaller, muted color
- **Spacing**: Generous padding for readability

### RIGHT Column (Photo)
- **Product Image**: High-resolution, fill-to-fit
- **Alignment**: Vertically and horizontally centered
- **Aspect Ratio**: Preserved (no stretching)
- **Background**: Neutral (white or light grey)

## Price Policy

### CRITICAL RULE: Never Invent Prices

**The catalog generation pipeline MUST:**
- ✅ Use prices **exactly as specified** in `products-source.json`
- ✅ Display `price` and `originalPrice` if both exist
- ✅ Display only `price` if `originalPrice` is missing
- ❌ **NEVER** calculate, estimate, or invent prices
- ❌ **NEVER** apply discounts or markup automatically

**If a product has no price**:
- Display "Price on Request" or "Contact for Pricing"
- DO NOT guess or use a default price

**Price Formatting**:
- Currency symbol: ₹ (Indian Rupee)
- Thousands separator: comma (e.g., ₹2,299)
- Decimals: Not used (products priced in whole rupees)

## Package.json Script Suggestion

**Note**: The following scripts are **proposed additions** to `package.json`. They assume the existence of corresponding script files in `scripts/catalog/`. **DO NOT modify `package.json` until these scripts are implemented and tested.**

### Suggested Scripts Block

```json
{
  "scripts": {
    "catalog:generate-pages": "node scripts/catalog/generate-pages.js",
    "catalog:build": "node scripts/catalog/build-pdf.js",
    "catalog:clean": "rm -rf docs/catalog/pages docs/catalog/catalog.pdf",
    "catalog:full": "npm run catalog:clean && npm run catalog:generate-pages && npm run catalog:build"
  }
}
```

**OR** (if using TypeScript with tsx):

```json
{
  "scripts": {
    "catalog:generate-pages": "tsx scripts/catalog/generate-pages.ts",
    "catalog:build": "tsx scripts/catalog/build-pdf.ts",
    "catalog:clean": "rm -rf docs/catalog/pages docs/catalog/catalog.pdf",
    "catalog:full": "npm run catalog:clean && npm run catalog:generate-pages && npm run catalog:build"
  }
}
```

### When to Add These Scripts

Only add the above scripts to `package.json` when:
1. ✅ `scripts/catalog/generate-pages.js` (or `.ts`) exists and works
2. ✅ `scripts/catalog/build-pdf.js` (or `.ts`) exists and works
3. ✅ You've tested each script independently
4. ✅ The output paths match your project structure

**Current Status**: Scripts **not yet implemented**. Create them first, then uncomment/add these script entries.

## Expected CLI Documentation

*This section documents the expected command-line interface for the catalog generation scripts (when implemented).*

### `generate-pages.js` (or `.ts`)

**Purpose**: Generate individual PNG page images for each product.

**Usage**:
```bash
node scripts/catalog/generate-pages.js [options]
# or
tsx scripts/catalog/generate-pages.ts [options]
```

**Expected Options**:
- `--input <path>`: Path to products JSON (default: `docs/catalog/briefs/products-source.json`)
- `--output <dir>`: Output directory for PNG pages (default: `docs/catalog/pages/`)
- `--dpi <number>`: Output DPI (default: `300`)
- `--width <px>`: Page width in pixels (default: `2550` for A4 @ 300 DPI)
- `--height <px>`: Page height in pixels (default: `3300`)

**Expected Output**:
```
docs/catalog/pages/
  ├── 001-lamps-lamp1.png
  ├── 002-lamps-lamp2.png
  ├── 003-organizers-organizer1.png
  └── ...
```

**Expected Console Output**:
```
[catalog] Reading products from: docs/catalog/briefs/products-source.json
[catalog] Found 62 products
[catalog] Rendering page 1/62: Rustic Charm Lamp
[catalog] Rendering page 2/62: Modern Elegance Lamp
...
[catalog] ✓ Generated 62 pages in docs/catalog/pages/
```

---

### `build-pdf.js` (or `.ts`)

**Purpose**: Assemble all PNG pages into a single PDF.

**Usage**:
```bash
node scripts/catalog/build-pdf.js [options]
# or
tsx scripts/catalog/build-pdf.ts [options]
```

**Expected Options**:
- `--input <dir>`: Directory containing PNG pages (default: `docs/catalog/pages/`)
- `--output <path>`: Output PDF path (default: `docs/catalog/catalog.pdf`)
- `--compress`: Enable PDF compression (default: `true`)

**Expected Output**:
```
docs/catalog/catalog.pdf (or public/catalog/catalog.pdf)
```

**Expected Console Output**:
```
[catalog] Reading pages from: docs/catalog/pages/
[catalog] Found 62 page images
[catalog] Assembling PDF...
[catalog] Page 1/62: 001-lamps-lamp1.png
[catalog] Page 2/62: 002-lamps-lamp2.png
...
[catalog] ✓ PDF saved to: docs/catalog/catalog.pdf (12.4 MB)
```

---

## Directory Structure

```
docs/catalog/
├── README.md                           ← You are here
├── briefs/
│   ├── products-source.json            ← Master product data
│   └── instagram-media-seed.json       ← Instagram reference (no media URLs)
├── pages/                              ← Generated PNG pages (gitignored)
│   ├── 001-lamps-lamp1.png
│   ├── 002-lamps-lamp2.png
│   └── ...
└── catalog.pdf                         ← Final output (gitignored)
```

**Note**: `*.md` files are gitignored in this project, but this README is **force-added** for documentation purposes. To stage it:

```bash
git add -f docs/catalog/README.md
```

---

## Dependencies (for future implementation)

Expected Node.js packages for catalog generation:

- **Page Rendering**:
  - `canvas` or `node-canvas` (for 2D drawing)
  - `sharp` (already installed, for image processing)
  - `puppeteer` or `playwright` (for HTML-to-PNG rendering)

- **PDF Assembly**:
  - `pdf-lib` (for PDF creation and manipulation)
  - `pdfkit` (alternative PDF generation library)

Install when implementing:
```bash
npm install canvas pdf-lib
# or
npm install puppeteer pdfkit
```

---

## Maintenance Notes

### Updating Products
1. Edit `products-source.json`
2. **Verify all image paths exist** in `public/images/`
3. Run `npm run catalog:full` (when scripts exist)

### Updating Layout/Design
Modify the rendering logic in `generate-pages.js` (or `.ts`):
- Font sizes, colors, and spacing
- Column widths and alignment
- Logo, branding elements

### Debugging
If pages fail to render:
- Check image paths in `products-source.json` (must start with `/`)
- Ensure images exist in `public/` directory
- Verify canvas/image processing dependencies are installed

---

## Future Enhancements

- [ ] Add cover page with brand logo and contact info
- [ ] Category separator pages (e.g., "Lamps", "Organizers")
- [ ] QR codes linking to product URLs
- [ ] Multi-language support (Hindi, English)
- [ ] Automated Instagram media fetching (with Graph API)
- [ ] Print shop integration (auto-upload to printer API)

---

## Questions?

For implementation details or troubleshooting, contact the development team or refer to:
- `scripts/catalog/` directory (when scripts are added)
- Main project README: `/README.md`
- Supabase product schema: `/supabase/migrations/`

---

**Last Updated**: 2026-08-04  
**Version**: 1.0.0  
**Status**: Documentation complete, scripts pending implementation
