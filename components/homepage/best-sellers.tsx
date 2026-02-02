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
    id: 'lamps-lamp2',
    name: 'Modern Elegance Lamp',
    price: 2499,
    originalPrice: 2999,
    discountPercentage: 17,
    image: '/images/products/lamps/lamp2/IMG_2517.jpeg',
    secondImageUrl: '/images/products/lamps/lamp2/IMG_2585.jpeg',
    labelType: 'trending',
  },
  {
    id: 'lamps-lamp3',
    name: 'Contemporary Style Lamp',
    price: 2799,
    originalPrice: 3299,
    discountPercentage: 15,
    image: '/images/products/lamps/lamp3/2025-05-16_6a8ec33265afa8.webp',
    secondImageUrl: '/images/products/lamps/lamp3/2025-05-16_af6d1e89fb36e8.webp',
    labelType: 'editors-choice',
  },
  {
    id: 'planters-planter2',
    name: 'STEMRA Stackable Planter Set',
    price: 2199,
    originalPrice: 2699,
    discountPercentage: 19,
    image: '/images/products/planters/planter2/STACKABLE.jpg',
    secondImageUrl: '/images/products/planters/planter2/STACKABLE20(2).jpg',
    labelType: 'editors-choice',
  },
  {
    id: 'lamps-lamp5',
    name: 'Minimalist Modern Lamp',
    price: 2899,
    originalPrice: 3399,
    discountPercentage: 15,
    image: '/images/products/lamps/lamp5/09d2f170-e355-11f0-a875-5de986fdb37b.jpg',
    secondImageUrl: '/images/products/lamps/lamp5/1e1873a1-f9d3-11f0-8107-5181291209f7.jpg',
    labelType: 'trending',
  },
  {
    id: 'planters-planter1',
    name: 'CACTIA Cactus Planter',
    price: 1499,
    originalPrice: 1799,
    discountPercentage: 17,
    image: '/images/products/planters/planter1/CACTIA20planter202.jpg',
    secondImageUrl: '/images/products/planters/planter1/CACTIA20planter203.jpg',
    labelType: 'trending',
  },
  {
    id: 'organizers-organizer3',
    name: 'TISTWO Tissue Box Organizer',
    price: 1599,
    originalPrice: 1899,
    discountPercentage: 16,
    image: '/images/products/organizers/organizer3/TISTWO20tissue20box.jpg',
    secondImageUrl: '/images/products/organizers/organizer3/TISTWO20tissue20box202.jpg',
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
    <section className="py-5 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="custom-headline mb-6">
          <h2 className="text-center">Best Sellers</h2>
        </div>

        <div className="relative">
          {/* Navigation Arrow Left */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-colors"
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
              <div key={product.id} className="best-seller-item best-seller-card-wrapper">
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
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-colors"
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
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding: 16px 0;
          -webkit-overflow-scrolling: touch;
        }

        .best-sellers-carousel::-webkit-scrollbar {
          display: none;
        }

        .best-seller-item {
          flex: 0 0 240px;
          scroll-snap-align: start;
        }

        /* Square card wrapper with centered image - Theme Matched */
        .best-seller-card-wrapper :global(.product-card) {
          height: 100%;
          background: #fff;
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          transition: transform var(--duration-default) ease, box-shadow var(--duration-default) ease;
        }

        .best-seller-card-wrapper :global(.product-card:hover) {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .best-seller-card-wrapper :global(.product-card__image-wr) {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .best-seller-card-wrapper :global(.product-card__image) {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          padding-top: 0 !important;
          display: block;
        }

        .best-seller-card-wrapper :global(.product-card__image img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }

        .best-seller-card-wrapper :global(.product-card__info) {
          padding: 12px;
          background: #fff;
        }

        .best-seller-card-wrapper :global(.product-card__name) {
          font-family: var(--g-font-1);
          font-size: var(--g-h6-font-size);
          font-weight: var(--g-h6-font-weight);
          letter-spacing: var(--g-h6-font-spacing);
          text-transform: var(--g-h6-font-transform);
          color: var(--g-color-heading);
          margin-bottom: 6px;
          line-height: 1.3;
          display: block;
          text-decoration: none;
        }

        .best-seller-card-wrapper :global(.product-card__name:hover) {
          color: var(--g-main);
        }

        .best-seller-card-wrapper :global(.product-card__price) {
          font-family: var(--g-font-2);
          font-size: var(--g-font-size);
          font-weight: var(--g-font-weight-btn);
          color: var(--g-color-heading);
        }

        .best-seller-card-wrapper :global(.product-card__price .money) {
          font-weight: 600;
        }

        .best-seller-card-wrapper :global(.product-card__regular-price) {
          font-size: calc(var(--g-font-size) - 1px);
          color: #999;
          margin-left: 6px;
        }

        .best-seller-card-wrapper :global(.badge.percent_off) {
          font-size: calc(var(--g-font-size) - 2px);
          color: #d32f2f;
          font-weight: 500;
          margin-left: 4px;
        }

        @media (max-width: 768px) {
          .best-seller-item {
            flex: 0 0 200px;
          }

          .best-seller-card-wrapper :global(.product-card__image-wr) {
            height: 200px;
          }

          .best-seller-card-wrapper :global(.product-card__info) {
            padding: 10px;
          }
        }

        @media (max-width: 480px) {
          .best-seller-item {
            flex: 0 0 180px;
          }

          .best-seller-card-wrapper :global(.product-card__image-wr) {
            height: 180px;
          }

          .best-seller-card-wrapper :global(.product-card__name) {
            font-size: 12px;
          }

          .best-seller-card-wrapper :global(.product-card__price) {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  )
}
