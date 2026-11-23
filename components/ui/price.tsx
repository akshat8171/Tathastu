interface PriceProps {
  current: number          // current selling price (₹)
  compareAt?: number       // kept for callers / Merchant MRP; not shown on storefront
  showDiscount?: boolean   // deprecated — storefront no longer shows % OFF
  className?: string
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Renders the selling price only — no strikethrough MRP or % OFF badge. */
export function Price({ current, className = '' }: PriceProps) {
  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className="text-base font-display font-bold text-ink">
        {formatINR(current)}
      </span>
    </div>
  )
}
