/**
 * /shop/[category] — per-category clean URL (P1 per-category-routes).
 *
 * Maps clean routes like /shop/keyrings → category filter.
 * Uses categories.ts route field and generateStaticParams for SSG.
 * Renders: breadcrumb, SEO H1 "<Category> — 3D Printed, Made in India", catalog grid.
 */
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryBySlug, getProductCategories } from '@/lib/categories'
import { CategoryFilter, PRICE_BUCKETS } from '@/components/products/category-filter'
import { CatalogClient } from '../../products/catalog-client'
import type { ProductCardData } from '@/components/ui/product-card'
import productsJson from '@/lib/products.json'

interface ShopCategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    price?: string
    color?: string | string[]
    onSale?: string
    inStock?: string
    customizable?: string
    sort?: string
  }>
}

interface FullProductData extends ProductCardData {
  colors?: string[]
  customizable?: boolean
  options?: Array<{ name: string; values: string[] }>
  createdAt?: string
}

// ── SSG: generate routes for all real categories ──────────────────────────────
export function generateStaticParams() {
  return getProductCategories().map((cat) => ({ category: cat.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: ShopCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return {}

  // SEO-optimized keywords per category
  const categoryKeywords: Record<string, string[]> = {
    keyrings: ['3D printed keychains India', 'custom keychain online', 'personalised keyring buy', '3D keychain gifts'],
    lamps: ['3D printed lamps India', 'custom lamp buy', 'designer lamps online', '3D lighting decor'],
    organisers: ['3D printed desk organiser', 'custom organiser India', 'desk accessories buy', '3D office decor'],
    planters: ['3D printed planters India', 'custom planters buy', 'designer plant pots', '3D garden decor'],
  }

  return {
    title: `Buy ${cat.displayName} | 3D Printed ${cat.displayName} Online India | Tathastu Keepsakes`,
    description: `Shop premium 3D printed ${cat.displayName} online. ${cat.description} Buy custom ${cat.displayName} with PAN India delivery from Agra. COD available.`,
    keywords: [
      `buy ${cat.displayName} online India`,
      `3D printed ${cat.displayName}`,
      `custom ${cat.displayName} India`,
      ...(categoryKeywords[slug] || []),
      '3D printing India',
      'personalised gifts',
    ],
    openGraph: {
      title: `Buy ${cat.displayName} | 3D Printed Online India | Tathastu Keepsakes`,
      description: `Shop ${cat.displayName} - ${cat.description}`,
      type: 'website',
      locale: 'en_IN',
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ShopCategoryPage({
  params,
  searchParams,
}: ShopCategoryPageProps) {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)

  // 'customise' is a CTA pseudo-category — redirect
  if (!cat || cat.isCta) {
    if (cat?.isCta && cat.route) {
      redirect(cat.route)
    }
    notFound()
  }

  const sp = await searchParams
  const activePriceBucket = sp.price ?? null
  const activeColors: string[] = sp.color
    ? Array.isArray(sp.color)
      ? sp.color.map((c) => c.toLowerCase())
      : [sp.color.toLowerCase()]
    : []
  const showOnSale       = sp.onSale === '1'
  const showInStock      = sp.inStock === '1'
  const showCustomizable = sp.customizable === '1'

  const allProducts = productsJson as FullProductData[]

  // Base: filter by category
  let filtered: FullProductData[] = allProducts.filter((p) => p.category === slug)

  // Price bucket
  if (activePriceBucket) {
    const bucket = PRICE_BUCKETS.find((b) => b.value === activePriceBucket)
    if (bucket) {
      filtered = filtered.filter(
        (p) => p.price >= bucket.min && p.price < (bucket.max === Infinity ? Infinity : bucket.max + 1),
      )
    }
  }
  // Colors
  if (activeColors.length > 0) {
    filtered = filtered.filter((p) =>
      (p.colors ?? []).some((c) => activeColors.includes(c.toLowerCase())),
    )
  }
  if (showOnSale)       filtered = filtered.filter((p) => (p.originalPrice ?? 0) > p.price)
  if (showInStock)      filtered = filtered.filter((p) => !p.isSoldOut)
  if (showCustomizable) filtered = filtered.filter((p) => !!p.customizable)

  const productCategories = getProductCategories()
  const categoryTitle = `${cat.displayName} — 3D Printed, Made in India`

  return (
    <main className="bg-white min-h-screen">
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-surface border-b border-gray-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted font-sans flex-wrap" role="list">
            <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
            <li aria-hidden="true">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li><Link href="/products" className="hover:text-brand transition-colors">Shop</Link></li>
            <li aria-hidden="true">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li><span className="text-ink font-medium">{cat.displayName}</span></li>
          </ol>
        </div>
      </nav>

      {/* ── Hero band ───────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-gray-100">
        <div className="container-page py-8 md:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-brand mb-2">
              Tathastu Keepsakes Collection
            </p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight mb-3">
              {cat.displayName}
              <span className="block text-base font-normal text-muted mt-1">
                3D Printed, Made in India
              </span>
            </h1>
            <p className="text-sm text-muted font-sans leading-relaxed max-w-lg">
              {cat.description}
            </p>
          </div>
        </div>
      </section>

      {/* ── Main content: sidebar + grid ────────────────────────────────────── */}
      <div className="container-page py-8">
        {/* Mobile filter chips */}
        <div className="mb-6 lg:hidden">
          <Suspense fallback={<div className="flex gap-2 overflow-hidden"><div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" /><div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" /><div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" /></div>}>
            <CategoryFilter
              categories={productCategories}
              activeSlug={slug}
              allProducts={filtered}
              activePriceBucket={activePriceBucket}
              activeColors={activeColors}
              showOnSale={showOnSale}
              showInStock={showInStock}
              showCustomizable={showCustomizable}
            />
          </Suspense>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 flex-shrink-0" aria-label="Filters">
            <Suspense fallback={<div className="space-y-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /><div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" /><div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" /></div>}>
              <CategoryFilter
                categories={productCategories}
                activeSlug={slug}
                allProducts={allProducts.filter((p) => p.category === slug) as FullProductData[]}
                activePriceBucket={activePriceBucket}
                activeColors={activeColors}
                showOnSale={showOnSale}
                showInStock={showInStock}
                showCustomizable={showCustomizable}
              />
            </Suspense>
          </aside>

          <div className="flex-1 min-w-0">
            <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-card2 animate-pulse" />)}</div>}>
              <CatalogClient
                products={filtered as ProductCardData[]}
                categoryName={cat.displayName}
                initialSort={sp.sort ?? 'featured'}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
