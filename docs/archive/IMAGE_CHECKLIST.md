# Image Checklist

This document lists all image paths referenced in the codebase that need to be added to the `public/images/` directory.

## Required Images

### Hero Section
- [ ] `/images/hero/hero-banner.jpg` - Homepage hero banner (16:9, 8K recommended)

### Category Icons
- [ ] `/images/categories/fantasy-warrior.jpg` - Fantasy category icon (1:1, 400x400px min)
- [ ] `/images/categories/terrain-piece.jpg` - Terrain category icon (1:1, 400x400px min)
- [ ] `/images/categories/sci-fi-mech.jpg` - Sci-Fi category icon (1:1, 400x400px min)

### Watch & Shop Section
- [ ] `/images/watch-shop/printer-nozzle.jpg` - 3D printer nozzle close-up (3:4, 600x800px min)
- [ ] `/images/watch-shop/removing-supports.jpg` - Hands removing supports (3:4, 600x800px min)
- [ ] `/images/watch-shop/texture-closeup.jpg` - Macro texture shot (3:4, 600x800px min)
- [ ] `/images/watch-shop/design-process.jpg` - Design and modeling process (4:3, 1200x900px min)

### Product Images
- [ ] `/images/products/dragon.jpg` - Ancient Dragon Miniature (1:1, 800x800px min)
- [ ] `/images/products/dragon-2.jpg` - Dragon alternate angle (flexible aspect ratio)
- [ ] `/images/products/dragon-3.jpg` - Dragon detail shot (flexible aspect ratio)
- [ ] `/images/products/elven-archer.jpg` - Elven Archer Set (1:1, 800x800px min)
- [ ] `/images/products/castle-terrain.jpg` - Ruined Castle Terrain (1:1, 800x800px min)
- [ ] `/images/products/cyberpunk-hero.jpg` - Cyberpunk Hero (1:1, 800x800px min)
- [ ] `/images/products/stone-troll.jpg` - Stone Troll (1:1, 800x800px min)
- [ ] `/images/products/treasure-chest.jpg` - Treasure Chest (1:1, 800x800px min)

### About Section
- [ ] `/images/about/artisan-workshop.jpg` - Artisan workshop scene (4:3, 1200x900px min)

### Logo
- [ ] `/images/logo/logo-icon.svg` - Brand logo icon (SVG format, scalable)

## Image Generation Tips

1. **Use AI Image Generators**: Midjourney, DALL-E, or Stable Diffusion
2. **Follow the prompts** in `public/images/README.md`
3. **Maintain consistency**: Use similar lighting and color grading across all images
4. **Optimize for web**: Convert to WebP format and compress appropriately
5. **Lifestyle-first**: Show products in real-world settings, not just white backgrounds

## Quick Reference: Image Paths by Page

### Homepage (`app/page.tsx`)
- Hero: `/images/hero/hero-banner.jpg`
- Categories: `/images/categories/*.jpg`
- Best Sellers: `/images/products/*.jpg`
- Watch & Shop: `/images/watch-shop/*.jpg`
- About: `/images/about/artisan-workshop.jpg`

### Products Page (`app/products/page.tsx`)
- Product cards: `/images/products/*.jpg`

### Product Detail Page (`app/products/[id]/page.tsx`)
- Product gallery: `/images/products/dragon.jpg`, `dragon-2.jpg`, `dragon-3.jpg`

### Watch & Shop Page (`app/watch-shop/page.tsx`)
- Process steps: `/images/watch-shop/*.jpg`

### About Page (`app/about/page.tsx`)
- Workshop image: `/images/about/artisan-workshop.jpg`

### Header Component (`components/layout/header.tsx`)
- Logo: `/images/logo/logo-icon.svg`

## Notes

- All image paths are relative to the `public` directory
- Next.js Image component automatically optimizes images
- Use descriptive filenames that match the product/content
- Keep file sizes reasonable (under 500KB for most images, under 1MB for hero images)
