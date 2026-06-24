export function PromoStrip() {
  return (
    <section className="promo-gradient py-5 sm:py-6" aria-label="Promotional offer">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
          {/* Main text */}
          <div>
            <p className="font-display font-bold text-white text-lg sm:text-xl leading-tight">
              Get 20% OFF on your first order
            </p>
            <p className="font-sans text-white/80 text-sm mt-0.5">
              One-time use · Valid on all products · No minimum order value
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-white/30 flex-shrink-0" />

          {/* Coupon pill */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-white/80 text-sm">Use code:</span>
            <span
              className="font-display font-bold text-violet bg-white px-4 py-1.5 rounded-full text-sm tracking-widest select-all cursor-copy"
              title="Click to copy"
              aria-label="Coupon code FIRST20"
            >
              FIRST20
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
