import Link from 'next/link'

const categories = [
  {
    name: 'Miniatures',
    description: 'Dragons, knights, elves & more',
    href: '/products?category=miniatures',
    emoji: '🐉',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    name: 'Lamps',
    description: 'Lithophane & mood lighting',
    href: '/products?category=lamps',
    emoji: '💡',
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    name: 'Signs',
    description: 'Custom name & LED signs',
    href: '/products?category=signs',
    emoji: '✍️',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    name: 'Custom Orders',
    description: 'Your idea, our printer',
    href: '/custom',
    emoji: '✨',
    gradient: 'from-pink-500 to-rose-500',
  },
]

export function CategoryIcons() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">
          What We <span className="gradient-text">Print</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="card p-6 sm:p-8 text-center group hover:scale-105 transition-all duration-300"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                {cat.emoji}
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-400">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
