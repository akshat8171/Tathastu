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
import { applyPhotoshootHomepageDefaults } from '@/lib/catalog/homepage'
import type { ProductCardData } from '@/components/ui'
import type { HeroSlide } from '@/lib/catalog/types'

export const revalidate = 60

/** Seasonal lead slide. Uses our own catalog photos, not anyone else's. */
const DIWALI_SLIDE: HeroSlide = {
  eyebrow: 'Diwali at home',
  headline: 'Light the',
  highlight: 'house.',
  subcopy:
    'Lakshmi and Ganesha, a mandir piece, a warm lamp, and a dual-name plank for the people you are gifting. Printed in Agra. Diwali is 8 November — order this week if it has to arrive before the puja.',
  ctaLabel: 'Shop Diwali decor',
  ctaHref: '/products?category=pooja-decor',
  productIds: [
    'pooja-decor-lakshmi',
    'pooja-decor-ganesha',
    'pooja-decor-kanhaji',
    'pooja-decor-temple',
    'lamps-lunar-night',
    'lamps-glow-arc',
    'home-decor-dual-name-plank',
    'home-decor-dual-name-plank-light',
  ],
}

const DIWALI_LEAD_IDS = DIWALI_SLIDE.productIds

export default async function HomePage() {
  const webSiteSchema = getWebSiteSchema()
  const [products, storedSettings] = await Promise.all([getCatalogProducts(), getHomepageSettings()])
  const settings = applyPhotoshootHomepageDefaults(
    storedSettings,
    products.map((product) => product.id)
  )
  const { sections } = settings

  const minPriceByCategory: Record<string, number> = {}
  for (const product of products) {
    const current = minPriceByCategory[product.category]
    if (current === undefined || product.price < current) {
      minPriceByCategory[product.category] = product.price
    }
  }

  const bestSellerOrder = [
    ...DIWALI_LEAD_IDS,
    ...settings.bestSellerIds.filter((id) => !DIWALI_LEAD_IDS.includes(id)),
  ]
  const bestSellers = bestSellerOrder
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product))

  const heroSlides =
    settings.heroSlides[0]?.eyebrow === DIWALI_SLIDE.eyebrow
      ? settings.heroSlides
      : [DIWALI_SLIDE, ...settings.heroSlides]

  const rails = settings.categoryRails.map((rail) => ({
    ...rail,
    title: rail.slug === 'pooja-decor' ? 'Diwali pooja' : rail.title,
    subtitle:
      rail.slug === 'pooja-decor'
        ? 'Lakshmi, Ganesha and mandir pieces for the November puja.'
        : rail.slug === 'home-decor'
          ? 'Name planks and shelf pieces to gift with the sweets.'
          : rail.subtitle,
    products: products.filter((product) => product.category === rail.slug).slice(0, 10) as ProductCardData[],
  }))

  return (
    <>
      {/* WebSite Schema JSON-LD for sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {sections.hero && <HeroCarousel slides={heroSlides} products={products} />}

      {sections.categories && <CategoryIcons minPriceByCategory={minPriceByCategory} />}

      {sections.promo && settings.promo.enabled && (
        <PromoStrip
          headline="Diwali gifting · 20% off your first order"
          subcopy="One-time code · Printed in Agra · Free shipping on orders above ₹1500"
          code={settings.promo.code}
        />
      )}

      {sections.bestSellers && (
        <BestSellers
          products={bestSellers}
          title="For the Diwali home"
          subtitle="Idols, lamps and dual-name planks from our own workshop. The plank is already ₹100 under the usual desk-plank rate."
        />
      )}

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
