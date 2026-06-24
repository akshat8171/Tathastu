import Image from 'next/image'
import { Button } from '@/components/ui'

// Pick 4 hero product images from real files confirmed in products.json / DESIGN_SPEC
const heroImages = [
  {
    src: '/images/products/lamps/lamp5/09d2f170-e355-11f0-a875-5de986fdb37b.jpg',
    alt: 'Minimalist Modern Lamp',
  },
  {
    src: '/images/products/planters/planter2/STACKABLE.jpg',
    alt: 'Stackable Planter Set',
  },
  {
    src: '/images/products/organizers/organizer3/TISTWO20tissue20box.jpg',
    alt: 'TISTWO Tissue Box Organizer',
  },
  {
    src: '/images/products/lamps/lamp3/2025-11-18_19d636c83adc7.webp',
    alt: 'Contemporary Style Lamp',
  },
]

export function BannerSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet/10 via-surface to-white">
      <div className="container-page py-14 sm:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left: Copy + CTAs ──────────────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-widest text-violet mb-4 bg-violet/10 px-3 py-1.5 rounded-full">
              <span>🇮🇳</span>
              Made-to-order across India
            </p>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
              If it exists,{' '}
              <span className="text-brand">
                we can print it.
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="font-sans text-muted text-lg sm:text-xl leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Custom 3D-printed lamps, planters, and desk accessories — handcrafted to order
              and delivered to every PIN code in India.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="primary" size="lg" href="/products">
                Shop all products
              </Button>
              <Button variant="outline" size="lg" href="/customize">
                Customise Now
              </Button>
            </div>

            {/* Social proof line */}
            <p className="mt-6 text-xs font-sans text-muted">
              <span className="font-semibold text-ink">4,200+</span> happy customers ·{' '}
              <span className="font-semibold text-ink">4.7 ★</span> average rating
            </p>
          </div>

          {/* ── Right: Product image cluster ───────────────────────────────── */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroImages.map((img, i) => (
                <div
                  key={img.src}
                  className={`relative overflow-hidden rounded-2xl bg-panel shadow-card
                    ${i === 0 ? 'aspect-[4/5]' : ''}
                    ${i === 1 ? 'aspect-square mt-6' : ''}
                    ${i === 2 ? 'aspect-square' : ''}
                    ${i === 3 ? 'aspect-[4/5] -mt-6' : ''}
                  `}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 35vw, 22vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white pointer-events-none" />
    </section>
  )
}
