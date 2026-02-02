'use client'

import { useState, useEffect, useRef } from 'react'
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

export function BannerSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if CSS is loaded and first slide images are ready
  useEffect(() => {
    if (typeof window === 'undefined') return

    let imageLoaded = false
    let cssReady = false

    const checkComplete = () => {
      if (imageLoaded && cssReady) {
        setIsLoaded(true)
      }
    }

    // Wait for CSS to be applied (give it a moment)
    const cssTimer = setTimeout(() => {
      cssReady = true
      checkComplete()
    }, 100)

    // Preload first slide images
    const firstSlide = slides[0]
    const desktopImg = new Image()
    const mobileImg = new Image()

    const handleImageLoad = () => {
      if (desktopImg.complete && mobileImg.complete) {
        imageLoaded = true
        checkComplete()
      }
    }

    desktopImg.onload = handleImageLoad
    mobileImg.onload = handleImageLoad
    desktopImg.src = firstSlide.desktopImg
    mobileImg.src = firstSlide.mobileImg

    // Fallback: show content after max 800ms
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 800)

    return () => {
      clearTimeout(cssTimer)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    if (!isLoaded) return

    const startAutoSlide = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 4000)
    }

    startAutoSlide()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLoaded])

  const handleNext = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length
      return next
    })
    // Restart interval after manual navigation
    setTimeout(() => {
      if (intervalRef.current === null) {
        intervalRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)
      }
    }, 100)
  }

  const handlePrev = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentSlide((prev) => {
      const next = (prev - 1 + slides.length) % slides.length
      return next
    })
    // Restart interval after manual navigation
    setTimeout(() => {
      if (intervalRef.current === null) {
        intervalRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)
      }
    }, 100)
  }

  return (
    <section className="custom-slideshow" id="customSlideshow">
      {!isLoaded && (
        <div className="slideshow-skeleton">
          <div className="skeleton-shimmer" />
        </div>
      )}
      <div style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {slides.map((slide, index) => {
          const isActive = index === currentSlide
          return (
            <Link
              key={slide.id}
              href={slide.href}
              className={isActive ? 'slide active' : 'slide'}
              style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
              <img
                src={slide.desktopImg}
                alt={`${slide.alt} Desktop`}
                className="desktop-img"
              />
              <img
                src={slide.mobileImg}
                alt={`${slide.alt} Mobile`}
                className="mobile-img"
              />
            </Link>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {isLoaded && (
        <>
          <button
            type="button"
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
            type="button"
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
        </>
      )}

      <style jsx global>{`
        .custom-slideshow {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 60vh;
          min-height: 300px;
          max-height: 900px;
        }

        .custom-slideshow .slide {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          z-index: 1;
          display: block;
        }

        .custom-slideshow .slide.active {
          opacity: 1;
          z-index: 2;
        }

        .custom-slideshow .slide img {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .custom-slideshow .desktop-img {
          display: block;
        }

        .custom-slideshow .mobile-img {
          display: none;
        }

        @media only screen and (max-width: 749px) {
          .custom-slideshow .desktop-img {
            display: none !important;
            visibility: hidden;
          }
          .custom-slideshow .mobile-img {
            display: block !important;
            visibility: visible;
          }
        }

        .custom-slideshow .arrow {
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
          z-index: 10;
          user-select: none;
          border: none;
          padding: 0;
          transition: background 0.3s ease;
          pointer-events: auto;
        }

        .custom-slideshow .arrow:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .custom-slideshow .arrow.left {
          left: 15px;
        }

        .custom-slideshow .arrow.right {
          right: 15px;
        }

        @media (max-width: 749px) {
          .custom-slideshow .arrow {
            width: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 20px;
          }

          .custom-slideshow .arrow.left {
            left: 10px;
          }

          .custom-slideshow .arrow.right {
            right: 10px;
          }
        }

        .custom-slideshow .slideshow-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          z-index: 10;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .custom-slideshow .skeleton-shimmer {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </section>
  )
}
