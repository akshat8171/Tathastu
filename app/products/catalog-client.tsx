'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/ui/product-card'
import { SortSelect, type SortOption } from '@/components/products/sort-select'
import type { ProductCardData } from '@/components/ui/product-card'

interface CatalogClientProps {
  products: ProductCardData[]
  categoryName: string
}

function sortProducts(products: ProductCardData[], sort: SortOption): ProductCardData[] {
  const arr = [...products]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price)
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating)
    case 'featured':
    default:
      return arr
  }
}

export function CatalogClient({ products, categoryName }: CatalogClientProps) {
  const [sort, setSort] = useState<SortOption>('featured')
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort])

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
        <SortSelect value={sort} onChange={setSort} />
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-panel rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-ink text-lg mb-2">No products here yet</h3>
          <p className="text-muted text-sm mb-6">This category is coming soon. Check out our other collections.</p>
          <a href="/products" className="btn-primary inline-block px-6 py-2.5 text-sm rounded-lg">
            View all products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </>
  )
}
