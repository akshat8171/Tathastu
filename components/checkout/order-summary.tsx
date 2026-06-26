'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { useCheckout } from '@/components/checkout/checkout-context'
import { Spinner } from '@/components/ui/spinner'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Shape returned by POST /api/coupons/validate ───────────────────────────────
interface CouponResult {
  valid: boolean
  discount: number
  code: string
  message: string
  subtotal: number
}

export function OrderSummary() {
  const { items } = useCart()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  // ── Applied coupon is shared with CheckoutForm via CheckoutProvider so the
  //    discount shown here is the one the order is actually placed with. ─────
  const { appliedCoupon, setAppliedCoupon } = useCheckout()

  // ── Local-only coupon input/validation UI state ──────────────────────────
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const discount = appliedCoupon?.discount ?? 0
  const total = Math.max(0, subtotal - discount + shipping)

  async function handleApplyCoupon() {
    const code = couponInput.trim()
    if (!code) return

    setCouponLoading(true)
    setCouponError(null)
    setAppliedCoupon(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_image: item.image || undefined,
            product_variant: item.variant || undefined,
            quantity: item.quantity,
          })),
        }),
      })

      const data: CouponResult = await res.json()

      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount: data.discount })
        setCouponError(null)
      } else {
        setAppliedCoupon(null)
        setCouponError(data.message || 'Invalid coupon code')
      }
    } catch {
      setCouponError('Could not validate coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponInput('')
  }

  function handleCouponKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApplyCoupon()
    }
  }

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

      {/* Coupon input */}
      <div className="mb-5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <div>
              <p className="text-sm font-display font-semibold text-green-700">
                {appliedCoupon.code} applied
              </p>
              <p className="text-xs text-green-600 font-sans mt-0.5">
                You save {formatINR(appliedCoupon.discount)}!
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs font-sans text-red-500 hover:underline flex-shrink-0 ml-3"
              aria-label="Remove coupon"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={handleCouponKeyDown}
                placeholder="Coupon code"
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                aria-label="Coupon code"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand text-white font-sans text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {couponLoading ? (
                  <Spinner size="xs" className="text-white" label="Validating coupon" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-600 font-sans">{couponError}</p>
            )}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted font-sans">
          <span>Subtotal</span>
          <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm font-sans">
            <span className="text-muted">
              Discount{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ''}
            </span>
            <span className="font-semibold text-green-600">−{formatINR(discount)}</span>
          </div>
        )}

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
