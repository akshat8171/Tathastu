'use client'

import { useRef } from 'react'
import { ProductCard } from '@/components/products/product-card'
import type { ProductLabelType } from '@/types/product'

interface BestSellerProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  comparePrice?: number
  discountPercentage?: number
  image: string
  secondImageUrl?: string
  labelType?: ProductLabelType
  isSoldOut?: boolean
}

const bestSellers: BestSellerProduct[] = [
  {
    id: '1',
    name: 'Ancient Dragon Miniature',
    price: 2499,
    originalPrice: 2999,
    discountPercentage: 17,
    image: '/images/products/dragon.jpg',
    secondImageUrl: '/images/products/dragon-alt.jpg',
    labelType: 'trending',
  },
  {
    id: '2',
    name: 'Elven Archer Set',
    price: 1999,
    image: '/images/products/elven-archer.jpg',
    secondImageUrl: '/images/products/elven-archer-alt.jpg',
    labelType: 'editors-choice',
  },
  {
    id: '3',
    name: 'Ruined Castle Terrain',
    price: 3499,
    comparePrice: 3999,
    discountPercentage: 13,
    image: '/images/products/castle-terrain.jpg',
    secondImageUrl: '/images/products/castle-terrain-alt.jpg',
    labelType: 'lightning-deal',
  },
  {
    id: '4',
    name: 'Cyberpunk Hero',
    price: 2299,
    originalPrice: 2799,
    discountPercentage: 18,
    image: '/images/products/cyberpunk-hero.jpg',
    secondImageUrl: '/images/products/cyberpunk-hero-alt.jpg',
    labelType: 'trending',
  },
  {
    id: '5',
    name: 'Stone Troll',
    price: 1799,
    image: '/images/products/stone-troll.jpg',
    secondImageUrl: '/images/products/stone-troll-alt.jpg',
  },
  {
    id: '6',
    name: 'Medieval Knight',
    price: 2199,
    originalPrice: 2599,
    discountPercentage: 15,
    image: '/images/products/knight.jpg',
    secondImageUrl: '/images/products/knight-alt.jpg',
    labelType: 'new',
  },
]

export function BestSellers() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  function scrollLeft() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth',
      })
    }
  }

  function scrollRight() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-5 bg-[#ffffff] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="custom-headline mb-12">
          <h2 className="text-center">Best Sellers</h2>
        </div>

        {/* Navigation Arrow Left */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-colors"
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-[#000000]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="best-sellers-carousel"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {bestSellers.map((product) => (
            <div key={product.id} className="best-seller-item">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                comparePrice={product.comparePrice}
                discountPercentage={product.discountPercentage}
                image={product.image}
                secondImageUrl={product.secondImageUrl}
                labelType={product.labelType}
                isSoldOut={product.isSoldOut}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={scrollRight}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-colors"
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-[#000000]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .custom-headline h2 {
          font-family: var(--g-font-1);
          font-size: var(--g-h2-font-size);
          font-weight: var(--g-h2-font-weight);
          letter-spacing: var(--g-h2-font-spacing);
          line-height: var(--g-h2-font-lineheight);
          text-transform: var(--g-h2-font-transform);
          color: var(--g-color-heading);
        }

        @media (max-width: 768px) {
          .custom-headline h2 {
            font-size: var(--g-h2-font-size-mobile);
          }
        }

        .best-sellers-carousel {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding-bottom: 16px;
          -webkit-overflow-scrolling: touch;
        }

        .best-sellers-carousel::-webkit-scrollbar {
          display: none;
        }

        .best-seller-item {
          flex: 0 0 280px;
          scroll-snap-align: start;
        }

        @media (max-width: 768px) {
          .best-seller-item {
            flex: 0 0 240px;
          }
        }

        @media (max-width: 480px) {
          .best-seller-item {
            flex: 0 0 200px;
          }
        }
      `}</style>
    </section>
  )
}
