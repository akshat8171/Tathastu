'use client'

import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

interface BestSellersProps {
  products: ProductCardData[]
}

export function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null
  return (
    <ProductRail
      title="Best Sellers"
      subtitle="Our most-loved custom prints, picked by customers."
      viewAllHref="/products"
      products={products}
    />
  )
}
