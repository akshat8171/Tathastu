'use client'

import { ProductCard, SectionHeading, ScrollRail } from '@/components/ui'
import type { ProductCardData } from '@/components/ui'

interface ProductRailProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  products: ProductCardData[]
  /**
   * Layout:
   *  - 'carousel' (default): horizontal scroll-snap rail with peek + arrows.
   *  - 'grid': static responsive grid (legacy).
   */
  variant?: 'carousel' | 'grid'
  /** Grid only: max columns. Defaults to 4. */
  maxCols?: 3 | 4
  /** Show rating stars on cards (default true) */
  showRating?: boolean
}

export function ProductRail({
  title,
  subtitle,
  viewAllHref,
  products,
  variant = 'carousel',
  maxCols = 4,
  showRating = true,
}: ProductRailProps) {
  if (variant === 'grid') {
    const colClass =
      maxCols === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    return (
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
          <div className={`grid ${colClass} gap-4 sm:gap-5`}>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} showRating={showRating} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Carousel: each card is a fixed-width, snap-aligned rail item.
  return (
    <section className="py-12 sm:py-16">
      <div className="container-page">
        <SectionHeading title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
        <ScrollRail className="gap-4 pb-2" ariaLabel={title}>
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start flex-shrink-0 w-44 sm:w-52 lg:w-60"
            >
              <ProductCard {...product} showRating={showRating} />
            </div>
          ))}
        </ScrollRail>
      </div>
    </section>
  )
}
