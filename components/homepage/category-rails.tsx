'use client'

/**
 * Per-category product rails for the homepage (horizontal carousels).
 * Must be a client component because ProductCard uses useCart().
 */
import productsData from '@/lib/products.json'
import { ProductRail } from '@/components/homepage/product-rail'
import type { ProductCardData } from '@/components/ui'

const allProducts = productsData as ProductCardData[]

function byCategory(slug: string, limit: number): ProductCardData[] {
  return allProducts.filter((p) => p.category === slug).slice(0, limit)
}

export function CategoryRails() {
  return (
    <>
      <ProductRail
        title="Keyrings & Bag Tags"
        subtitle="Personalised, multi-colour and built to last."
        viewAllHref="/products?category=keyrings"
        products={byCategory('keyrings', 10)}
      />
      <ProductRail
        title="Pooja & Decor"
        subtitle="Devotional pieces, beautifully printed."
        viewAllHref="/products?category=pooja-decor"
        products={byCategory('pooja-decor', 10)}
      />
      <ProductRail
        title="Gaming & Fun"
        subtitle="One-of-a-kind, made-to-order creations."
        viewAllHref="/products?category=gaming"
        products={byCategory('gaming', 10)}
      />
      <ProductRail
        title="Lamps & Lighting"
        subtitle="Statement pieces that cast the perfect glow."
        viewAllHref="/products?category=lamps"
        products={byCategory('lamps', 10)}
      />
      <ProductRail
        title="Planters & Garden"
        subtitle="Unique planters for succulents, herbs, and house plants."
        viewAllHref="/products?category=planters"
        products={byCategory('planters', 10)}
      />
    </>
  )
}
