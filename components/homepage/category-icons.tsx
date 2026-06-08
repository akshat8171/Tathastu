import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { name: 'Lamps', href: '/products?category=lamps', image: '/images/categories/lamps.jpg' },
  { name: 'Miniatures', href: '/products?category=miniatures', image: '/images/categories/miniatures.jpg' },
  { name: 'Signs', href: '/products?category=signs', image: '/images/categories/signs.jpg' },
  { name: 'Custom', href: '/custom', image: '/images/categories/custom.jpg' },
]

export function CategoryIcons() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-4 justify-center">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center gap-3 flex-shrink-0 group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-warm-border group-hover:border-sage-green transition-colors">
                <div className="w-full h-full bg-cream-dark relative">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-charcoal group-hover:text-sage-green transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
