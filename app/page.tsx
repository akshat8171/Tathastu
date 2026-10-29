/**
 * Tathastu Keepsakes — Homepage
 *
 * Server component that composes all homepage sections.
 * Sections that rely on useCart (ProductCard) are wrapped in
 * client-component boundaries: BestSellers, CategoryRails.
 */

import type { Metadata } from 'next'
import { HeroCarousel }        from '@/components/homepage/hero-carousel'
import { DiwaliIdolsBanner }   from '@/components/homepage/diwali-idols-banner'
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
import { DIWALI_DASHBOARD_IDOL_ID_LIST } from '@/lib/catalog/diwali-dashboard-idols'
import type { ProductCardData } from '@/components/ui'
import type { HeroSlide } from '@/lib/catalog/types'

export const revalidate = 60

/** Homepage owns the self-referential canonical (removed from root layout). */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

/** Seasonal lead slide — studio photography of the Diwali dashboard idol set. */
const DIWALI_SLIDE: HeroSlide = {
  eyebrow: 'Diwali dashboard idols',
  headline: 'Bless the',
  highlight: 'drive.',
  subcopy:
    'This Diwali, order these car dashboard idols from Tathastu Keepsakes — Baby Shiva, Shiva on Nandi, Ganesha, Krishna, Hanuman and Laxmi Ganesh. Flat base, printed in Agra. Diwali is 8 November.',
  ctaLabel: 'Shop dashboard idols',
  ctaHref: '/shop/pooja-decor',
  productIds: DIWALI_DASHBOARD_IDOL_ID_LIST,
}

const DIWALI_LEAD_IDS = DIWALI_DASHBOARD_IDOL_ID_LIST

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

  const diwaliIdols = DIWALI_LEAD_IDS
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product)) as ProductCardData[]

  const bestSellers = diwaliIdols

  const heroSlides =
    settings.heroSlides[0]?.eyebrow === DIWALI_SLIDE.eyebrow
      ? settings.heroSlides
      : [DIWALI_SLIDE, ...settings.heroSlides]

  const rails = settings.categoryRails.map((rail) => ({
    ...rail,
    title: rail.slug === 'pooja-decor' ? 'Diwali pooja' : rail.title,
    subtitle:
      rail.slug === 'pooja-decor'
        ? 'Car dashboard idols and mandir pieces for the November puja.'
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

      <DiwaliIdolsBanner products={diwaliIdols} />

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
          title="Top & Best Selling"
          subtitle="Studio-shot car dashboard idols for Diwali — the same eight from the banner, ready to gift."
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
