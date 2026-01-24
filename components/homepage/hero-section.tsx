'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Slide {
  id: number
  href: string
  desktopImg: string
  mobileImg: string
  alt: string
}

const slides: Slide[] = [
  {
    id: 1,
    href: '/collections/best-seller',
    desktopImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/Bestseller_1.jpg?v=1761383447',
    mobileImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/bestseller_mobile.jpg?v=1761383447',
    alt: 'Best Seller Collection',
  },
  {
    id: 2,
    href: '/collections/new-arrivals',
    desktopImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/Rustic_Newarival_homepage_3.jpg?v=1768227630',
    mobileImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/festive_sale_5.jpg?v=1768229871',
    alt: 'New Arrivals Collection',
  },
  {
    id: 3,
    href: '/pages/bulk-order',
    desktopImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/Wedding_6.jpg?v=1761383448',
    mobileImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/wedding_mobile_1.jpg?v=1761383448',
    alt: 'Bulk Orders',
  },
  {
    id: 4,
    href: '/collections/urban-eden',
    desktopImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/Planters_1.jpg?v=1761922595',
    mobileImg: 'https://cdn.shopify.com/s/files/1/0893/1563/9581/files/Planters_Msite.jpg?v=1761922594',
    alt: 'Planters Collection',
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideInterval, setSlideInterval] = useState<NodeJS.Timeout | null>(null)

  const showSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const resetInterval = useCallback(() => {
    if (slideInterval) {
      clearInterval(slideInterval)
    }
    const interval = setInterval(nextSlide, 4000)
    setSlideInterval(interval)
  }, [nextSlide, slideInterval])

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000)
    setSlideInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [nextSlide])

  const handleNext = () => {
    nextSlide()
    resetInterval()
  }

  const handlePrev = () => {
    prevSlide()
    resetInterval()
  }

  return (
    <section className="custom-slideshow" id="customSlideshow">
      {slides.map((slide, index) => (
        <Link
          key={slide.id}
          href={slide.href}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
        >
          <Image
            src={slide.desktopImg}
            alt={`${slide.alt} Desktop`}
            className="desktop-img"
            fill
            priority={index === 0}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <Image
            src={slide.mobileImg}
            alt={`${slide.alt} Mobile`}
            className="mobile-img"
            fill
            priority={index === 0}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      ))}

      {/* Navigation Arrows */}
      <button
        className="arrow left"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handlePrev()
        }}
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        className="arrow right"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleNext()
        }}
        aria-label="Next slide"
      >
        ❯
      </button>

      <style jsx>{`
        .custom-slideshow {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 80vh;
          min-height: 600px;
          max-height: 900px;
        }

        .slide {
          display: none;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transition: opacity 0.8s ease-in-out;
          opacity: 0;
        }

        .slide.active {
          display: block;
          position: relative;
          opacity: 1;
        }

        .slide img {
          width: 100%;
          height: 100%;
          display: block;
        }

        .desktop-img {
          display: block;
        }

        .mobile-img {
          display: none;
        }

        @media only screen and (max-width: 749px) {
          .desktop-img {
            display: none;
          }
          .mobile-img {
            display: block;
          }
        }

        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 24px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          text-align: center;
          line-height: 45px;
          cursor: pointer;
          z-index: 9;
          user-select: none;
          border: none;
          padding: 0;
          transition: background 0.3s ease;
        }

        .arrow:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .arrow.left {
          left: 15px;
        }

        .arrow.right {
          right: 15px;
        }

        @media (max-width: 749px) {
          .arrow {
            width: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 20px;
          }

          .arrow.left {
            left: 10px;
          }

          .arrow.right {
            right: 10px;
          }
        }
      `}</style>
    </section>
  )
}
