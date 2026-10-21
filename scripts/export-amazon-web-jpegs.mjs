#!/usr/bin/env node
/**
 * Publish Amazon-safe JPEGs next to the website gallery PNGs.
 * MAIN must be pure white (Amazon search/detail pages are RGB 255,255,255).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCKED = path.join(ROOT, 'docs/catalog/generated/locked')
const PUBLIC = path.join(ROOT, 'public/images/products')

const PRODUCTS = [
  ['p1-nitansh', 'home-decor', 'home-decor-alphabet-name'],
  ['p2-annika', 'organizers', 'organizers-desk-pen-holder'],
  ['p3-aarav', 'organizers', 'organizers-giant-name-pencil'],
  ['p4-navya', 'organizers', 'organizers-name-pen-stand'],
  ['p5-javier', 'organizers', 'organizers-pencil-shape-stand'],
  ['p6-photobook', 'home-decor', 'home-decor-sliding-photo-book'],
  ['p7-kanhaji', 'pooja-decor', 'pooja-decor-kanhaji'],
  ['p8-instax', 'home-decor', 'home-decor-instax-magnet'],
  ['p9-abhay-shivi', 'home-decor', 'home-decor-couple-initials'],
  ['p10-rotator', 'home-decor', 'home-decor-photo-rotator'],
  ['p11-dhwani', 'home-decor', 'home-decor-butterfly-name'],
  ['p12-rohit-shweta', 'home-decor', 'home-decor-couple-name'],
  ['p13-keyholder', 'organizers', 'organizers-wall-key-holder'],
  ['p14-seashell', 'organizers', 'organizers-seashell-jewelry-dish'],
  ['p15-vase', 'home-decor', 'home-decor-mermaid-vase'],
  ['p16-doorsign', 'home-decor', 'home-decor-kids-door-nameplate'],
  ['p17-bowbag', 'organizers', 'organizers-bow-jewelry-basket'],
  ['p18-perfumetray', 'organizers', 'organizers-name-perfume-tray'],
  ['p19-couplemini', 'home-decor', 'home-decor-couple-miniature'],
  ['p20-infinity', 'home-decor', 'home-decor-twisted-loop'],
  ['p21-carmini', 'home-decor', 'home-decor-child-car'],
  ['p22-milestone', 'home-decor', 'home-decor-first-year-board'],
  ['p23-sitar', 'home-decor', 'home-decor-sitar-plaque'],
  ['p24-sanskrit', 'pooja-decor', 'pooja-decor-aham-brahmasmi'],
  ['p25-silhouette', 'home-decor', 'home-decor-umbrella-lady'],
  ['p26-officeplate', 'organizers', 'organizers-office-name-sign'],
  ['p27-arabic', 'home-decor', 'home-decor-bilingual-name'],
  ['p28-dualplank', 'home-decor', 'home-decor-dual-name-plank'],
  ['p29-photoframe', 'home-decor', 'home-decor-dual-name-photo-frame'],
  ['p30-planklight', 'home-decor', 'home-decor-dual-name-plank-light'],
  ['p31-soulmate', 'home-decor', 'home-decor-soulmate-combo'],
  ['p32-soulmatelight', 'home-decor', 'home-decor-soulmate-combo-light'],
  ['p33-premium', 'home-decor', 'home-decor-premium-dual-name-plank'],
  ['p34-dash-shiva', 'pooja-decor', 'pooja-decor-dashboard-shiva'],
  ['p35-dash-babyshiva', 'pooja-decor', 'pooja-decor-dashboard-baby-shiva'],
  ['p36-dash-shivanandi', 'pooja-decor', 'pooja-decor-dashboard-shiva-nandi'],
  ['p37-dash-ganesha', 'pooja-decor', 'pooja-decor-dashboard-ganesha'],
  ['p38-dash-balganesha', 'pooja-decor', 'pooja-decor-dashboard-bal-ganesha'],
  ['p39-dash-krishnaflute', 'pooja-decor', 'pooja-decor-dashboard-krishna-flute'],
  ['p40-dash-krishnabust', 'pooja-decor', 'pooja-decor-dashboard-krishna-bust'],
  ['p41-dash-hanuman', 'pooja-decor', 'pooja-decor-dashboard-hanuman'],
  ['p42-dash-laxmiganesh', 'pooja-decor', 'pooja-decor-dashboard-laxmi-ganesh'],
]

async function toJpeg(src, dest) {
  await sharp(src)
    .rotate()
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 88, progressive: false, chromaSubsampling: '4:2:0' })
    .toFile(dest)
}

async function main() {
  let written = 0
  for (const [prefix, category, id] of PRODUCTS) {
    const dir = path.join(PUBLIC, category, id)
    fs.mkdirSync(dir, { recursive: true })
    const white = path.join(LOCKED, `${prefix}-s1-amazon-white.png`)
    if (!fs.existsSync(white)) {
      throw new Error(`Missing Amazon white hero: ${white}`)
    }
    await toJpeg(white, path.join(dir, '00-amazon-white.jpg'))
    written += 1
    console.log(id)

  }
  console.log(`Wrote ${written} JPEGs for Amazon image URLs`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
