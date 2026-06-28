'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Category } from '@/lib/categories'
import { PRICE_BUCKETS } from '@/lib/price-buckets'

// Re-export for backwards compatibility (any other files importing from here)
export { PRICE_BUCKETS } from '@/lib/price-buckets'

// ── Color swatch hex map ───────────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  black:      '#1a1a1a',
  white:      '#f5f5f5',
  red:        '#dc2626',
  blue:       '#2563eb',
  green:      '#16a34a',
  yellow:     '#eab308',
  orange:     '#ea580c',
  purple:     '#9333ea',
  pink:       '#ec4899',
  grey:       '#6b7280',
  gray:       '#6b7280',
  brown:      '#92400e',
  terracotta: '#c2602d',
  sand:       '#d4a96a',
  natural:    '#d4b896',
  teal:       '#0d9488',
  navy:       '#1e3a5f',
}
function swatchHex(name: string): string {
  return COLOR_HEX[name.toLowerCase()] ?? '#9ca3af'
}

// Price buckets imported from @/lib/price-buckets (shared with server components)

export interface FacetProduct {
  price: number
  originalPrice?: number
  colors?: string[]
  customizable?: boolean
  isSoldOut?: boolean
}

interface CategoryFilterProps {
  categories: Category[]
  activeSlug: string | null
  /** Pass all (unfiltered) products so facets can show accurate counts */
  allProducts?: FacetProduct[]
  // Current filter state (URL-synced)
  activePriceBucket?: string | null
  activeColors?: string[]
  showOnSale?: boolean
  showInStock?: boolean
  showCustomizable?: boolean
}

