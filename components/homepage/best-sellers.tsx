'use client'

import productsData from '@/lib/products.json'
import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

// A cross-category mix of our most-loved custom prints (highest-rated picks).
const BEST_SELLER_IDS = [
  'keyrings-name',          // Custom Name Keychain — 4.9★
  'pooja-decor-ganesha',    // Golden Ganesha Idol — 4.9★
  'gaming-shield',          // Captain America Shield — 4.9★
  'keyrings-puppy',         // Knitted Puppy Keychain — 4.9★
  'pooja-decor-shiva',      // Meditating Mahadev Idol — 4.9★
  'pooja-decor-temple',     // Kedarnath Temple Miniature — 4.9★
  'keyrings-shiva',         // Mahadev Face Keychain — 4.8★
  'gaming-toad',            // Toad Character Keychain — 4.8★
  'lamps-lunar-night',      // Lunar Night Lamp — 4.9★
  'planters-terrace-trio',  // Terrace Trio Planter — 4.9★
]

const allProducts = productsData as ProductCardData[]

const bestSellers: ProductCardData[] = BEST_SELLER_IDS
  .map((id) => allProducts.find((p) => p.id === id))
  .filter((p): p is ProductCardData => p !== undefined)

export function BestSellers() {
  return (
    <ProductRail
      title="Best Sellers"
      subtitle="Our most-loved custom prints, picked by customers."
      viewAllHref="/products"
      products={bestSellers}
    />
  )
}
