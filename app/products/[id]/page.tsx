import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import { ProductCard } from '@/components/ui/product-card'
import { SectionHeading } from '@/components/ui/section-heading'
import { getCategoryBySlug } from '@/lib/categories'
import { getReviewsForProduct, getAverageRating } from '@/lib/reviews'
import productsJson from '@/lib/products.json'
import type { ProductCardData } from '@/components/ui/product-card'
import { SITE } from '@/lib/site'
import { getProductSchema, getBreadcrumbSchema } from '@/lib/schema'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductPageParams {
  params: Promise<{ id: string }>
}

/** Full product shape from products.json (superset of ProductCardData) */
interface FullProduct extends ProductCardData {
  description: string
  careGuide?: string
  shippingInfo?: string
  // Optional enriched fields (all guarded)
  options?: Array<{ name: string; values: string[] }>
  colors?: string[]
  customText?: { label: string; maxLength: number; placeholder?: string } | null
  customizable?: boolean
  specs?: {
    material?: string
    dimensions?: string
    printTech?: string
    finish?: string
    weight?: string
    origin?: string
  } | null
  benefits?: string[]
  about?: string
  keyFeatures?: string[]
  perfectFor?: string[]
  whyBuy?: string
  createdAt?: string
}

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return (productsJson as FullProduct[]).map((p) => ({ id: p.id }))
}

