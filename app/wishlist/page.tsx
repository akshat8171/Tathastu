/**
 * /wishlist — Top-level public wishlist route.
 *
 * Accessible to both guests and authenticated users. Guests see their
 * localStorage-backed wishlist (populated by the heart button across the site).
 * Authenticated users are shown their full server-backed wishlist.
 *
 * This client component hydrates from WishlistProvider (already mounted in
 * app/layout.tsx) so no additional context setup is needed.
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/components/wishlist/wishlist-context'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import productsJson from '@/lib/products.json'

interface ProductData {
  id: string
  name: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  isSoldOut?: boolean
}

const allProducts = productsJson as ProductData[]

export default function WishlistPage() {
  const { ids, toggle, isReady, requiresAuth, count } = useWishlist()

  const products = Array.from(ids)
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is ProductData => p !== undefined)

  if (!isReady) {
    return (
      <main className="container-page py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface rounded w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-surface rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container-page py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">
              My Wishlist
            </h1>
            <p className="text-sm font-sans text-muted mt-1">
              {count === 0
                ? 'Items you love, saved for later'
                : `${count} saved item${count === 1 ? '' : 's'}`}
            </p>
          </div>

          {requiresAuth && count > 0 && (
            <Link
              href="/login"
              className="text-sm font-sans text-brand hover:underline"
            >
              Sign in to save permanently
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand/30"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold text-ink mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted font-sans mb-8 max-w-xs">
              Tap the heart icon on any product to save it here.
            </p>
            <Link href="/products" className="btn-primary">
              Browse products
            </Link>
          </div>
        ) : (
          /* ── Product grid ──────────────────────────────────────────────── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
              const primaryImage = product.images?.[0] ?? ''
              const isSoldOut = product.isSoldOut ?? false

              return (
                <div
                  key={product.id}
                  className="card p-0 overflow-hidden flex flex-col group"
                >
                  {/* Image with remove button */}
                  <div className="relative aspect-square bg-panel overflow-hidden">
                    <Link href={`/products/${product.id}`}>
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-panel" />
                      )}
                    </Link>

                    {/* Remove from wishlist */}
                    <button
                      onClick={() => toggle(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <span className="bg-white/90 text-ink font-sans text-xs font-semibold px-3 py-1 rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info + actions */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex-1">
                      <Link href={`/products/${product.id}`}>
                        <p className="font-display font-semibold text-ink text-xs leading-snug hover:text-brand transition-colors line-clamp-2">
                          {product.name}
                        </p>
                      </Link>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-display font-bold text-ink text-sm">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                          <s className="text-muted text-xs font-sans">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </s>
                        )}
                      </div>
                    </div>

                    {!isSoldOut && (
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          image: primaryImage,
                        }}
                        size="sm"
                        fullWidth
                        label="Add to cart"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Guest login prompt */}
        {requiresAuth && (
          <div className="mt-10 text-center">
            <p className="text-sm font-sans text-muted">
              <Link href="/login" className="text-brand hover:underline font-medium">
                Sign in
              </Link>{' '}
              to sync your wishlist across devices and never lose your saved items.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
