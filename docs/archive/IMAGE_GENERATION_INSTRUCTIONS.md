# Image Generation Instructions

I've created placeholder SVG images for development, but you'll need to generate the actual JPG images for production. Here are your options:

## Option 1: Use AI Image Generators (Recommended)

### Quick Start with Midjourney

1. Join Midjourney Discord server
2. Use the prompts from `scripts/image-prompts.txt`
3. For each image:
   - Copy the prompt
   - Add aspect ratio: `--ar 16:9` (for hero) or `--ar 1:1` (for products)
   - Generate and upscale
   - Download and save to the correct directory

### Quick Start with DALL-E 3 (ChatGPT Plus)

1. Open ChatGPT Plus with DALL-E 3 access
2. Use prompts from `scripts/image-prompts.txt`
3. Specify dimensions in the prompt (e.g., "1920x1080 pixels")
4. Download and save to correct directories

### Quick Start with Leonardo.ai

1. Sign up at leonardo.ai
2. Use the prompts from `scripts/image-prompts.txt`
3. Set aspect ratio in the interface
4. Generate, download, and save

## Option 2: Convert SVG Placeholders to JPG

If you want to use the placeholders temporarily:

```bash
# Install ImageMagick first
brew install imagemagick  # Mac
# or
sudo apt-get install imagemagick  # Linux

# Then run the conversion script
./scripts/convert-svg-to-jpg.sh
```

## Option 3: Manual Image Creation

1. Use the prompts in `scripts/image-prompts.txt`
2. Generate images using any tool
3. Save them with exact filenames to:
   - `public/images/hero/hero-banner.jpg`
   - `public/images/categories/*.jpg`
   - `public/images/watch-shop/*.jpg`
   - `public/images/products/*.jpg`
   - `public/images/about/artisan-workshop.jpg`

## Image Checklist

All required images are listed in `IMAGE_CHECKLIST.md`. The prompts are ready to use in `scripts/image-prompts.txt`.

## Current Status

✅ SVG placeholders created (for development)
⏳ JPG images needed (for production)

## Next Steps

1. **Choose your image generation tool** (Midjourney, DALL-E, Leonardo.ai, etc.)
2. **Open `scripts/image-prompts.txt`** - all prompts are ready to copy-paste
3. **Generate images** following the aspect ratios specified
4. **Save images** to the correct directories with exact filenames
5. **Optimize images** (convert to WebP, compress) before final deployment

## Tips

- Generate hero banner first (most visible)
- Use consistent lighting and color grading across all images
- Maintain the lifestyle-first aesthetic
- Show products in real-world settings, not just white backgrounds
- Optimize file sizes (aim for <500KB for products, <1MB for hero)

## File Locations

All images should be saved to `public/images/` with this structure:

```
public/images/
├── hero/hero-banner.jpg
├── categories/
│   ├── fantasy-warrior.jpg
│   ├── terrain-piece.jpg
│   └── sci-fi-mech.jpg
├── watch-shop/
│   ├── printer-nozzle.jpg
│   ├── removing-supports.jpg
│   ├── texture-closeup.jpg
│   └── design-process.jpg
├── products/
│   ├── dragon.jpg
│   ├── dragon-2.jpg
│   ├── dragon-3.jpg
│   ├── elven-archer.jpg
│   ├── castle-terrain.jpg
│   ├── cyberpunk-hero.jpg
│   ├── stone-troll.jpg
│   └── treasure-chest.jpg
└── about/artisan-workshop.jpg
```
