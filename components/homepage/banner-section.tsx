import Link from 'next/link'

export function BannerSection() {
  return (
    <section className="relative bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sage-green text-sm font-semibold uppercase tracking-widest mb-4">
            Premium 3D Printing
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-charcoal mb-6 leading-tight">
            If It Exists, We Can Print It.
          </h1>
          <p className="text-lg text-charcoal-light mb-8 max-w-2xl mx-auto">
            Precision 3D printed miniatures, lamps, signs, and custom creations.
            Crafted layer by layer, finished by hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary text-base">
              Shop Collection
            </Link>
            <Link href="/custom" className="btn-secondary text-base">
              Custom Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
