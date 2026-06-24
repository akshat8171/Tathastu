'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useCart } from '@/components/cart/cart-context'
import productsData from '@/lib/products.json'
import type { ProductCardData } from '@/components/ui'

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
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="primary" size="lg" href={slide.ctaHref}>
                {slide.ctaLabel}
              </Button>
              <Button variant="outline" size="lg" href="/customize">
                Customise Now
              </Button>
            </div>
          </div>

          {/* ── Right: product mini-cards for this slide ── */}
          <div key={`cards-${active}`} className="flex-1 w-full animate-fade-in">
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-end overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {products.map((p) => (
                <MiniCard key={p.id} product={p} />
              ))}
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
