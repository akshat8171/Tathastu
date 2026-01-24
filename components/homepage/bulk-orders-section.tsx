'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from './bulk-orders-section.module.css'

export function BulkOrdersSection() {
  return (
    <section className={styles.bulkOrdersSection}>
      <div className={styles.container}>
        <div className={styles.sectionBlock}>
          <div className={`${styles.row} ${styles.noGutters}`}>
            {/* Image Column */}
            <div className={`${styles.colMd6} ${styles.imageColumn}`}>
              <div className={styles.flexItem}>
                <div className={`${styles.imageContainer} ${styles.overflowHidden}`}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src="https://shoprusticstone.com/cdn/shop/files/ll-Photoroom_1.jpg?v=1751653689&width=1080"
                      alt="Bulk Orders - Handcrafted Ceramics"
                      className={`${styles.image} ${styles.scaleIn}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
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
                    <div className={styles.subtop}>Enquire</div>
                    <h3 className={styles.sectionTitle}>Bulk Orders</h3>
                    <p className={styles.description}>
                      Looking for high-quality homeware items in bulk? We&apos;ve got you covered! 
                      Whether you&apos;re a business, event planner, or retailer, we offer exclusive 
                      bulk order options tailored to your needs.
                    </p>
                    <div className={styles.buttonWrapper}>
                      <Link href="/bulk-order" className={`${styles.btn} ${styles.btnTheme}`}>
                        Know More
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
