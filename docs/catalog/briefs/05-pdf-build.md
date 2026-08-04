# PDF Catalog Build Guide

## Overview

This document describes how to regenerate the Tathastu product catalog PDF from PNG images.

## 📁 File Structure

```
docs/catalog/
├── pages/              # Source PNG images
│   ├── cover.png       # Front cover (required)
│   ├── section-*.png   # Optional section dividers
│   ├── page-*.png      # Product pages (auto-sorted)
│   └── back-cover.png  # Back cover (required)
├── exports/            # Generated outputs
│   ├── tathastu-product-catalogue.pdf  # Final PDF
│   └── catalogue-preview.html          # HTML preview
└── briefs/
    └── 05-pdf-build.md # This file
```

## 🔧 Requirements

The script auto-installs dependencies, but you can manually install them:

```bash
pip install img2pdf pillow
```

**Dependencies:**
- `img2pdf` - High-quality PDF assembly (no re-encoding)
- `Pillow` (PIL) - Image validation and processing

## 🚀 How to Regenerate the PDF

### Quick Start

```bash
cd /Users/akshat.garg/Documents/GitHub\ new/Tathastu
python3 scripts/catalog/assemble-catalog-pdf.py
```

### What the Script Does

1. **Polls for images** (up to 4 minutes)
   - Waits for `cover.png` and `back-cover.png` to appear
   - Monitors `docs/catalog/pages/` directory

2. **Orders images correctly**
   - `cover.png` (first)
   - `section-*.png` (alphabetically)
   - `page-*.png` (numerically sorted)
   - `back-cover.png` (last)

3. **Validates images**
   - Checks resolution (warns if < 1000px)
   - Checks aspect ratio (warns if far from A4)
   - Verifies all images are readable

4. **Creates outputs**
   - `tathastu-product-catalogue.pdf` - Final A4-sized PDF
   - `catalogue-preview.html` - Interactive HTML preview with left/right spreads

## 📋 Image Specifications

### Recommended Settings

- **Format:** PNG (24-bit color with transparency)
- **Resolution:** 2480 × 3508 px (A4 at 300 DPI)
- **Color Space:** sRGB
- **Aspect Ratio:** ~0.707 (A4 ratio)

### Minimum Requirements

- Width: ≥ 1000px
- Height: ≥ 1000px
- File must be readable by PIL

### Naming Conventions

| File Type | Pattern | Example | Sort Order |
|-----------|---------|---------|------------|
| Cover | `cover.png` | `cover.png` | First |
| Section Divider | `section-*.png` | `section-sarees.png` | Alphabetical |
| Product Page | `page-*.png` | `page-001.png` | Numerical |
| Back Cover | `back-cover.png` | `back-cover.png` | Last |

**Important:** Use zero-padded numbers for pages (e.g., `page-001.png`, `page-002.png`) to ensure correct sorting.

## 🎨 HTML Preview

The HTML preview shows pages in a **left/right spread layout** similar to how they would appear in a printed book:

- **Desktop view:** Two pages side-by-side
- **Mobile view:** Stacked vertically
- **Features:** Dark theme, page numbers, navigation

**To view:**
```bash
open docs/catalog/exports/catalogue-preview.html
# or
python3 -m http.server 8000
# then open http://localhost:8000/docs/catalog/exports/catalogue-preview.html
```

## 🔄 Typical Workflow

### After Designing New Pages

1. Export PNG images from your design tool (Figma, Canva, etc.)
2. Save to `docs/catalog/pages/` with correct naming
3. Run the assembly script:
   ```bash
   python3 scripts/catalog/assemble-catalog-pdf.py
   ```
4. Check HTML preview for layout issues
5. Review the final PDF

### Automated Pipeline Integration

The script can be integrated into CI/CD or watch scripts:

```bash
# Watch for changes and auto-rebuild
while true; do
  python3 scripts/catalog/assemble-catalog-pdf.py
  sleep 60
done
```

## 📊 Script Output

The script provides detailed feedback:

```
============================================================
🎨 Tathastu Product Catalog PDF Assembly
============================================================
📂 Polling docs/catalog/pages for catalog images...
✓ Found cover, back-cover, and 12 product pages

📋 Found 14 images:
   1. cover.png
   2. page-001.png
   3. page-002.png
   ...
   13. page-012.png
   14. back-cover.png

📄 Creating PDF with 14 pages...
✅ PDF created: docs/catalog/exports/tathastu-product-catalogue.pdf

🌐 Creating HTML preview...
✅ HTML preview created: docs/catalog/exports/catalogue-preview.html

============================================================
📊 ASSEMBLY SUMMARY
============================================================
✅ PDF: docs/catalog/exports/tathastu-product-catalogue.pdf
   Size: 8.45 MB
   Pages: 14
✅ HTML Preview: docs/catalog/exports/catalogue-preview.html
   Open in browser for spot checks
============================================================
```

## ⚠️ Troubleshooting

### "No images found to assemble"
- Check that images are in `docs/catalog/pages/`
- Verify file names match the patterns above
- Ensure files are PNG format

### "Low resolution" warning
- Export images at higher DPI (300+ recommended)
- Use 2480×3508px for perfect A4 quality

### "Unusual aspect ratio" warning
- Check that images are A4 proportions (~0.707 ratio)
- Resize or crop images to match A4 dimensions

### PDF file is too large
- Consider reducing image DPI (but not below 150)
- Optimize PNGs before assembly using tools like `pngquant`
- Use JPEG for photo-heavy pages (but update script)

## 🔐 Version Control

**Recommended `.gitignore` entries:**
```gitignore
# Ignore generated outputs (rebuild from source)
docs/catalog/exports/*.pdf
docs/catalog/exports/*.html

# Keep source images
!docs/catalog/pages/*.png
```

This ensures source images are versioned but generated files are rebuilt on demand.

## 📚 Related Documents

- `01-project-overview.md` - Catalog project introduction
- `02-design-guidelines.md` - Design specifications
- `03-content-strategy.md` - Product descriptions and copy
- `04-image-export.md` - Exporting from design tools

## 🛠 Advanced Customization

### Changing Page Size

Edit the script's `A4_WIDTH_PX` and `A4_HEIGHT_PX` constants, or modify the img2pdf size:

```python
# For US Letter (8.5" × 11")
letter_size = (img2pdf.in_to_pt(8.5), img2pdf.in_pt(11))
layout_fun = img2pdf.get_layout_fun(letter_size)
```

### Adding Metadata

Add PDF metadata by modifying the `create_pdf()` function:

```python
# Add after imports
from datetime import datetime

# In create_pdf function
metadata = {
    "title": "Tathastu Product Catalogue",
    "author": "Tathastu",
    "subject": "Product Catalog",
    "keywords": ["saree", "ethnic wear", "catalog"],
    "created": datetime.now()
}
```

### Different Output Formats

The script uses `img2pdf` for maximum quality. Alternative approaches:

- **ReportLab:** More control, but requires layout code
- **PIL PDF save:** Simple but less control
- **PyPDF2:** For merging existing PDFs

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the script's inline comments
3. Verify image files meet specifications
4. Check Python and dependency versions

---

**Last Updated:** August 4, 2026  
**Script Location:** `scripts/catalog/assemble-catalog-pdf.py`  
**Maintainer:** Tathastu Development Team
