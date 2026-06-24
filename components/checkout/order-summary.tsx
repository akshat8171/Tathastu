'use client'

import Image from 'next/image'
import { useCart } from '@/components/cart/cart-context'

// ── Free-delivery threshold (mirrors lib/pricing.ts) ─────────────────────────
const FREE_SHIPPING_THRESHOLD = 999

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function OrderSummary() {
  const { items } = useCart()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 99
  const total = subtotal + shipping

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg text-ink mb-5">Order Summary</h2>

      {/* Line items */}
      <div className="space-y-3 mb-5">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg bg-panel overflow-hidden relative flex-shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

            {/* Name + qty */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-semibold text-ink leading-snug truncate">
                {item.name}
              </p>
              <p className="text-xs text-muted font-sans">Qty: {item.quantity}</p>
            </div>

            {/* Line total */}
            <span className="text-sm font-display font-bold text-ink flex-shrink-0">
              {formatINR(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted font-sans">
          <span>Subtotal</span>
          <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm font-sans">
          <span className="text-muted">Shipping</span>
          {shipping === 0 ? (
            <span className="font-semibold text-brand">FREE</span>
          ) : (
            <span className="font-semibold text-ink">{formatINR(shipping)}</span>
          )}
        </div>

        {shipping > 0 && (
          <p className="text-xs text-muted font-sans">
            Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </p>
        )}

        <div className="flex justify-between items-baseline font-display font-bold text-lg pt-3 border-t border-gray-100 text-ink">
          <span>Total</span>
          <span className="text-brand">{formatINR(total)}</span>
        </div>
        <p className="text-xs text-muted font-sans">Inclusive of all taxes</p>
      </div>

      {/* Trust badges */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-muted font-sans">
          <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Secured with Razorpay · UPI, cards, wallets accepted
        </div>
      </div>
    </div>
  )
}
