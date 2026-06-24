'use client'

import productsData from '@/lib/products.json'
import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

// IDs chosen to showcase variety across all three categories
const BEST_SELLER_IDS = [
  'lamps-lunar-night',       // 4.9★ 67 reviews — Best Seller badge
  'planters-terrace-trio',   // 4.9★ 72 reviews — Best Seller badge
  'lamps-lamp5',             // 4.8★ 48 reviews — Trending
  'planters-planter2',       // 4.8★ 51 reviews — Editors' Choice
  'lamps-lamp3',             // 4.7★ 42 reviews — Editors' Choice
  'planters-planter1',       // 4.7★ 44 reviews — Trending
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
