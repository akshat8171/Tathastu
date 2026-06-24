interface RatingProps {
  value: number        // e.g. 4.6
  count?: number       // review count
  className?: string
}

export function Rating({ value, count, className = '' }: RatingProps) {
  const fullStars  = Math.floor(value)
  const half       = value - fullStars >= 0.25 && value - fullStars < 0.75
  const emptyStars = 5 - fullStars - (half ? 1 : 0)

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rating: ${value} out of 5${count ? `, ${count} reviews` : ''}`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarFull key={`full-${i}`} />
        ))}
        {half && <StarHalf />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarEmpty key={`empty-${i}`} />
        ))}
      </div>
      <span className="text-xs text-muted font-sans">
        {value.toFixed(1)}
        {count !== undefined && <span className="ml-0.5">({count})</span>}
      </span>
    </div>
  )
}

function StarFull() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#F59E0B" aria-hidden="true">
      <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 7.92 3.22 9.56l.53-3.1L1.5 4.27l3.11-.45L6 1z" />
    </svg>
  )
}

function StarHalf() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <defs>
        <linearGradient id="half-grad">
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D1D5DB" />
        </linearGradient>
      </defs>
      <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 7.92 3.22 9.56l.53-3.1L1.5 4.27l3.11-.45L6 1z" fill="url(#half-grad)" />
    </svg>
  )
}

function StarEmpty() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#D1D5DB" aria-hidden="true">
      <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 7.92 3.22 9.56l.53-3.1L1.5 4.27l3.11-.45L6 1z" />
    </svg>
  )
}
