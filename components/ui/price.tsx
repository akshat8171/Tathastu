interface PriceProps {
  current: number          // current selling price (₹)
  compareAt?: number       // original / compare-at price
  showDiscount?: boolean   // show computed % off badge (default true when compareAt > current)
  className?: string
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function Price({ current, compareAt, showDiscount = true, className = '' }: PriceProps) {
  const discountPct =
    compareAt && compareAt > current
      ? Math.round(((compareAt - current) / compareAt) * 100)
      : null

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className="text-base font-display font-bold text-ink">
        {formatINR(current)}
      </span>

      {compareAt && compareAt > current && (
        <s className="text-sm text-muted font-sans line-through">
          {formatINR(compareAt)}
        </s>
      )}

      {showDiscount && discountPct && (
        <span className="badge-discount">
          {discountPct}% OFF
        </span>
      )}
    </div>
  )
}