// ── Dynamic Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
  const { id } = await params
  const products = productsJson as FullProduct[]
  const product = products.find((p) => p.id === id)

  if (!product) return {}

  const category = getCategoryBySlug(product.category)
  const categoryName = category?.displayName ?? 'Product'
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const priceTag = product.originalPrice
    ? `₹${product.price} (${discount}% Off)`
    : `₹${product.price}`

  return {
    title: `Buy ${product.name} | 3D Printed ${categoryName} Online India | ${priceTag}`,
    description: `${product.description} Buy ${product.name} online - 3D printed ${categoryName} at ${priceTag}. ${product.rating}★ rated. Custom 3D printing. PAN India delivery from ${SITE.name}, Agra. COD available.`,
    keywords: [
      `buy ${product.name}`,
      `${product.name} online India`,
      `3D printed ${categoryName}`,
      `custom ${categoryName}`,
      `${product.name} price`,
      '3D printed gifts India',
      'buy 3D prints online',
      'personalised gifts India',
    ],
    openGraph: {
      title: `${product.name} | ${priceTag} | ${SITE.name}`,
      description: `${product.description} Buy now with PAN India delivery.`,
      type: 'website',
      locale: 'en_IN',
      images: product.images.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: ProductPageParams) {
  const { id } = await params
  const products = productsJson as FullProduct[]
  const product = products.find((p) => p.id === id)

  if (!product) notFound()

  const category = getCategoryBySlug(product.category)

  // reviews-coverage (P1): use aggregate display from product.rating/reviewCount
  // instead of an empty grid when no detailed reviews exist.
  const detailedReviews = getReviewsForProduct(product.id)
  const aggregateRating = detailedReviews.length > 0
    ? getAverageRating(product.id)
    : product.rating
  const aggregateCount = detailedReviews.length > 0
    ? detailedReviews.length
    : product.reviewCount

  // Related: top up from full catalog when category has fewer than target
  const TARGET_RELATED = 8
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  )
  const otherCategory = products.filter(
    (p) => p.category !== product.category && p.id !== product.id
  )
  const related = [
    ...sameCategory.slice(0, TARGET_RELATED),
    ...otherCategory.slice(0, Math.max(0, TARGET_RELATED - sameCategory.length)),
  ]

  const categoryDisplayName = category?.displayName ?? 'Shop'
  const categoryHref = category?.route ?? `/products?category=${product.category}`

  // JSON-LD schemas
  const productSchema = getProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    category: product.category,
    rating: aggregateRating,
    reviewCount: aggregateCount,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/products' },
    { name: categoryDisplayName, url: categoryHref },
    { name: product.name, url: `/products/${product.id}` },
  ])

  return (
    <main className="bg-white min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-surface border-b border-gray-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted font-sans flex-wrap" role="list">
            <li>
              <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            </li>
            <Chevron />
            <li>
              <Link href="/products" className="hover:text-brand transition-colors">Shop</Link>
            </li>
            <Chevron />
            <li>
              <Link href={categoryHref} className="hover:text-brand transition-colors">
                {categoryDisplayName}
              </Link>
            </li>
            <Chevron />
            <li>
              <span className="text-ink font-medium line-clamp-1 max-w-[180px]">{product.name}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Category eyebrow ───────────────────────────────────────────────────── */}
      <div className="container-page pt-6">
        <Link
          href={categoryHref}
          className="inline-flex items-center gap-1 text-xs font-display font-semibold uppercase tracking-widest text-brand hover:text-brand-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {categoryDisplayName}
        </Link>
      </div>

      {/* ── Two-column: gallery + info ────────────────────────────────────────── */}
      <section className="container-page py-6" aria-label="Product details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            rating={product.rating}
            reviewCount={product.reviewCount}
            description={product.description}
            careGuide={product.careGuide}
            shippingInfo={product.shippingInfo}
            productId={product.id}
            image={product.images[0] ?? ''}
            options={product.options}
            colors={product.colors}
            customText={product.customText}
            customizable={product.customizable}
            specs={product.specs}
            benefits={product.benefits}
            about={product.about}
            keyFeatures={product.keyFeatures}
            perfectFor={product.perfectFor}
            whyBuy={product.whyBuy}
          />
        </div>
      </section>

      {/* ── Benefits / Reasons to buy (P1) — data-driven per product ─────────── */}
      <section className="bg-surface py-12" aria-label="Reasons to buy">
        <div className="container-page">
          <SectionHeading title="Reasons to make it yours" centered />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center max-w-3xl mx-auto">
            {REASONS.map((r) => (
              <div key={r.title} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                  {r.icon}
                </div>
                <p className="font-display font-semibold text-sm text-ink">{r.title}</p>
                <p className="text-xs text-muted font-sans leading-snug">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Aggregate rating + reviews (P1 reviews-coverage) ────────────────── */}
      <section className="py-10" aria-label="Customer reviews">
        <div className="container-page">
          {/* Always show aggregate — never an empty block */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-display font-bold text-ink">{aggregateRating.toFixed(1)}</div>
            <div>
              <div className="flex gap-1 mb-1" aria-label={`Rating: ${aggregateRating} out of 5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(aggregateRating) ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted font-sans">{aggregateCount.toLocaleString('en-IN')}+ verified reviews</p>
            </div>
          </div>

          {/* Detailed review grid when available */}
          {detailedReviews.length > 0 && (
            <>
              <SectionHeading
                title={`Customer Reviews (${detailedReviews.length})`}
                subtitle="Real opinions from real customers"
              />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {detailedReviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── You may also like — up to 8 products (P2 related-carousel) ──────── */}
      {related.length > 0 && (
        <section className="bg-surface py-12" aria-label="Related products">
          <div className="container-page">
            <SectionHeading
              title="You may also like"
              subtitle={`More from ${categoryDisplayName}`}
              viewAllHref={categoryHref}
              viewAllLabel="View all"
            />
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Chevron() {
  return (
    <li aria-hidden="true">
      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </li>
  )
}

// ── Review card ───────────────────────────────────────────────────────────────

import type { Review } from '@/lib/reviews'

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="bg-white rounded-card2 border border-gray-100 p-5 shadow-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-semibold text-sm text-ink">{review.author}</p>
          <p className="text-xs text-muted font-sans">{review.location}</p>
        </div>
        {review.verified && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-display font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-pill">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>
      <div className="flex gap-0.5" aria-label={`Rating: ${review.rating} out of 5`}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="font-display font-semibold text-sm text-ink">{review.title}</p>
      <p className="text-sm text-muted font-sans leading-relaxed flex-1">{review.body}</p>
      <p className="text-xs text-muted font-sans">{review.date}</p>
    </article>
  )
}

// ── Reasons data ─────────────────────────────────────────────────────────────

const REASONS = [
  {
    title: 'Handcrafted',
    desc: 'Every piece 3D printed with care in India',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Unique Design',
    desc: 'No two prints are exactly alike',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Eco-Friendly',
    desc: 'Made with sustainable PLA materials',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    desc: '7-day hassle-free return policy',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
]
