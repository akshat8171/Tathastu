/**
 * Layerix — Homepage
 *
 * Server component that composes all homepage sections.
 * Sections that rely on useCart (ProductCard) are wrapped in
 * client-component boundaries: BestSellers, CategoryRails.
 */

import { HeroCarousel }    from '@/components/homepage/hero-carousel'
import { CategoryIcons }   from '@/components/homepage/category-icons'
import { PromoStrip }      from '@/components/homepage/promo-strip'
import { BestSellers }     from '@/components/homepage/best-sellers'
import { TrustBand }       from '@/components/homepage/trust-band'
import { CategoryRails }   from '@/components/homepage/category-rails'
import { ReviewsSection }  from '@/components/homepage/reviews-section'
import { IdeaCta }         from '@/components/homepage/idea-cta'

export default function HomePage() {
  return (
    <>
      {/* 1. Hero carousel */}
      <HeroCarousel />

      {/* 2. Category grid */}
      <CategoryIcons />

      {/* 3. Promo strip */}
      <PromoStrip />

      {/* 4. Best Sellers */}
      <BestSellers />

      {/* 5. Trust band */}
      <TrustBand />

      {/* 6. Per-category rails */}
      <CategoryRails />

      {/* 7. Customer reviews */}
      <ReviewsSection />

      {/* 8. Idea / Custom CTA */}
      <IdeaCta />
    </>
  )
}
