import Link from 'next/link'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getWishlist } from '@/lib/supabase/account'
import { ProductCard, type ProductCardData } from '@/components/ui/product-card'
import productsJson from '@/lib/products.json'

/**
 * /account/wishlist — Server component.
 *
 * Renders inside the shared AccountLayout (header card + sidebar already present).
 * This component outputs only the right-hand content panel.
 */
export default async function WishlistPage() {
  const user = await requireAuth()
  const slugs = await getWishlist(user.id)

  // Resolve slugs → ProductCardData, dropping any that no longer exist in the catalog.
  const allProducts = productsJson as ProductCardData[]
  const products: ProductCardData[] = slugs
    .map((slug) => allProducts.find((p) => p.id === slug))
    .filter((p): p is ProductCardData => p !== undefined)

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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}
