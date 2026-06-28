import './products.css'
import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProductCategories, getCategoryBySlug } from '@/lib/categories'
import { CategoryFilter } from '@/components/products/category-filter'
import { PRICE_BUCKETS } from '@/lib/price-buckets'
import { CatalogClient } from './catalog-client'
import type { ProductCardData } from '@/components/ui/product-card'
import productsJson from '@/lib/products.json'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Buy 3D Printed Gifts Online India | Shop Custom 3D Prints | ${SITE.name}`,
  description: `Shop 3D printed gifts online India - custom keychains, lamps, home decor, desk organisers & personalised gifts. Buy 3D printed items with PAN India delivery. Premium 3D printing products from Agra. COD available.`,
  keywords: [
    'buy 3D printed gifts online India',
    'shop 3D prints India',
    '3D printed items online',
    'custom 3D printed keychains',
    '3D printed lamps India',
    '3D printed home decor buy',
    'personalised 3D gifts shop',
    '3D printed desk accessories',
    'buy custom 3D prints',
    '3D printing products India',
    'order 3D printed gifts',
  ],
  openGraph: {
    title: `Buy 3D Printed Gifts Online | Shop Custom 3D Prints India | ${SITE.name}`,
    description: 'Shop premium 3D printed gifts - keychains, lamps, home decor & more. PAN India delivery from Agra.',
    type: 'website',
    locale: 'en_IN',
  },
}

// ── Trust chips shown in the hero band ──────────────────────────────────────
const TRUST_CHIPS = [
  { icon: 'cod',      label: 'COD Available' },
  { icon: 'india',    label: 'Pan-India Delivery' },
  { icon: 'custom',   label: 'Made to Order' },
  { icon: 'quality',  label: '100% Original' },
]

// ── FullProductData extends card data with facet fields ──────────────────────
interface FullProductData extends ProductCardData {
  colors?: string[]
  customizable?: boolean
  options?: Array<{ name: string; values: string[] }>
  createdAt?: string
}

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    price?: string
    color?: string | string[]
    onSale?: string
    inStock?: string
    customizable?: string
    sort?: string
  }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const categorySlug = params.category
  const activePriceBucket = params.price ?? null
  const activeColors: string[] = params.color
    ? Array.isArray(params.color)
      ? params.color.map((c) => c.toLowerCase())
      : [params.color.toLowerCase()]
    : []
  const showOnSale = params.onSale === '1'
  const showInStock = params.inStock === '1'
  const showCustomizable = params.customizable === '1'

  const productCategories = getProductCategories()
  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : null

  const allProducts = productsJson as FullProductData[]

  // ── Server-side filter ───────────────────────────────────────────────────────
  // Step 1: filter by category (this becomes the "universe" for facet counts)
  const categoryFiltered: FullProductData[] = categorySlug && categorySlug !== 'all'
    ? allProducts.filter((p) => p.category === categorySlug)
    : allProducts

  let filtered: FullProductData[] = categoryFiltered

  // Price bucket filter
  if (activePriceBucket) {
    const bucket = PRICE_BUCKETS.find((b) => b.value === activePriceBucket)
    if (bucket) {
      filtered = filtered.filter(
        (p) => p.price >= bucket.min && p.price < (bucket.max === Infinity ? Infinity : bucket.max + 1),
      )
    }
  }

  // Color filter
  if (activeColors.length > 0) {
    filtered = filtered.filter((p) =>
      (p.colors ?? []).some((c) => activeColors.includes(c.toLowerCase())),
    )
  }

  // On sale filter
  if (showOnSale) {
    filtered = filtered.filter((p) => (p.originalPrice ?? 0) > p.price)
  }

  // In stock filter
  if (showInStock) {
    filtered = filtered.filter((p) => !p.isSoldOut)
  }

  // Customizable filter
  if (showCustomizable) {
    filtered = filtered.filter((p) => !!p.customizable)
  }

  const categoryTitle = activeCategory ? activeCategory.displayName : 'All Products'
  const categoryDesc = activeCategory
    ? activeCategory.description
    : 'Handcrafted 3D-printed home decor, desk accessories, and planters — made in India, shipped pan-India.'

  return (
    <main className="bg-white min-h-screen">
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="bg-surface border-b border-gray-100"
      >
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted font-sans" role="list">
            <li>
              <Link href="/" className="hover:text-brand transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/products" className="hover:text-brand transition-colors">
                Shop
              </Link>
            </li>
            {activeCategory && (
              <>
                <li aria-hidden="true">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <span className="text-ink font-medium">{activeCategory.displayName}</span>
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* ── Hero band ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-gray-100">
        <div className="container-page py-8 md:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-brand mb-2">
              Tathastu Keepsakes Collection
            </p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight mb-3">
              {categoryTitle}
              {activeCategory && (
                <span className="block text-base font-normal text-muted mt-1">
                  3D Printed, Made in India
                </span>
              )}
            </h1>
            <p className="text-sm text-muted font-sans leading-relaxed mb-5 max-w-lg">
              {categoryDesc}
            </p>
            {/* Trust chips */}
            <div className="flex flex-wrap gap-2">
              {TRUST_CHIPS.map((chip) => (
                <TrustChip key={chip.icon} label={chip.label} icon={chip.icon} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content: sidebar + grid ──────────────────────────────────────── */}
      <div className="container-page py-8">
        {/* Mobile filter chips */}
        <div className="mb-6 lg:hidden">
          <Suspense fallback={<div className="flex gap-2 overflow-hidden"><div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" /><div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" /><div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" /></div>}>
            <CategoryFilter
              categories={productCategories}
              activeSlug={categorySlug ?? null}
              allProducts={categoryFiltered}
              activePriceBucket={activePriceBucket}
              activeColors={activeColors}
              showOnSale={showOnSale}
              showInStock={showInStock}
              showCustomizable={showCustomizable}
            />
          </Suspense>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0" aria-label="Filters">
            <Suspense fallback={<div className="space-y-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /><div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" /><div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" /><div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" /></div>}>
              <CategoryFilter
                categories={productCategories}
                activeSlug={categorySlug ?? null}
                allProducts={categoryFiltered}
                activePriceBucket={activePriceBucket}
                activeColors={activeColors}
                showOnSale={showOnSale}
                showInStock={showInStock}
                showCustomizable={showCustomizable}
              />
            </Suspense>
          </aside>

          {/* Product grid + controls */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-card2 animate-pulse" />)}</div>}>
              <CatalogClient
                products={filtered as ProductCardData[]}
                categoryName={categoryTitle}
                initialSort={(params.sort as string) ?? 'featured'}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TrustChip({ label, icon }: { label: string; icon: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-ink text-xs font-sans px-3 py-1.5 rounded-pill shadow-sm">
      <TrustIcon slug={icon} />
      {label}
    </span>
  )
}

function TrustIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'cod':
      return (
        <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'india':
      return (
        <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'custom':
      return (
        <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    default:
      return (
        <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
  }
}
