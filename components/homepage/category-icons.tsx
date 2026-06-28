'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading, ScrollRail } from '@/components/ui'
import { categories } from '@/lib/categories'
import productsData from '@/lib/products.json'
import type { ProductCardData } from '@/components/ui'

const allProducts = productsData as ProductCardData[]

// Lowest price per category → "Starting at ₹X" badge (like the reference site).
const minPriceByCategory: Record<string, number> = {}
for (const p of allProducts) {
  const cur = minPriceByCategory[p.category]
  if (cur === undefined || p.price < cur) minPriceByCategory[p.category] = p.price
}

export function CategoryIcons() {
  return (
    <section className="py-14 sm:py-20 bg-surface">
      <div className="container-page">
        <SectionHeading
          title="Shop by Category"
          subtitle="Find exactly what you're looking for — explore our most-loved collections."
          centered
        />

        <div className="mt-8">
          <ScrollRail className="gap-3 sm:gap-4 pb-2" ariaLabel="Product categories">
            {categories.map((cat) => {
              const href = cat.isCta ? '/customize' : `/products?category=${cat.slug}`
              const from = minPriceByCategory[cat.slug]

              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className="group snap-start flex-shrink-0 w-32 sm:w-40 block"
                  aria-label={`Shop ${cat.displayName}`}
                >
                  {/* Small, cute image tile */}
                  <div className="relative aspect-square rounded-card2 overflow-hidden bg-panel shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
                    <Image
                      src={cat.image}
                      alt={cat.displayName}
                      fill
                      sizes="(max-width: 640px) 33vw, 160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* "Starting at ₹X" pill (top-left) */}
                    {from !== undefined && !cat.isCta && (
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-display font-semibold px-2 py-0.5 rounded-full shadow-badge leading-none">
                        Starting at ₹{from}
                      </span>
                    )}

                    {/* Custom pill for the CTA tile */}
                    {cat.isCta && (
                      <span className="absolute top-2 left-2 bg-violet text-white text-[10px] font-display font-semibold px-2 py-0.5 rounded-full shadow-badge leading-none">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Label BELOW the tile (not overlaid) — the "cute" look */}
                  <p className="mt-2.5 text-center font-display font-semibold text-ink text-xs sm:text-sm leading-tight group-hover:text-brand transition-colors">
                    {cat.displayName}
                  </p>
                </Link>
              )
            })}
          </ScrollRail>
        </div>
      </div>
    </section>
  )
}
