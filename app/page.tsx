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
import { getWebSiteSchema } from '@/lib/schema'
import { getCatalogProducts, getHomepageSettings } from '@/lib/catalog/store'
import type { ProductCardData } from '@/components/ui'

export const revalidate = 60

export default async function HomePage() {
  const webSiteSchema = getWebSiteSchema()
  const [products, settings] = await Promise.all([getCatalogProducts(), getHomepageSettings()])
  const { sections } = settings

  const minPriceByCategory: Record<string, number> = {}
  for (const product of products) {
    const current = minPriceByCategory[product.category]
    if (current === undefined || product.price < current) {
      minPriceByCategory[product.category] = product.price
    }
  }

  const bestSellers = settings.bestSellerIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product))

  const rails = settings.categoryRails.map((rail) => ({
    ...rail,
    products: products.filter((product) => product.category === rail.slug).slice(0, 10) as ProductCardData[],
  }))

  return (
    <>
      {/* WebSite Schema JSON-LD for sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {sections.hero && <HeroCarousel slides={settings.heroSlides} products={products} />}

      {sections.categories && <CategoryIcons minPriceByCategory={minPriceByCategory} />}

      {sections.promo && settings.promo.enabled && (
        <PromoStrip
          headline={settings.promo.headline}
          subcopy={settings.promo.subcopy}
          code={settings.promo.code}
        />
      )}

      {sections.bestSellers && <BestSellers products={bestSellers} />}

      {sections.trust && <TrustBand />}

      {sections.rails && <CategoryRails rails={rails} />}

      {sections.reviews && <ReviewsSection />}

      {sections.photoUpload && <PhotoUploadSection />}

      {sections.ideaCta && <IdeaCta />}

      {sections.instagram && <InstagramReels />}

      {sections.newsletter && (
        <section className="py-14 sm:py-20 bg-white border-t border-gray-100" aria-label="Newsletter signup">
          <div className="container-page">
            <NewsletterForm />
          </div>
        </section>
      )}
    </>
  )
}
