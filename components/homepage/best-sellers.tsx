'use client'

import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

interface BestSellersProps {
  products: ProductCardData[]
  title?: string
  subtitle?: string
}

export function BestSellers({
  products,
  title = 'Best Sellers',
  subtitle = 'Our most-loved custom prints, picked by customers.',
}: BestSellersProps) {
  if (products.length === 0) return null
  return (
    <ProductRail
      title={title}
      subtitle={subtitle}
      viewAllHref="/products"
      products={products}
    />
  )
}
