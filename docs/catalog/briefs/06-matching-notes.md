# Instagram Reel to Catalog Product Matching Notes

**Date**: 2026-08-04  
**Source Reels**: `lib/instagram-reels.ts` (6 reels)  
**Catalog Source**: `docs/catalog/briefs/products-source.json` + `supabase/seed-products.sql`  
**Output**: `06-ig-product-map.json`

---

## Summary

Analyzed 6 Instagram reels from @tathastukeepsakes and matched them against the current product catalog.

**Results:**
- **1 High-Confidence Match**: Reel directly showcases a specific catalog product
- **1 Medium-Confidence Match**: Reel shows variant/use-case of a catalog product
- **4 No Matches**: Reels showcase categories, capabilities, or behind-the-scenes content rather than specific SKUs

---

## Matched Products

### High Confidence

#### Reel: `DbdUkO9BeFB` - "Custom name keychain reel"
- **Product**: `keyrings-name` - Custom Name Keychain (₹199)
- **Confidence**: HIGH
- **Reasoning**: Direct product showcase. The reel title explicitly mentions "custom name keychain" which is the exact name and offering of this catalog product.
- **Action Taken**: Copied `reel-2.jpg` → `public/images/catalog/ig-matched/keyrings-name.jpg` as alternate hero image for future use

### Medium Confidence

#### Reel: `DbaqVLGBeXJ` - "Couple initials keepsake reel"
- **Product**: `keyrings-name` - Custom Name Keychain (₹199)
- **Confidence**: MEDIUM
- **Reasoning**: Likely shows the same Custom Name Keychain product configured for couple initials rather than individual names. Different use case, same SKU.
- **Action Taken**: None (medium confidence, thumbnail already captured for primary match)

---

## Unmatched Reels

### Reel: `Dbf-GcnBa_-` - "Kids name decor reel"
- **Confidence**: NONE
- **Type**: Category showcase / customization capability demo
- **Note**: Showcases custom name decoration/personalization capability rather than a specific purchasable product. Represents a service or product category (custom name decor) not a single SKU in the current catalog.

### Reel: `DbIzZziB-iO` - "Letter name decor reel"
- **Confidence**: NONE
- **Type**: Category showcase / customization capability demo
- **Note**: Generic content about letter/name decoration. Similar to reel-1, this represents customization capability rather than a specific catalog product.

### Reel: `DbLhwQtBif2` - "Personalized nameplate collection reel"
- **Confidence**: NONE
- **Type**: Collection showcase
- **Note**: Displays multiple personalized items in one reel (portfolio/catalog overview). Not a single product match. Likely includes multiple products from the keyrings category (`keyrings-name`, `keyrings-numberplate`) and potentially customized rakhi items with names.

### Reel: `DaDOy7ehb92` - "3D printer workshop reel"
- **Confidence**: NONE
- **Type**: Behind-the-scenes / brand story
- **Note**: Workshop and manufacturing process content. Not a product showcase. Represents brand story, manufacturing capability, and quality assurance rather than any catalog SKU.

---

## Catalog Coverage Analysis

### Products NOT represented in Instagram reels:

**High-potential categories for future reel content:**
- **Lamps** (8 products: lamp1-lamp5, glow-arc, terra-glow, lunar-night) - No reels
- **Organizers** (8 products) - No reels  
- **Planters** (8 products) - No reels
- **Pooja Decor** (9 products) - No reels
- **Gaming keychains** (7 products) - No reels
- **Rakhi products** (12 customized rakhi items) - No reels

### Instagram Content Strategy Observation:

Current Instagram reels heavily focus on:
1. Custom personalization capability (name keychains, nameplates, letter decor)
2. Behind-the-scenes manufacturing/workshop content
3. Brand story and customization services

The catalog has 60+ distinct products across 8 categories, but Instagram content currently showcases only:
- 1-2 products from the keyrings category
- Generic personalization/customization services
- Workshop/brand story content

**Recommendation**: Consider creating product-specific reels for high-margin or trending items from underrepresented categories (lamps, planters, rakhi collection, gaming keychains) to drive catalog discovery and sales.

---

## Technical Notes

- All reel thumbnails exist in `public/images/reels/reel-{1-6}.jpg`
- High-confidence match thumbnail copied to `public/images/catalog/ig-matched/keyrings-name.jpg`
- No catalog product images were replaced (per instructions)
- All product IDs, names, and prices verified against `products-source.json` and `seed-products.sql`
- No products or prices were invented

---

## Future Work

1. **Create targeted product reels**: Focus on lamps, planters, and rakhi products
2. **Track reel performance**: Monitor which reels drive catalog clicks/conversions
3. **Refresh mapping**: Re-run this analysis when new reels are added
4. **A/B test thumbnails**: Consider using `ig-matched/*.jpg` as alternate hero images for keyrings-name product pages

---

**Analysis completed**: 2026-08-04  
**Analyst**: AI Agent  
**Status**: ✅ Complete
