'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from './meet-founder.module.css'

export function MeetFounder() {
  return (
    <section className={styles.meetFounderSection}>
      <div className={styles.container}>
        <div className={styles.sectionBlock}>
          <div className={`${styles.row} ${styles.noGutters}`}>
            {/* Image Column */}
            <div className={`${styles.colMd6} ${styles.imageColumn}`}>
              <div className={styles.flexItem}>
                <div className={`${styles.imageContainer} ${styles.overflowHidden}`}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src="https://shoprusticstone.com/cdn/shop/files/Kanupriya_Kajaria_Founder_-_Rustic_Stone_India_16e80925-590b-408f-b1bb-968a3dd5f833.jpg?v=1752557651&width=1080"
                      alt="Kanupriya Kajaria - Founder of Tathastu"
                      className={`${styles.image} ${styles.scaleIn}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className={`${styles.colMd6} ${styles.textColumn}`}>
              <div className={styles.contentWrapper}>
                <div className={styles.contentInner}>
                  <div className={styles.textContent}>
                    <h3 className={styles.founderTitle}>Meet Our Founder</h3>
                    <div className={styles.founderDescription}>
                      <p>
                        Hello! I&apos;m <em><strong>Kanupriya Kajaria</strong></em>, the founder of Tathastu. 
                        After spending seven years in investment banking and private equity in Dubai, 
                        I returned to India, drawn back by the warmth of home and the beauty of our artisanal heritage.
                      </p>
                      <p>
                        My childhood memories of exploring local markets filled with unique handcrafted items 
                        inspired me to start this brand.
                      </p>
                    </div>
                    <div className={styles.buttonWrapper}>
                      <Link href="/about" className={`${styles.btn} ${styles.btnUnderline}`}>
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
