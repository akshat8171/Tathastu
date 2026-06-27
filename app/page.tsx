/**
 * Layerix — Homepage
 *
 * Server component that composes all homepage sections.
 * Sections that rely on useCart (ProductCard) are wrapped in
 * client-component boundaries: BestSellers, CategoryRails.
 */

import { HeroCarousel }        from '@/components/homepage/hero-carousel'
import { CategoryIcons }       from '@/components/homepage/category-icons'
import { PromoStrip }          from '@/components/homepage/promo-strip'
import { BestSellers }         from '@/components/homepage/best-sellers'
import { TrustBand }           from '@/components/homepage/trust-band'
import { CategoryRails }       from '@/components/homepage/category-rails'
import { ReviewsSection }      from '@/components/homepage/reviews-section'
import { IdeaCta }             from '@/components/homepage/idea-cta'
import { PhotoUploadSection }  from '@/components/homepage/photo-upload-section'
import { InstagramReels }      from '@/components/homepage/instagram-reels'
import { NewsletterForm }      from '@/components/layout/newsletter-form'

export default function HomePage() {
  return (
    <>
      {/* 1. Hero carousel (with WhatsApp secondary CTA) */}
      <HeroCarousel />

      {/* 2. Category grid */}
      <CategoryIcons />

      {/* 3. Promo strip (FIRST20 — 20% off, min ₹199) */}
      <PromoStrip />

      {/* 4. Best Sellers */}
      <BestSellers />

      {/* 5. Trust band */}
      <TrustBand />

      {/* 6. Per-category rails */}
      <CategoryRails />

      {/* 7. Customer reviews */}
      <ReviewsSection />

      {/* 8. Photo → Keychain / Portrait upload section */}
      <PhotoUploadSection />

      {/* 9. Idea / Custom CTA */}
      <IdeaCta />

      {/* 10. Instagram Reels marquee */}
      <InstagramReels />

      {/* 11. Newsletter signup (above footer, additive chrome) */}
      <section className="py-14 sm:py-20 bg-white border-t border-gray-100" aria-label="Newsletter signup">
        <div className="container-page">
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
