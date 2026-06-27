'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useCart } from '@/components/cart/cart-context'
import productsData from '@/lib/products.json'
import type { ProductCardData } from '@/components/ui'
import { SITE, waLink } from '@/lib/site'

const allProducts = productsData as ProductCardData[]
const byId = (id: string) => allProducts.find((p) => p.id === id)

interface Slide {
  eyebrow: string
  headline: string
  highlight: string
  subcopy: string
  ctaLabel: string
  ctaHref: string
  productIds: string[]
}

// Each slide is themed around a category and showcases 4 real products.
const SLIDES: Slide[] = [
  {
    eyebrow: 'Pooja & Decor',
    headline: 'Devotion,',
    highlight: 'beautifully printed.',
    subcopy:
      'Intricately detailed idols, diya stands and pooja essentials crafted for your sacred space.',
    ctaLabel: 'Shop Pooja & Decor',
    ctaHref: '/products?category=pooja-decor',
    productIds: ['pooja-decor-ganesha', 'pooja-decor-lakshmi', 'pooja-decor-krishna', 'pooja-decor-temple'],
  },
  {
    eyebrow: 'Keyrings & Bag Tags',
    headline: 'Personalised,',
    highlight: 'built to last.',
    subcopy:
      'Name keyrings and bag tags printed in vivid multi-colour — the perfect little everyday statement.',
    ctaLabel: 'Shop Keyrings',
    ctaHref: '/products?category=keyrings',
    productIds: ['keyrings-name', 'keyrings-puppy', 'keyrings-tennis', 'keyrings-shiva'],
  },
  {
    eyebrow: 'Gaming & Fun',
    headline: 'One-of-a-kind,',
    highlight: 'made to order.',
    subcopy:
      'Collectible 3D-printed pieces for fans and gamers — crisp detail, bold colour, endless personality.',
    ctaLabel: 'Shop Gaming',
    ctaHref: '/products?category=gaming',
    productIds: ['gaming-shield', 'gaming-gamepad', 'gaming-toad', 'gaming-question'],
  },
]

const AUTO_ADVANCE_MS = 5500

function MiniCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart()
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  function add(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      variant: 'Default',
      price: product.price,
      originalPrice: product.originalPrice ?? product.price,
      quantity: 1,
      image: product.images[0] ?? '',
    })
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block w-28 sm:w-32 flex-shrink-0 rounded-card2 bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-square bg-panel overflow-hidden">
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          sizes="128px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {/* Sale badge top-left */}
        <span className="absolute top-1.5 left-1.5 bg-sale text-white text-[9px] font-display font-semibold px-1.5 py-0.5 rounded leading-none shadow-badge">
          Sale
        </span>
        {discountPct !== null && (
          <span className="absolute top-1.5 right-1.5 bg-discount text-white text-[9px] font-display font-semibold px-1.5 py-0.5 rounded leading-none shadow-badge">
            {discountPct}% OFF
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="font-display font-bold text-ink text-xs">₹{product.price}</span>
        <button
          onClick={add}
          aria-label={`Add ${product.name} to cart`}
          className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-600 transition-colors flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </Link>
  )
}

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback((i: number) => setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length), [])

  // Auto-advance (pauses on hover/focus).
  useEffect(() => {
    if (paused) return
    timer.current = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), AUTO_ADVANCE_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [active, paused])

  const slide = SLIDES[active]
  const products = slide.productIds.map(byId).filter((p): p is ProductCardData => !!p)

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-violet/10 via-surface to-brand-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="container-page py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[300px] lg:min-h-[340px]">

          {/* ── Left: themed copy (keyed so it re-animates per slide) ── */}
          <div key={active} className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0 animate-fade-in">
            <p className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-widest text-violet mb-4 bg-violet/10 px-3 py-1.5 rounded-full">
              {slide.eyebrow}
            </p>
            <h1 className="font-display font-extrabold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
              {slide.headline}{' '}
              <span className="text-brand">{slide.highlight}</span>
            </h1>
            <p className="font-sans text-muted text-base sm:text-lg leading-relaxed mb-7 max-w-md mx-auto lg:mx-0">
              {slide.subcopy}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start flex-wrap">
              <Button variant="primary" size="lg" href={slide.ctaHref}>
                {slide.ctaLabel}
              </Button>
              <Button variant="outline" size="lg" href="/customize">
                Customise Now
              </Button>
              {/* WhatsApp secondary CTA — number sourced from SITE frozen contract */}
              <a
                href={waLink('Hi! I saw your homepage and want to know more about custom 3D prints.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 font-display font-semibold px-6 py-3 rounded-pill text-sm bg-white hover:bg-green-50 transition-colors duration-200"
                aria-label={`Chat on WhatsApp — ${SITE.phone}`}
              >
                {/* WhatsApp icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ── Right: product mini-cards for this slide ── */}
          <div key={`cards-${active}`} className="flex-1 w-full animate-fade-in overflow-hidden">
            <div className="relative flex justify-center lg:justify-end">
              <div
                className="flex gap-3 sm:gap-4"
                style={{
                  animation: 'marquee-scroll 20s linear infinite',
                  animationPlayState: paused ? 'paused' : 'running',
                }}
              >
                {/* Original set of products */}
                {products.map((p) => (
                  <MiniCard key={p.id} product={p} />
                ))}
                {/* Duplicate set for seamless loop */}
                {products.map((p) => (
                  <MiniCard key={`${p.id}-duplicate`} product={p} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Dots ── */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'w-7 bg-brand' : 'w-2 bg-brand/30 hover:bg-brand/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
