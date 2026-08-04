'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import productsData from '@/lib/products.json'
import type { ProductCardData } from '@/components/ui'
import { useCart } from '@/components/cart/cart-context'

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

// HE-08: 3 slides is intentional differentiation vs competitor's 2 — each slide is themed around a category and showcases matching products only.
const SLIDES: Slide[] = [
  {
    eyebrow: 'Pooja & Decor',
    headline: 'Devotion,',
    highlight: 'beautifully printed.',
    subcopy:
      'Intricately detailed idols, diya stands and pooja essentials crafted for your sacred space.',
    ctaLabel: 'Shop Pooja & Decor',
    ctaHref: '/products?category=pooja-decor',
    productIds: [
      'pooja-decor-ganesha',
      'pooja-decor-lakshmi',
      'pooja-decor-krishna',
      'pooja-decor-temple',
      'pooja-decor-shiva',
      'pooja-decor-saraswati',
      'pooja-decor-trishul',
      'pooja-decor-incense',
    ],
  },
  {
    eyebrow: 'Keyrings & Bag Tags',
    headline: 'Personalised,',
    highlight: 'built to last.',
    subcopy:
      'Name keyrings and bag tags printed in vivid multi-colour — the perfect little everyday statement.',
    ctaLabel: 'Shop Keyrings',
    ctaHref: '/products?category=keyrings',
    productIds: [
      'keyrings-name',
      'keyrings-puppy',
      'keyrings-tennis',
      'keyrings-shiva',
      'keyrings-numberplate',
      'keyrings-oreo',
      'keyrings-nike',
      'keyrings-airplane',
    ],
  },
  {
    eyebrow: 'Gaming & Fun',
    headline: 'One-of-a-kind,',
    highlight: 'made to order.',
    subcopy:
      'Collectible 3D-printed pieces for fans and gamers — crisp detail, bold colour, endless personality.',
    ctaLabel: 'Shop Gaming',
    ctaHref: '/products?category=gaming',
    productIds: [
      'gaming-shield',
      'gaming-gamepad',
      'gaming-toad',
      'gaming-question',
      'gaming-streamer',
      'gaming-ak47',
      'gaming-marlboro',
    ],
  },
]

const AUTO_ADVANCE_MS = 5500

function MiniCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const { addItem } = useCart()
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  function handleAddToCart(e: React.MouseEvent) {
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
      className="group relative block w-36 sm:w-44 lg:w-48 flex-shrink-0 rounded-card2 bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
      aria-label={`View ${product.name}`}
    >
      {/* BI-05: overflow-hidden on image container */}
      <div className="relative aspect-[4/5] bg-panel overflow-hidden">
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 192px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={priority}
        />

        {/* HE-01 / PC-03: Sale + %OFF stacked top-left */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span className="bg-sale text-white text-[10px] sm:text-xs font-display font-semibold px-2 py-1 rounded-full leading-none shadow-badge">
            Sale
          </span>
          {discountPct !== null && (
            <span className="bg-discount text-white text-[10px] sm:text-xs font-display font-semibold px-2 py-1 rounded-full leading-none shadow-badge">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* HE-01: white price pill + circular brand cart */}
        <div className="absolute inset-x-2 bottom-2 z-10 flex items-end justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs sm:text-sm font-display font-bold text-ink shadow-badge tabular-nums">
            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-1.5 text-[10px] font-medium text-muted line-through">
                ₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-badge hover:bg-brand-600 transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }, [])

  // HE-05: respect prefers-reduced-motion — no auto-advance if user prefers reduced motion
  useEffect(() => {
    if (paused) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    timer.current = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), AUTO_ADVANCE_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [active, paused])

  const slide = SLIDES[active]

  const slideProducts = useMemo(
    () =>
      slide.productIds
        .map(byId)
        .filter((p): p is ProductCardData => p !== undefined),
    [slide],
  )

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#EAF8F9] via-white to-[#F3EEF9]"
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="container-page py-10 sm:py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 min-h-[320px] lg:min-h-[400px]">

          <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            {/* HE-06: title-case eyebrow with softer pill styling */}
            <p className="inline-flex items-center gap-2 text-sm font-medium text-brand bg-brand/10 mb-4 px-3 py-1.5 rounded-full">
              {slide.eyebrow}
            </p>
            {/* HE-07: two-tone headline with softer contrast — brand highlight preserved */}
            <h1 className="font-display font-extrabold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
              {slide.headline}{' '}
              <span className="text-brand">{slide.highlight}</span>
            </h1>
            <p className="font-sans text-muted text-base sm:text-lg leading-relaxed mb-7 max-w-md mx-auto lg:mx-0">
              {slide.subcopy}
            </p>
            {/* HE-02 / HE-03: trailing arrow on primary; only 2 CTAs in hero (Shop + Tathastu Lab) */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start flex-wrap">
              <Button variant="primary" size="lg" href={slide.ctaHref}>
                {slide.ctaLabel}
                <span aria-hidden="true">→</span>
              </Button>
              <Button variant="outline" size="lg" href="/customize">
                Tathastu Lab
              </Button>
            </div>
          </div>

          {/* HE-05 / BI-03: horizontal snap scroll instead of infinite marquee */}
          <div
            className="flex-1 w-full min-w-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              key={slide.eyebrow}
              className="overflow-x-auto snap-x snap-mandatory no-scrollbar"
              aria-label={`${slide.eyebrow} products`}
            >
              <div className="flex gap-3 sm:gap-4 pe-3 sm:pe-4">
                {/* AX-05: only first card gets priority loading */}
                {slideProducts.map((p, i) => (
                  <div key={p.id} className="snap-start">
                    <MiniCard product={p} priority={i === 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HE-04: simple teal active pill + gray inactive dots, 44px hit targets */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
              aria-current={i === active}
              className="relative flex items-center justify-center w-11 h-11"
            >
              <span className={`block rounded-full transition-all duration-300 ${
                i === active ? 'w-8 h-2.5 bg-brand' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
