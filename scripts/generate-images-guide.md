# Image Generation Guide

This guide will help you generate all the required images for the 3D Print Miniatures website using AI image generators.

## Recommended Tools

1. **Midjourney** (Best quality, requires Discord subscription)
2. **DALL-E 3** (via ChatGPT Plus or OpenAI API)
3. **Stable Diffusion** (Free, requires local setup or online service)
4. **Leonardo.ai** (Good free tier)

## Step-by-Step Generation Process

### 1. Hero Banner (`/images/hero/hero-banner.jpg`)

**Tool**: Midjourney or DALL-E 3
**Prompt**:
```
A professional website hero banner for a 3D printing miniature studio. High-detail 8k resolution image of a hand-painted resin miniature of an Ancient Dragon standing on a wooden tabletop with soft cinematic lighting. In the background, out of focus, are more miniatures and a 3D printer glowing slightly. Earthy, rustic aesthetic with a premium feel. Wide horizontal aspect ratio 16:9, warm color palette with cream and charcoal tones, lifestyle photography style --ar 16:9 --style raw
```

**Settings**:
- Aspect Ratio: 16:9
- Resolution: 1920x1080 minimum (8K if possible)
- Style: Photorealistic, cinematic lighting

---

### 2. Category Icons (`/images/categories/`)

Generate each icon separately with a 1:1 aspect ratio.

#### Fantasy Warrior (`fantasy-warrior.jpg`)
**Prompt**:
```
A 32mm fantasy warrior miniature, centered on a neutral off-white background with soft shadows, premium boutique store style, product photography, clean lighting, square composition --ar 1:1
```

#### Terrain Piece (`terrain-piece.jpg`)
**Prompt**:
```
A large-scale tabletop terrain piece, ruined castle, centered on a neutral off-white background with soft shadows, premium boutique store style, product photography, clean lighting, square composition --ar 1:1
```

#### Sci-Fi Mech (`sci-fi-mech.jpg`)
**Prompt**:
```
A sci-fi mech unit miniature, centered on a neutral off-white background with soft shadows, premium boutique store style, product photography, clean lighting, square composition --ar 1:1
```

---

### 3. Watch & Shop Images (`/images/watch-shop/`)

#### Printer Nozzle (`printer-nozzle.jpg`)
**Prompt**:
```
A close-up macro photograph of a 3D printer nozzle precisely depositing layers of resin, soft warm lighting, minimalist workshop background, professional product photography, vertical composition --ar 3:4
```

#### Removing Supports (`removing-supports.jpg`)
**Prompt**:
```
A pair of hands carefully removing supports from a highly detailed miniature, soft warm lighting, minimalist workshop background, professional product photography, vertical composition --ar 3:4
```

#### Texture Closeup (`texture-closeup.jpg`)
**Prompt**:
```
A macro shot of the texture on a printed miniature's armor showing extreme detail, soft warm lighting, minimalist workshop background, professional product photography, vertical composition --ar 3:4
```

#### Design Process (`design-process.jpg`)
**Prompt**:
```
A 3D modeling workspace showing digital design process, computer screen with 3D model, sketches, soft warm lighting, professional photography, horizontal composition --ar 4:3
```

---

### 4. Product Images (`/images/products/`)

#### Dragon Miniature (`dragon.jpg`, `dragon-2.jpg`, `dragon-3.jpg`)
**Prompt**:
```
An Ancient Dragon 3D printed miniature, unpainted grey resin, displayed on a stone pedestal, showing extreme detail and texture, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

**Variations**: Generate 3 versions with different angles (front, side, detail closeup)

#### Elven Archer (`elven-archer.jpg`)
**Prompt**:
```
An Elven Archer 3D printed miniature set, unpainted grey resin, displayed on a wooden pedestal, showing extreme detail, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

#### Castle Terrain (`castle-terrain.jpg`)
**Prompt**:
```
A Ruined Castle terrain piece, 3D printed, unpainted grey resin, displayed on a stone pedestal, showing extreme detail, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

#### Cyberpunk Hero (`cyberpunk-hero.jpg`)
**Prompt**:
```
A Cyberpunk Hero 3D printed miniature, unpainted grey resin, displayed on a modern pedestal, showing extreme detail, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

#### Stone Troll (`stone-troll.jpg`)
**Prompt**:
```
A Stone Troll 3D printed miniature, unpainted grey resin, displayed on a stone pedestal, showing extreme detail and texture, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

#### Treasure Chest (`treasure-chest.jpg`)
**Prompt**:
```
A Treasure Chest 3D printed miniature, unpainted grey resin, displayed on a wooden pedestal, showing extreme detail, lifestyle photography, warm lighting, premium e-commerce style, square composition --ar 1:1
```

---

### 5. About Section (`/images/about/artisan-workshop.jpg`)

**Prompt**:
```
A warm, inviting artisan workshop scene, creator's desk cluttered with sketches, paint pots, brushes, and various 3D printed prototypes, vintage-style lamp casting warm glow, organized chaos aesthetic, professional and creative, horizontal composition --ar 4:3
```

---

## Post-Processing Tips

1. **Color Grading**: Apply consistent color grading across all images
   - Warm tones (cream, beige)
   - Slight desaturation for premium feel
   - Soft shadows

2. **Optimization**:
   - Convert to WebP format for better compression
   - Resize to appropriate dimensions
   - Compress to reduce file size (aim for <500KB for products, <1MB for hero)

3. **Naming Convention**:
   - Use lowercase with hyphens
   - Match the filenames exactly as listed in IMAGE_CHECKLIST.md

## Batch Generation Workflow

1. Start with hero banner (most important)
2. Generate category icons (quick wins)
3. Generate product images (most time-consuming)
4. Generate watch & shop images
5. Generate about section image
6. Post-process all images for consistency
7. Optimize and compress
8. Place in correct directories

## Tools for Post-Processing

- **ImageMagick** (CLI): Batch resize and convert
- **Squoosh** (Web): Online image optimization
- **Photoshop/GIMP**: Color grading and adjustments
- **TinyPNG**: Compression service

## Quick Command Reference

### Using ImageMagick to batch convert to WebP:
```bash
cd public/images/products
for file in *.jpg; do
  magick "$file" -quality 85 "${file%.jpg}.webp"
done
```

### Using ImageMagick to batch resize:
```bash
cd public/images/products
for file in *.jpg; do
  magick "$file" -resize 800x800^ -gravity center -extent 800x800 "resized_$file"
done
```
