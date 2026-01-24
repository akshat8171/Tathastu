#!/usr/bin/env node

/**
 * Script to create placeholder images for development
 * Run with: node scripts/create-placeholders.js
 */

const fs = require('fs')
const path = require('path')

// Color palette
const colors = {
  cream: '#F5F5DC',
  charcoal: '#333333',
  sageGreen: '#87A96B',
  slateBlue: '#6B8FA8',
}

// Image specifications
const images = [
  // Hero
  { path: 'hero/hero-banner.jpg', width: 1920, height: 1080, label: 'Hero Banner' },
  
  // Categories
  { path: 'categories/fantasy-warrior.jpg', width: 400, height: 400, label: 'Fantasy Warrior' },
  { path: 'categories/terrain-piece.jpg', width: 400, height: 400, label: 'Terrain Piece' },
  { path: 'categories/sci-fi-mech.jpg', width: 400, height: 400, label: 'Sci-Fi Mech' },
  
  // Watch & Shop
  { path: 'watch-shop/printer-nozzle.jpg', width: 600, height: 800, label: 'Printer Nozzle' },
  { path: 'watch-shop/removing-supports.jpg', width: 600, height: 800, label: 'Removing Supports' },
  { path: 'watch-shop/texture-closeup.jpg', width: 600, height: 800, label: 'Texture Closeup' },
  { path: 'watch-shop/design-process.jpg', width: 1200, height: 900, label: 'Design Process' },
  
  // Products
  { path: 'products/dragon.jpg', width: 800, height: 800, label: 'Dragon' },
  { path: 'products/dragon-2.jpg', width: 800, height: 800, label: 'Dragon 2' },
  { path: 'products/dragon-3.jpg', width: 800, height: 800, label: 'Dragon 3' },
  { path: 'products/elven-archer.jpg', width: 800, height: 800, label: 'Elven Archer' },
  { path: 'products/castle-terrain.jpg', width: 800, height: 800, label: 'Castle Terrain' },
  { path: 'products/cyberpunk-hero.jpg', width: 800, height: 800, label: 'Cyberpunk Hero' },
  { path: 'products/stone-troll.jpg', width: 800, height: 800, label: 'Stone Troll' },
  { path: 'products/treasure-chest.jpg', width: 800, height: 800, label: 'Treasure Chest' },
  
  // About
  { path: 'about/artisan-workshop.jpg', width: 1200, height: 900, label: 'Artisan Workshop' },
]

// SVG placeholder generator
function createSVGPlaceholder({ width, height, label }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${colors.cream}"/>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" opacity="0.1"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${colors.charcoal}" text-anchor="middle" dominant-baseline="middle" opacity="0.5">
    ${label}
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" fill="${colors.charcoal}" text-anchor="middle" dominant-baseline="middle" opacity="0.3">
    ${width} × ${height}
  </text>
  <defs>
    <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="${colors.charcoal}" opacity="0.1"/>
    </pattern>
  </defs>
</svg>`
}

// Create placeholder images
const publicDir = path.join(__dirname, '..', 'public', 'images')

images.forEach(({ path: imagePath, width, height, label }) => {
  const fullPath = path.join(publicDir, imagePath)
  const dir = path.dirname(fullPath)
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  // Create SVG placeholder (can be converted to JPG later)
  const svgPath = fullPath.replace('.jpg', '.svg')
  const svg = createSVGPlaceholder({ width, height, label })
  
  fs.writeFileSync(svgPath, svg)
  console.log(`✓ Created placeholder: ${imagePath.replace('.jpg', '.svg')}`)
})

console.log('\n✅ All placeholder images created!')
console.log('\nNote: These are SVG placeholders. To convert to JPG:')
console.log('1. Open each SVG in a browser or image editor')
console.log('2. Export as JPG with the same dimensions')
console.log('3. Or use ImageMagick: magick input.svg output.jpg')
console.log('\nAlternatively, generate real images using the prompts in scripts/generate-images-guide.md')
