'use client'

import { useEffect, useState } from 'react'
import productsJson from '@/lib/products.json'
import type { CatalogProduct } from '@/lib/catalog/types'

const fallback = productsJson as CatalogProduct[]

/**
 * Starts with the shipped JSON catalog so search/wishlist still work if the
 * live catalog API is down, then overlays published admin SKUs.
 */
export function useCatalogProducts(): CatalogProduct[] {
  const [products, setProducts] = useState<CatalogProduct[]>(fallback)

  useEffect(() => {
    let cancelled = false
    fetch('/api/catalog')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.products) || data.products.length === 0) return
        setProducts(data.products as CatalogProduct[])
      })
      .catch(() => {
        /* keep JSON fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return products
}
