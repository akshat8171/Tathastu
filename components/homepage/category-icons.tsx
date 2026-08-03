'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading, ScrollRail } from '@/components/ui'
import { homepageCategories } from '@/lib/categories'
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
          {/* Mobile: horizontal scroll rail. Desktop: responsive grid. */}
          <div className="sm:hidden">
            <ScrollRail className="gap-3 pb-2" ariaLabel="Product categories">
              {homepageCategories.map((cat) => {
                const href = cat.route ?? (cat.isCta ? '/customize' : `/products?category=${cat.slug}`)
                const from = minPriceByCategory[cat.slug]

                return (
                  <Link
                    key={cat.slug}
                    href={href}
                    className="group snap-start flex-shrink-0 w-[42%] block"
                    aria-label={`Shop ${cat.displayName}`}
                  >
                    <div className="relative aspect-square rounded-card2 overflow-hidden bg-panel border border-gray-100 shadow-sm group-hover:shadow-card-hover transition-shadow duration-300">
                      <Image
                        src={cat.image}
                        alt={cat.displayName}
                        fill
                        sizes="42vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* C-01: Solid brand teal badge */}
                      {from !== undefined && !cat.isCta && (
                        <span className="absolute top-2 left-2 bg-brand text-white text-[11px] px-2.5 py-1 rounded-full leading-none">
                          Starting at ₹{from}
                        </span>
                      )}

                      {cat.isCta && (
                        <span className="absolute top-2 left-2 bg-violet text-white text-[11px] px-2.5 py-1 rounded-full leading-none">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* C-04: text-sm font-medium, gap-3 */}
                    <p className="mt-3 text-center text-sm font-medium text-ink leading-tight group-hover:text-brand transition-colors">
                      {cat.displayName}
                    </p>
                  </Link>
                )
              })}
            </ScrollRail>
          </div>

          {/* C-02: Desktop grid (sm+) */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {homepageCategories.map((cat) => {
              const href = cat.route ?? (cat.isCta ? '/customize' : `/products?category=${cat.slug}`)
              const from = minPriceByCategory[cat.slug]

              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className="group block"
                  aria-label={`Shop ${cat.displayName}`}
                >
                  <div className="relative aspect-square rounded-card2 overflow-hidden bg-panel border border-gray-100 shadow-sm group-hover:shadow-card-hover transition-shadow duration-300">
                    <Image
                      src={cat.image}
                      alt={cat.displayName}
                      fill
                      sizes="(max-width: 1024px) 33vw, 16.66vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* C-01: Solid brand teal badge */}
                    {from !== undefined && !cat.isCta && (
                      <span className="absolute top-2 left-2 bg-brand text-white text-[11px] px-2.5 py-1 rounded-full leading-none">
                        Starting at ₹{from}
                      </span>
                    )}

                    {cat.isCta && (
                      <span className="absolute top-2 left-2 bg-violet text-white text-[11px] px-2.5 py-1 rounded-full leading-none">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* C-04: text-sm font-medium, gap-3 */}
                  <p className="mt-3 text-center text-sm font-medium text-ink leading-tight group-hover:text-brand transition-colors">
                    {cat.displayName}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
