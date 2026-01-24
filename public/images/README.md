# Image Resources Directory

This directory contains all image assets for the 3D Print Miniatures website.

## Directory Structure

```
images/
├── hero/
│   └── hero-banner.jpg          # Homepage hero section banner
├── categories/
│   ├── fantasy-warrior.jpg       # Fantasy category icon (32mm warrior)
│   ├── terrain-piece.jpg         # Terrain category icon (ruined castle)
│   └── sci-fi-mech.jpg           # Sci-Fi category icon (mech unit)
├── watch-shop/
│   ├── printer-nozzle.jpg         # 3D printer nozzle close-up
│   ├── removing-supports.jpg      # Hands removing supports
│   ├── texture-closeup.jpg        # Macro texture shot
│   └── design-process.jpg         # Design and modeling process
├── products/
│   ├── dragon.jpg                 # Ancient Dragon Miniature
│   ├── dragon-2.jpg               # Dragon alternate angle
│   ├── dragon-3.jpg               # Dragon detail shot
│   ├── elven-archer.jpg           # Elven Archer Set
│   ├── castle-terrain.jpg         # Ruined Castle Terrain
│   ├── cyberpunk-hero.jpg         # Cyberpunk Hero
│   ├── stone-troll.jpg            # Stone Troll
│   └── treasure-chest.jpg         # Treasure Chest
├── about/
│   └── artisan-workshop.jpg       # Artisan workshop scene
└── logo/
    └── logo-icon.svg              # Brand logo icon
```

## Image Requirements

### Homepage Hero Section
- **File**: `hero/hero-banner.jpg`
- **Aspect Ratio**: 16:9 (wide horizontal)
- **Resolution**: 8K recommended, minimum 1920x1080
- **Content**: Hand-painted resin miniature on wooden tabletop with soft cinematic lighting. Background shows more miniatures and a 3D printer.

### Category Icons
- **Files**: `categories/*.jpg`
- **Aspect Ratio**: 1:1 (square)
- **Resolution**: Minimum 400x400px
- **Content**: Clean, centered product on neutral off-white background with soft shadows

### Watch & Shop Section
- **Files**: `watch-shop/*.jpg`
- **Aspect Ratio**: 3:4 (vertical/portrait)
- **Resolution**: Minimum 600x800px
- **Content**: Process documentation with soft, warm lighting and minimalist workshop background

### Product Images
- **Files**: `products/*.jpg`
- **Aspect Ratio**: 1:1 (square) for thumbnails, flexible for detail shots
- **Resolution**: Minimum 800x800px for thumbnails, higher for detail views
- **Content**: Products displayed on stone/wood pedestals, unpainted grey resin to show detail. Lifestyle-first presentation.

### About Section
- **File**: `about/artisan-workshop.jpg`
- **Aspect Ratio**: 4:3
- **Resolution**: Minimum 1200x900px
- **Content**: Creator's desk with sketches, paint pots, brushes, and prototypes. Warm vintage lamp lighting.

## Image Generation Prompts

### Hero Banner
```
A professional website hero banner for a 3D printing miniature studio. High-detail 8k resolution image of a hand-painted resin miniature of a [Dragon/Paladin/Cyberpunk Hero] standing on a wooden tabletop with soft cinematic lighting. In the background, out of focus, are more miniatures and a 3D printer glowing slightly. Earthy, rustic aesthetic with a premium feel. Wide horizontal aspect ratio.
```

### Category Icons
```
A collection of three clean, circular icons for a website. Icon 1: A 32mm fantasy warrior. Icon 2: A large-scale tabletop terrain piece (like a ruined castle). Icon 3: A sci-fi mech unit. Each item is centered on a neutral, off-white background with soft shadows, mimicking a premium boutique store style.
```

### Watch & Shop Images
```
A grid of three vertical "story-style" images. 1: A close-up of a 3D printer nozzle precisely depositing layers of resin/filament. 2: A pair of hands carefully removing supports from a highly detailed miniature. 3: A macro shot of the texture on a printed miniature's armor. Soft, warm lighting, minimalist workshop background.
```

### Product Images
```
A high-end e-commerce product gallery view. Several 3D printed models (an elven archer, a stone troll, a treasure chest) displayed on individual stone and wood pedestals. The models are unpainted grey resin to show off the extreme detail. The layout is clean with plenty of white space, elegant serif typography below for titles and pricing.
```

### About Section
```
A warm, inviting "About Us" image for a 3D printing studio. A shot of a creator's desk cluttered with sketches, paint pots, brushes, and various printed prototypes. A vintage-style lamp casts a warm glow over the scene. The aesthetic is "The Artisan's Workshop"—organized chaos that feels professional and creative.
```

## Notes

- All images should be optimized for web (WebP format recommended)
- Use lazy loading for images below the fold
- Ensure all images have appropriate alt text for accessibility
- Maintain consistent lighting and color grading across all product images
- Lifestyle-first approach: show products in real-world settings, not just white backgrounds
