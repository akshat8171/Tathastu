'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/ui/product-card'
import { SortSelect, type SortOption } from '@/components/products/sort-select'
import type { ProductCardData } from '@/components/ui/product-card'

const PAGE_SIZE = 24

// FullProductData includes optional enriched fields for sort
interface FullProductData extends ProductCardData {
  createdAt?: string
  reviewCount: number
}

interface CatalogClientProps {
  products: FullProductData[]
  categoryName: string
  /** Initial sort from URL searchParam (server-rendered value) */
  initialSort?: string
}

function sortProducts(products: FullProductData[], sort: SortOption): FullProductData[] {
  const arr = [...products]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price)
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return arr.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })
    case 'popular':
      return arr.sort((a, b) => b.reviewCount - a.reviewCount)
    case 'featured':
    default:
      return arr
  }
}

export function CatalogClient({ products, categoryName, initialSort = 'featured' }: CatalogClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sort: SortOption = (initialSort as SortOption) || 'featured'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort])
  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  function handleSortChange(newSort: SortOption) {
    const params = new URLSearchParams(searchParams.toString())
    if (newSort === 'featured') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <>
      {/* Controls bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-sm text-muted font-sans">
          <span className="font-medium text-ink">{sorted.length}</span>{' '}
          {sorted.length === 1 ? 'product' : 'products'}
          {categoryName !== 'All Products' && (
            <span> in <span className="font-medium text-ink">{categoryName}</span></span>
          )}
        </p>
        <SortSelect value={sort} onChange={handleSortChange} />
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-panel rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-ink text-lg mb-2">No products match these filters</h3>
          <p className="text-muted text-sm mb-6">Try adjusting your filters or browse all products.</p>
          <a href="/products" className="btn-primary inline-block px-6 py-2.5 text-sm rounded-lg">
            View all products
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Load more (P2) */}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="btn-primary px-8 py-3 rounded-xl text-sm font-display font-semibold"
              >
                Load more ({sorted.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
