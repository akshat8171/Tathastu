import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

/**
 * PromoStrip — full-width promotional banner below the hero.
 *
 * Copy is intentionally aligned with the seeded coupon engine:
 *   - Code:          FIRST20
 *   - Discount:      20% off first order
 *   - Min order:     ₹199  (FREE_SHIPPING_THRESHOLD — same threshold as free shipping)
 *   - Free shipping: orders over ₹199 (FREE_SHIPPING_THRESHOLD)
 *
 * Never hardcode ₹199; import FREE_SHIPPING_THRESHOLD from lib/pricing.
 */
export function PromoStrip() {
  return (
    <section className="promo-gradient py-5 sm:py-6" aria-label="Promotional offer">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">

          {/* Main offer text */}
          <div>
            <p className="font-display font-bold text-white text-lg sm:text-xl leading-tight">
              20% OFF your first order
            </p>
            <p className="font-sans text-white/80 text-sm mt-0.5">
              One-time use &middot; Min order ₹{FREE_SHIPPING_THRESHOLD} &middot; Free shipping on orders over ₹{FREE_SHIPPING_THRESHOLD}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-white/30 flex-shrink-0" aria-hidden="true" />

          {/* Coupon pill */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-white/80 text-sm">Use code:</span>
            <span
              className="font-display font-bold text-violet bg-white px-4 py-1.5 rounded-full text-sm tracking-widest select-all cursor-copy"
              title="Click to select and copy"
              aria-label="Coupon code FIRST20"
              role="text"
            >
              FIRST20
            </span>
          </div>

        </div>
      </div>
    </section>
  )
}