export function CategoryFilter({
  categories,
  activeSlug,
  allProducts = [],
  activePriceBucket,
  activeColors = [],
  showOnSale,
  showInStock,
  showCustomizable,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const allActive = !activeSlug || activeSlug === 'all'

  // ── Build a new URL with updated params ──────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          params.delete(key)
        } else if (Array.isArray(val)) {
          params.delete(key)
          val.forEach((v) => params.append(key, v))
        } else {
          params.set(key, val)
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  function togglePriceBucket(bucket: string) {
    updateParams({ price: activePriceBucket === bucket ? null : bucket })
  }

  function toggleColor(color: string) {
    const next = activeColors.includes(color)
      ? activeColors.filter((c) => c !== color)
      : [...activeColors, color]
    updateParams({ color: next })
  }

  function toggleOnSale() {
    updateParams({ onSale: showOnSale ? null : '1' })
  }
  function toggleInStock() {
    updateParams({ inStock: showInStock ? null : '1' })
  }
  function toggleCustomizable() {
    updateParams({ customizable: showCustomizable ? null : '1' })
  }

  // ── Derive facet counts from allProducts ─────────────────────────────────────
  const priceCounts: Record<string, number> = {}
  const colorCounts: Record<string, number> = {}
  let onSaleCount = 0
  let inStockCount = 0
  let customizableCount = 0

  for (const p of allProducts) {
    // price buckets
    for (const bucket of PRICE_BUCKETS) {
      if (p.price >= bucket.min && p.price < (bucket.max === Infinity ? Infinity : bucket.max + 1)) {
        priceCounts[bucket.value] = (priceCounts[bucket.value] ?? 0) + 1
      }
    }
    // colors
    for (const c of p.colors ?? []) {
      const key = c.toLowerCase()
      colorCounts[key] = (colorCounts[key] ?? 0) + 1
    }
    if ((p.originalPrice ?? 0) > p.price) onSaleCount++
    if (!p.isSoldOut) inStockCount++
    if (p.customizable) customizableCount++
  }

  // Unique color names (sorted by count desc)
  const availableColors = Object.keys(colorCounts).sort(
    (a, b) => (colorCounts[b] ?? 0) - (colorCounts[a] ?? 0),
  )

  const hasAnyFilter =
    !!activePriceBucket ||
    activeColors.length > 0 ||
    showOnSale ||
    showInStock ||
    showCustomizable

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('price')
    params.delete('color')
    params.delete('onSale')
    params.delete('inStock')
    params.delete('customizable')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        {/* Clear all */}
        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="text-xs text-brand font-sans font-medium hover:underline self-start"
            aria-label="Clear all filters"
          >
            ✕ Clear all filters
          </button>
        )}

        {/* Categories */}
        <section aria-labelledby="filter-categories">
          <p id="filter-categories" className="font-display font-semibold text-xs uppercase tracking-wider text-muted mb-3">
            Categories
          </p>
          <ul className="space-y-1" role="list">
            <li>
              <Link
                href="/products"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  allActive ? 'bg-brand text-white font-semibold' : 'text-ink hover:bg-panel hover:text-brand'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All Products
              </Link>
            </li>
            {categories.map((cat) => {
              // Preserve sort when switching category, but clear facet filters
              // (counts change per-category so old filters may yield 0 results)
              const catParams = new URLSearchParams()
              catParams.set('category', cat.slug)
              const currentSort = searchParams.get('sort')
              if (currentSort) catParams.set('sort', currentSort)
              return (
                <li key={cat.slug}>
                  <Link
                    href={`/products?${catParams.toString()}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSlug === cat.slug
                        ? 'bg-brand text-white font-semibold'
                        : 'text-ink hover:bg-panel hover:text-brand'
                    }`}
                  >
                    <CategoryIcon slug={cat.slug} />
                    {cat.displayName}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Price buckets */}
        <section aria-labelledby="filter-price">
          <p id="filter-price" className="font-display font-semibold text-xs uppercase tracking-wider text-muted mb-3">
            Price
          </p>
          <ul className="space-y-1" role="list">
            {PRICE_BUCKETS.map((bucket) => {
              const count = priceCounts[bucket.value] ?? 0
              const active = activePriceBucket === bucket.value
              const isEmpty = count === 0
              return (
                <li key={bucket.value}>
                  <button
                    onClick={() => !isEmpty && togglePriceBucket(bucket.value)}
                    disabled={isEmpty}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                      active
                        ? 'bg-brand/10 text-brand font-semibold'
                        : isEmpty
                        ? 'text-muted/50 cursor-not-allowed'
                        : 'text-ink hover:bg-panel hover:text-brand'
                    }`}
                    aria-pressed={active}
                  >
                    <span>{bucket.label}</span>
                    <span className="text-xs text-muted">{count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Color swatches */}
        {availableColors.length > 0 && (
          <section aria-labelledby="filter-color">
            <p id="filter-color" className="font-display font-semibold text-xs uppercase tracking-wider text-muted mb-3">
              Color
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by color">
              {availableColors.map((color) => {
                const displayName = color.charAt(0).toUpperCase() + color.slice(1)
                const active = activeColors.includes(color)
                const count = colorCounts[color] ?? 0
                return (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    title={`${displayName} (${count})`}
                    aria-label={`${active ? 'Remove' : 'Add'} ${displayName} color filter`}
                    aria-pressed={active}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                      active ? 'border-brand shadow-md scale-110' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: swatchHex(color) }}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Availability toggles */}
        <section aria-labelledby="filter-availability">
          <p id="filter-availability" className="font-display font-semibold text-xs uppercase tracking-wider text-muted mb-3">
            Availability
          </p>
          <ul className="space-y-1" role="list">
            {onSaleCount > 0 && (
              <li>
                <FilterToggle
                  label="On sale"
                  count={onSaleCount}
                  active={!!showOnSale}
                  onToggle={toggleOnSale}
                />
              </li>
            )}
            {inStockCount > 0 && (
              <li>
                <FilterToggle
                  label="In stock"
                  count={inStockCount}
                  active={!!showInStock}
                  onToggle={toggleInStock}
                />
              </li>
            )}
            {customizableCount > 0 && (
              <li>
                <FilterToggle
                  label="Customizable"
                  count={customizableCount}
                  active={!!showCustomizable}
                  onToggle={toggleCustomizable}
                />
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* ── Mobile chips ────────────────────────────────────────────────────── */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href="/products"
          className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
            allActive
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
              activeSlug === cat.slug
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {cat.displayName}
          </Link>
        ))}
        {/* Price chips */}
        {PRICE_BUCKETS.map((bucket) => (
          <button
            key={bucket.value}
            onClick={() => togglePriceBucket(bucket.value)}
            aria-pressed={activePriceBucket === bucket.value}
            className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
              activePriceBucket === bucket.value
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {bucket.label}
          </button>
        ))}
        {/* Toggle chips */}
        <button
          onClick={toggleOnSale}
          aria-pressed={!!showOnSale}
          className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
            showOnSale
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
          }`}
        >
          On Sale
        </button>
        {customizableCount > 0 && (
          <button
            onClick={toggleCustomizable}
            aria-pressed={!!showCustomizable}
            className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
              showCustomizable
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            Customizable
          </button>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterToggle({
  label,
  count,
  active,
  onToggle,
}: {
  label: string
  count: number
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
        active ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-panel hover:text-brand'
      }`}
      aria-pressed={active}
    >
      <span className="flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            active ? 'bg-brand border-brand' : 'border-gray-300'
          }`}
          aria-hidden="true"
        >
          {active && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </span>
        {label}
      </span>
      <span className="text-xs text-muted">{count}</span>
    </button>
  )
}

function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'lamps':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'organizers':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 'planters':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      )
    case 'keyrings':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    case 'pooja-decor':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1M4.22 4.22l.707.707m13.86 13.86l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707m13.86-13.86l.707-.707M12 6a6 6 0 110 12A6 6 0 0112 6z" />
        </svg>
      )
    case 'gaming':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
  }
}
