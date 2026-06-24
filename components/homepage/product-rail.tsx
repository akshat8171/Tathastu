'use client'

import { ProductCard, SectionHeading } from '@/components/ui'
import type { ProductCardData } from '@/components/ui'

interface ProductRailProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  products: ProductCardData[]
  /** Max columns. Defaults to 4 (desktop). */
  maxCols?: 3 | 4
}

export function ProductRail({
  title,
  subtitle,
  viewAllHref,
  products,
  maxCols = 4,
}: ProductRailProps) {
  const colClass = maxCols === 3
    ? 'grid-cols-2 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <section className="py-10 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          viewAllHref={viewAllHref}
        />
        <div className={`grid ${colClass} gap-4 sm:gap-5`}>
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
