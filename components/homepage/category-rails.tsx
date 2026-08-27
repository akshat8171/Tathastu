'use client'

/**
 * Per-category product rails for the homepage (horizontal carousels).
 * Must be a client component because ProductCard uses useCart().
 */
import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'
import type { CategoryRailConfig } from '@/lib/catalog/types'

interface CategoryRailsProps {
  rails: Array<CategoryRailConfig & { products: ProductCardData[] }>
}

export function CategoryRails({ rails }: CategoryRailsProps) {
  return (
    <>
      {rails
        .filter((rail) => rail.products.length > 0)
        .map((rail) => (
          <ProductRail
            key={rail.slug}
            title={rail.title}
            subtitle={rail.subtitle}
            viewAllHref={`/products?category=${rail.slug}`}
            products={rail.products}
          />
        ))}
    </>
  )
}
