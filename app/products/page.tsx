import './products.css'
import Link from 'next/link'
import { getProductCategories, getCategoryBySlug } from '@/lib/categories'
import { CategoryFilter } from '@/components/products/category-filter'
import { CatalogClient } from './catalog-client'
import type { ProductCardData } from '@/components/ui/product-card'
import productsJson from '@/lib/products.json'

// ── Trust chips shown in the hero band ──────────────────────────────────────
const TRUST_CHIPS = [
  { icon: 'cod',      label: 'COD Available' },
  { icon: 'india',    label: 'Pan-India Delivery' },
  { icon: 'custom',   label: 'Made to Order' },
  { icon: 'quality',  label: '100% Original' },
]

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category: categorySlug } = await searchParams
  const productCategories = getProductCategories()

  // Active category object
  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : null

  // Filter products from JSON (resolveJsonModule is enabled in tsconfig)
  const allProducts = productsJson as ProductCardData[]
  const filtered: ProductCardData[] =
    categorySlug && categorySlug !== 'all'
      ? allProducts.filter((p) => p.category === categorySlug)
      : allProducts

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
              Layerix Collection
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
          <CategoryFilter
            categories={productCategories}
            activeSlug={categorySlug ?? null}
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <CategoryFilter
              categories={productCategories}
              activeSlug={categorySlug ?? null}
            />
          </aside>

          {/* Product grid + controls */}
          <div className="flex-1 min-w-0">
            <CatalogClient products={filtered} categoryName={categoryTitle} />
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
