/**
 * Tathastu Keepsakes — Homepage
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
import { getWebSiteSchema, getOrganizationSchema } from '@/lib/schema'

export default function HomePage() {
  const webSiteSchema = getWebSiteSchema()
  const organizationSchema = getOrganizationSchema()

  return (
    <>
      {/* Organization Schema JSON-LD for business entity */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* WebSite Schema JSON-LD for sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* 1. Hero carousel — rotating slides with product showcases */}
      <HeroCarousel />

      {/* 2. Promo strip — FIRST20 discount banner */}
      <PromoStrip />

      {/* 3. Category navigation grid */}
      <CategoryIcons />

      {/* 4. Best Sellers — curated top products */}
      <BestSellers />

      {/* 5. Trust indicators — delivery, quality, returns */}
      <TrustBand />

      {/* 6. Category product rails — browse by type */}
      <CategoryRails />

      {/* 7. Customer reviews and testimonials */}
      <ReviewsSection />

      {/* 8. Photo upload CTA — custom keychains/portraits */}
      <PhotoUploadSection />

      {/* 9. Tathastu Lab CTA — custom 3D printing services */}
      <IdeaCta />

      {/* 10. Instagram Reels showcase — social proof */}
      <InstagramReels />

      {/* 11. Newsletter signup — above footer */}
      <section className="py-14 sm:py-20 bg-white border-t border-gray-100" aria-label="Newsletter signup">
        <div className="container-page">
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
