'use client'

/**
 * Per-category product rails for the homepage.
 * Must be a client component because ProductCard uses useCart().
 */
import productsData from '@/lib/products.json'
import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

const allProducts = productsData as ProductCardData[]

function byCategory(slug: string, limit: number): ProductCardData[] {
  return allProducts
    .filter((p) => p.category === slug)
    .slice(0, limit)
}

export function CategoryRails() {
  const lampProducts       = byCategory('lamps', 4)
  const organizerProducts  = byCategory('organizers', 4)
  const planterProducts    = byCategory('planters', 4)

  return (
    <>
      <ProductRail
        title="Lamps & Lighting"
        subtitle="Statement pieces that cast the perfect glow."
        viewAllHref="/products?category=lamps"
        products={lampProducts}
      />
      <ProductRail
        title="Desk & Workspace"
        subtitle="Keep your desk tidy with stylish 3D-printed organisers."
        viewAllHref="/products?category=organizers"
        products={organizerProducts}
      />
      <ProductRail
        title="Planters & Garden"
        subtitle="Unique planters for succulents, herbs, and house plants."
        viewAllHref="/products?category=planters"
        products={planterProducts}
      />
    </>
  )
}
