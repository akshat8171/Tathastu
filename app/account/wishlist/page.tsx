import Link from 'next/link'
import Image from 'next/image'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getWishlist } from '@/lib/supabase/account'
import productsJson from '@/lib/products.json'
import { WishlistItemActions } from './wishlist-item-actions'

interface ProductData {
  id: string
  name: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  rating?: number
  reviewCount?: number
  badge?: string | null
  labelType?: string | null
  isSoldOut?: boolean
}

/**
 * /account/wishlist — Server component.
 *
 * Renders inside the shared AccountLayout (header card + sidebar already present).
 * This component outputs only the right-hand content panel.
 *
 * Per-item "Add to cart" / "Move to cart" actions are delegated to the
 * WishlistItemActions client component so interactivity stays co-located.
 */
export default async function WishlistPage() {
  const user = await requireAuth()
  const slugs = await getWishlist(user.id)

  // Resolve slugs → ProductData, dropping any that no longer exist in the catalog.
  const allProducts = productsJson as ProductData[]
  const products: ProductData[] = slugs
    .map((slug) => allProducts.find((p) => p.id === slug))
    .filter((p): p is ProductData => p !== undefined)

  return (
    <div className="bg-white rounded-card2 shadow-card p-6">
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="font-display font-semibold text-ink text-xl">Wishlist</h2>
        <p className="font-sans text-muted text-sm mt-1">
          {products.length === 0
            ? 'Save items you love and come back to them anytime.'
            : `${products.length} saved item${products.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {products.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          {/* Heart icon */}
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
            <svg
              width="32"
              height="32"
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
          <p className="font-sans text-muted text-base text-center">Your wishlist is empty</p>
          <Link
            href="/products"
            className="btn-primary inline-block px-6 py-2.5 text-sm font-sans font-medium rounded-lg"
          >
            Browse products
          </Link>
        </div>
      ) : (
        /* ── Product grid ────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const primaryImage = product.images?.[0] ?? ''
            const isSoldOut = product.isSoldOut ?? false

            return (
              <div
                key={product.id}
                className="card p-0 overflow-hidden flex flex-col group"
              >
                {/* Product image */}
                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-panel overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-panel" />
                  )}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white/90 text-ink font-sans text-xs font-semibold px-3 py-1 rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product info */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex-1">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-display font-semibold text-ink text-sm leading-snug hover:text-brand transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1.5">
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

                  {/* Add to cart / Move to cart actions */}
                  <WishlistItemActions
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: primaryImage,
                    }}
                    isSoldOut={isSoldOut}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
