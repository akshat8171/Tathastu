'use client'

/**
 * SearchOverlay — FROZEN CONTRACT §5
 *
 * Client-side search drawer filtering lib/products.json by name/category.
 * Links to /products/[id] for each result.
 *
 * Usage:
 *   const [open, setOpen] = useState(false)
 *   <SearchOverlay open={open} onClose={() => setOpen(false)} />
 *
 * The header wires its Search button to open this overlay.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import productsData from '@/lib/products.json'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  badge?: string | null
  isSoldOut?: boolean
}

const allProducts = productsData as Product[]

/** Maximum results displayed while typing */
const MAX_RESULTS = 8

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand/20 text-brand rounded-[2px] not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      // slight delay so the CSS transition completes
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const results: Product[] = query.trim().length < 1
    ? []
    : allProducts
        .filter((p) => {
          const q = query.toLowerCase()
          return (
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          )
        })
        .slice(0, MAX_RESULTS)

  const handleResultClick = useCallback(() => {
    onClose()
    setQuery('')
  }, [onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Search products"
        aria-modal="true"
        className="fixed inset-x-0 top-0 z-50 bg-white shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          {/* Search icon */}
          <svg className="w-5 h-5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories…"
            className="flex-1 text-base font-sans text-ink placeholder:text-muted/60 bg-transparent outline-none min-w-0"
            aria-label="Search products"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink transition-colors rounded-md hover:bg-surface"
            aria-label="Close search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-3">
          {query.trim().length > 0 && results.length === 0 && (
            <p className="text-sm font-sans text-muted text-center py-8">
              No products found for &ldquo;<span className="font-medium text-ink">{query}</span>&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <ul role="listbox" aria-label="Search results" className="divide-y divide-gray-50">
              {results.map((product) => (
                <li key={product.id} role="option" aria-selected="false">
                  <Link
                    href={`/products/${product.id}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-4 py-3 hover:bg-surface rounded-lg px-2 -mx-2 transition-colors group"
                    tabIndex={0}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-medium text-ink leading-snug truncate group-hover:text-brand transition-colors">
                        {highlight(product.name, query)}
                      </p>
                      <p className="text-xs font-sans text-muted capitalize mt-0.5">
                        {product.category.replace(/-/g, ' ')}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-display font-semibold text-ink">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs font-sans text-muted line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length === 0 && (
            <div className="py-6 text-center">
              <p className="text-sm font-sans text-muted">
                Start typing to search across all products
              </p>
              <Link
                href="/products"
                onClick={handleResultClick}
                className="inline-block mt-3 text-sm font-display font-medium text-brand hover:underline"
              >
                Browse all products →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
