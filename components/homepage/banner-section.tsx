import Link from 'next/link'

export function BannerSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-purple/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold mb-6">
            Bring Your{' '}
            <span className="gradient-text">Imagination</span>
            {' '}to Life
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Premium 3D printed miniatures, lamps, signs, and custom creations.
            If it exists, we can print it. Layer by layer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products?category=miniatures" className="btn-primary text-lg">
              Browse Miniatures 🐉
            </Link>
            <Link href="/custom" className="btn-secondary text-lg">
              Custom Order ✨
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text">500+</div>
            <div className="text-sm text-gray-400">Designs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text">4.8★</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text">2K+</div>
            <div className="text-sm text-gray-400">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  )
}
