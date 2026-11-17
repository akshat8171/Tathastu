import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

interface PromoStripProps {
  headline?: string
  subcopy?: string
  code?: string
}

/**
 * PromoStrip — full-width promotional banner below the hero.
 * Copy can be overridden from admin homepage settings.
 */
export function PromoStrip({
  headline = 'Free shipping on qualifying orders',
  subcopy,
  code = '',
}: PromoStripProps) {
  const detail =
    subcopy ||
    `Printed in Agra · Free shipping on orders above ₹${FREE_SHIPPING_THRESHOLD}`

  return (
    <section className="promo-gradient py-5 sm:py-6" aria-label="Promotional offer">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">

          {/* Main offer text */}
          <div>
            <p className="font-display font-bold text-white text-lg sm:text-xl leading-tight">
              {headline}
            </p>
            <p className="font-sans text-white/80 text-sm mt-0.5">
              {detail}
            </p>
          </div>

          {code ? (
            <>
              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-white/30 flex-shrink-0" aria-hidden="true" />

              {/* Coupon pill */}
              <div className="flex items-center gap-2">
                <span className="font-sans text-white/80 text-sm">Use code:</span>
                <span
                  className="font-display font-bold text-violet bg-white px-4 py-1.5 rounded-full text-sm tracking-widest select-all cursor-copy"
                  title="Click to select and copy"
                  aria-label={`Coupon code ${code}`}
                  role="text"
                >
                  {code}
                </span>
              </div>
            </>
          ) : null}

        </div>
      </div>
    </section>
  )
}
