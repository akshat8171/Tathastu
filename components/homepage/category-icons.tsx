import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui'
import { categories } from '@/lib/categories'

export function CategoryIcons() {
  return (
    <section className="py-12 sm:py-16 bg-surface">
      <div className="container-page">
        <SectionHeading
          title="Shop by Category"
          subtitle="Lamps, planters, desk organisers, and fully custom prints."
          centered
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {categories.map((cat) => {
            const href = cat.isCta
              ? '/customize'
              : `/products?category=${cat.slug}`

            return (
              <Link
                key={cat.slug}
                href={href}
                className="group relative overflow-hidden rounded-2xl bg-panel shadow-sm hover:shadow-card-hover transition-shadow duration-300 aspect-[3/4] block"
                aria-label={`Shop ${cat.displayName}`}
              >
                {/* Category image */}
                <Image
                  src={cat.image}
                  alt={cat.displayName}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display font-semibold text-white text-sm sm:text-base leading-tight">
                    {cat.displayName}
                  </p>
                  {cat.isCta && (
                    <p className="font-sans text-white/80 text-xs mt-0.5">
                      Upload your design →
                    </p>
                  )}
                </div>

                {/* Customise badge */}
                {cat.isCta && (
                  <div className="absolute top-3 right-3">
                    <span className="badge-new text-xs px-2 py-1 rounded-full font-display">
                      Custom
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
