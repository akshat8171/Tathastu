'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/cart/cart-context'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProductCard } from '@/components/ui/product-card'
import productsData from '@/lib/products.json'

// ── Free-delivery threshold (mirrors lib/pricing.ts) ─────────────────────────
const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_COST = 99

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Free Delivery Progress Bar ────────────────────────────────────────────────
function FreeDeliveryBar({ subtotal }: { subtotal: number }) {
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="bg-surface rounded-2xl p-4 mb-6 border border-gray-100">
      {subtotal >= FREE_SHIPPING_THRESHOLD ? (
        <p className="text-sm font-display font-semibold text-brand text-center">
          🎉 Hooray! You&apos;ve unlocked FREE delivery!
        </p>
      ) : (
        <p className="text-sm font-sans text-muted text-center mb-2">
          You&apos;re{' '}
          <span className="font-semibold text-ink">{formatINR(remaining)}</span>{' '}
          away from FREE delivery
        </p>
      )}
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% toward free delivery`}
        />
      </div>
    </div>
  )
}

// ── Empty Cart ────────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-panel flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </div>
      <h2 className="text-xl font-display font-bold text-ink mb-2">Your cart is empty</h2>
      <p className="text-muted font-sans mb-8 max-w-xs">
        Add some beautiful 3D printed items to get started.
      </p>
      <Button variant="primary" href="/products">Shop all products</Button>
    </div>
  )
}

// ── Cart Line Item ────────────────────────────────────────────────────────────
function CartLineItem({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: {
    id: string
    name: string
    variant: string
    price: number
    originalPrice: number
    quantity: number
    image: string
  }
  onRemove: (id: string) => void
  onQuantityChange: (id: string, qty: number) => void
}) {
  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0" data-testid="cart-line-item">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl bg-panel overflow-hidden flex-shrink-0 relative">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-panel" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-ink leading-snug line-clamp-2">
              {item.name}
            </p>
            {item.variant && item.variant !== 'Default' && (
              <p className="text-xs text-muted mt-0.5">{item.variant}</p>
            )}
            {/* Per-item price */}
            <p className="text-xs text-muted mt-1">
              {formatINR(item.price)} each
              {item.originalPrice > item.price && (
                <s className="ml-1.5 text-muted/70">{formatINR(item.originalPrice)}</s>
              )}
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quantity stepper + line total */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-lg text-muted hover:bg-surface disabled:opacity-30 transition-colors font-medium"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-display font-semibold text-ink">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-lg text-muted hover:bg-surface transition-colors font-medium"
            >
              +
            </button>
          </div>

          <span className="font-display font-bold text-ink">
            {formatINR(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── You May Also Like ─────────────────────────────────────────────────────────
function YouMayAlsoLike({ excludeIds }: { excludeIds: string[] }) {
  const suggestions = (productsData as typeof productsData).filter(
    p => !excludeIds.includes(p.id)
  ).slice(0, 4)

  if (suggestions.length === 0) return null

  return (
    <section className="mt-16">
      <SectionHeading title="You may also like" viewAllHref="/products" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {suggestions.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            originalPrice={p.originalPrice}
            images={p.images}
            category={p.category}
            rating={p.rating}
            reviewCount={p.reviewCount}
            badge={p.badge}
            labelType={p.labelType}
            isSoldOut={p.isSoldOut ?? false}
          />
        ))}
      </div>
    </section>
  )
}

// ── Main Cart Page ────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  const cartItemIds = items.map(i => i.id)

  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-display font-bold text-ink mb-8">Your cart</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Free delivery bar */}
          <FreeDeliveryBar subtotal={subtotal} />

          <div className="grid lg:grid-cols-5 gap-8">
            {/* ── Line items ── */}
            <div className="lg:col-span-3">
              <div className="card p-0 divide-y-0" data-testid="cart-items">
                <div className="px-1">
                  {items.map(item => (
                    <CartLineItem
                      key={item.id}
                      item={item}
                      onRemove={removeItem}
                      onQuantityChange={updateQuantity}
                    />
                  ))}
                </div>
              </div>

              {/* Continue shopping */}
              <div className="mt-4">
                <Link
                  href="/products"
                  className="text-sm text-brand hover:underline font-sans flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg text-ink mb-5">Order summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted font-sans">
                    <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted font-sans">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-brand">FREE</span>
                    ) : (
                      <span className="font-semibold text-ink">{formatINR(shipping)}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted font-sans">
                      Free shipping on orders over {formatINR(FREE_SHIPPING_THRESHOLD)}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-lg text-ink">Total</span>
                    <span className="font-display font-extrabold text-xl text-ink">
                      {formatINR(total)}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-sans mt-1">Inclusive of all taxes</p>
                </div>

                <div className="mt-6">
                  <Button variant="primary" fullWidth href="/checkout">
                    Proceed to Checkout
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted font-sans">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    Secure checkout
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Pan-India delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* You may also like */}
          <YouMayAlsoLike excludeIds={cartItemIds} />
        </>
      )}
    </main>
  )
}
