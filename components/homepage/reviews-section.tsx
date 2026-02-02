'use client'

import { useState, useRef, useEffect } from 'react'

interface Review {
  id: number
  name: string
  location: string
  rating: number
  text: string
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Nisha Agarwal',
    location: 'Mumbai',
    rating: 5,
    text: "I've been searching for high-quality, handcrafted homeware in India, and Layerix exceeded my expectations. The ceramic platters are not only beautiful but also durable. I love how they elevate my dining experience.",
  },
  {
    id: 2,
    name: 'Rohan Sinha',
    location: 'Kolkata',
    rating: 5,
    text: "I ordered a set of bowls, and the craftsmanship is evident in every detail. They've become my go-to for unique gifts and home decor. Layerix's collection is simply amazing.",
  },
  {
    id: 3,
    name: 'Aditi Rao',
    location: 'Chennai',
    rating: 5,
    text: 'I needed something special for a housewarming gift, and Layerix delivered exactly what I had in mind. The ceramics are gorgeous, and the packaging was elegant too. My family loved these products.',
  },
  {
    id: 4,
    name: 'Simran Kaur',
    location: 'Chandigarh',
    rating: 5,
    text: 'I love supporting local artisans, and Layerix makes it so easy with their beautifully crafted products. The ceramic glasses I bought are not just practical but also add a stylish touch to my kitchen.',
  },
]

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="currentColor"
      opacity="0.15"
    >
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  )
}

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const goToSlide = (index: number) => {
    if (index >= 0 && index < reviews.length && index !== currentIndex) {
      setIsNavigating(true)
      setCurrentIndex(index)
      
      // Immediately scroll to the selected slide
      if (sliderRef.current) {
        const slideWidth = sliderRef.current.offsetWidth
        sliderRef.current.scrollTo({
          left: index * slideWidth,
          behavior: 'smooth',
        })
      }
      
      // Reset navigation flag after animation
      setTimeout(() => setIsNavigating(false), 500)
    }
  }

  const snapToSlide = () => {
    if (!sliderRef.current) return
    const slideWidth = sliderRef.current.offsetWidth
    const newIndex = Math.round(sliderRef.current.scrollLeft / slideWidth)
    const clampedIndex = Math.max(0, Math.min(newIndex, reviews.length - 1))
    setCurrentIndex(clampedIndex)
    sliderRef.current.scrollTo({
      left: clampedIndex * slideWidth,
      behavior: 'smooth',
    })
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    snapToSlide()
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    snapToSlide()
  }

  // Update currentIndex based on scroll position (only when not dragging or navigating)
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleScroll = () => {
      // Don't update index if user is dragging or we're programmatically navigating
      if (isDragging || isNavigating) return
      
      const slideWidth = slider.offsetWidth
      const newIndex = Math.round(slider.scrollLeft / slideWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reviews.length) {
        setCurrentIndex(newIndex)
      }
    }

    slider.addEventListener('scroll', handleScroll)
    return () => slider.removeEventListener('scroll', handleScroll)
  }, [currentIndex, isDragging, isNavigating, reviews.length])

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-section-block">
          <div className="reviews-subtop">HEAR FROM OUR HAPPY CLIENTS</div>
          <h3 className="reviews-title">Reviews</h3>

          <div className="reviews-wrapper">
            <div
              ref={sliderRef}
              className="reviews-slider"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="review-slide">
                  <div className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-name">
                          {review.name}, {review.location}
                        </div>
                        <ul className="rating-stars">
                          {[...Array(review.rating)].map((_, i) => (
                            <li key={i} className="star-item">
                              <StarIcon />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <QuoteIcon />
                    </div>
                    <div className="review-text">{review.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <ul className="review-dots">
              {reviews.map((_, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className={`dot-button ${index === currentIndex ? 'dot-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      goToSlide(index)
                    }}
                    aria-label={`Go to review ${index + 1}`}
                    aria-pressed={index === currentIndex}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reviews-section {
          background: #d1c1b2;
          padding: 60px 60px 80px 60px;
          margin: 0;
          width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 750px) {
          .reviews-section {
            padding: 30px 15px 40px 15px;
          }
        }

        .reviews-container {
          width: 100%;
          max-width: 1200px;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        @media (max-width: 768px) {
          .reviews-container {
            padding-right: 10px;
            padding-left: 10px;
          }
        }

        .reviews-section-block {
          width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .reviews-subtop {
          font-family: var(--g-font-1);
          font-size: var(--g-font-size-subtop);
          font-weight: var(--g-font-weight-subtop);
          letter-spacing: var(--g-font-spacing-subtop);
          text-transform: uppercase;
          color: var(--g-font-color-subtop);
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .reviews-title {
          font-family: var(--g-font-1);
          font-size: var(--g-h3-font-size);
          font-weight: var(--g-h3-font-weight);
          letter-spacing: var(--g-h3-font-spacing);
          line-height: var(--g-h3-font-lineheight);
          text-transform: var(--g-h3-font-transform);
          color: var(--g-color-heading);
          margin-bottom: 2rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .reviews-title {
            font-size: var(--g-h3-font-size-mobile);
          }
        }

        .reviews-wrapper {
          position: relative;
          width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .reviews-slider {
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
          display: flex;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          width: 100%;
          box-sizing: border-box;
        }

        .reviews-slider::-webkit-scrollbar {
          display: none;
        }

        .review-slide {
          min-width: 100%;
          width: 100%;
          max-width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 15px;
          flex-shrink: 0;
          scroll-snap-align: start;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .review-slide {
            padding: 0 10px;
          }
        }

        .review-card {
          background-color: #ffffff;
          padding: 2rem;
          max-width: 100%;
          width: 100%;
          position: relative;
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          box-sizing: border-box;
        }

        @media (max-width: 750px) {
          .review-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .review-card {
            padding: 1rem;
          }
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .reviewer-info {
          text-align: left;
        }

        .reviewer-name {
          font-family: var(--g-font-1);
          font-size: var(--g-h6-font-size);
          font-weight: var(--g-h6-font-weight);
          letter-spacing: var(--g-h6-font-spacing);
          line-height: var(--g-h6-font-lineheight);
          text-transform: var(--g-h6-font-transform);
          color: var(--g-color-heading);
          margin-bottom: 0.25rem;
        }

        .rating-stars {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 2px;
        }

        .star-item {
          color: #000000;
        }

        .star-item svg {
          width: 18px;
          height: 18px;
        }

        .review-text {
          font-family: var(--g-font-1);
          font-size: var(--g-p-font-size);
          font-weight: var(--g-p-font-weight);
          line-height: 1.7;
          color: var(--color-body-text);
          text-align: center;
          padding: 1rem 0;
        }

        .review-dots {
          display: flex;
          justify-content: center;
          list-style: none;
          padding: 0;
          margin: 2rem 0 0 0;
          gap: 8px;
          position: relative;
          z-index: 10;
        }

        .dot-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background-color: rgba(0, 0, 0, 0.3);
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
          outline: none;
        }

        .dot-button:hover {
          background-color: rgba(0, 0, 0, 0.6);
          transform: scale(1.2);
        }

        .dot-button:active {
          transform: scale(0.9);
        }

        .dot-active {
          background-color: #000000;
          transform: scale(1.3);
        }

        .dot-active:hover {
          transform: scale(1.4);
        }

        .review-header svg {
          color: #000000;
          flex-shrink: 0;
        }
      `}</style>
    </section>
  )
}
