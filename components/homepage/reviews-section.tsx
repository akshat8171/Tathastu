'use client'

import { useState } from 'react'
import styles from './reviews-section.module.css'

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
    text: "I've been searching for high-quality, handcrafted homeware in India, and Rustic Stone exceeded my expectations. The ceramic platters are not only beautiful but also durable. I love how they elevate my dining experience.",
  },
  {
    id: 2,
    name: 'Rohan Sinha',
    location: 'Kolkata',
    rating: 5,
    text: "I ordered a set of bowls, and the craftsmanship is evident in every detail. They've become my go-to for unique gifts and home decor. Rustic Stone's collection is simply amazing.",
  },
  {
    id: 3,
    name: 'Aditi Rao',
    location: 'Chennai',
    rating: 5,
    text: 'I needed something special for a housewarming gift, and Rustic Stone delivered exactly what I had in mind. The ceramics are gorgeous, and the packaging was elegant too. My family loved these products.',
  },
  {
    id: 4,
    name: 'Simran Kaur',
    location: 'Chandigarh',
    rating: 5,
    text: 'I love supporting local artisans, and Rustic Stone makes it so easy with their beautifully crafted products. The ceramic glasses I bought are not just practical but also add a stylish touch to my kitchen.',
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
      className={styles.quoteIcon}
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

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <div className={styles.sectionBlock}>
          <div className={`${styles.subtop} ${styles.textCenter}`}>HEAR FROM OUR HAPPY CLIENTS</div>
          <h3 className={`${styles.sectionTitle} ${styles.textCenter}`}>Reviews</h3>

          <div className={styles.quotesWrapper}>
            <div className={styles.quotesSlider}>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`${styles.quoteSlide} ${index === currentIndex ? styles.quoteSlideActive : ''}`}
                >
                  <div className={styles.quoteWrap}>
                    <div className={styles.quoteHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerName}>
                          {review.name}, {review.location}
                        </div>
                        <ul className={styles.rating}>
                          {[...Array(review.rating)].map((_, i) => (
                            <li key={i} className={styles.rated}>
                              <StarIcon />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <QuoteIcon />
                    </div>
                    <div className={styles.quoteText}>{review.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <ul className={styles.dots}>
              {reviews.map((_, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className={`${styles.dotsButton} ${index === currentIndex ? styles.dotsButtonActive : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to review ${index + 1}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
