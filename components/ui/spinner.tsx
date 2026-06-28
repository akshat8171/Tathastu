import type { CSSProperties } from 'react'

/**
 * Shared loading spinner.
 *
 * Pure presentational SVG (no hooks/state) so it can be rendered from BOTH
 * server and client components. Inherits color via `currentColor`, so set the
 * text color on the parent (e.g. `text-white` inside a primary button,
 * `text-brand` on a surface).
 *
 * Sizes map to the tailwind h-/w- scale used elsewhere in the app
 * (add-to-cart-button, product-card).
 */

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClass: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
}

export function Spinner({
  size = 'sm',
  className = '',
  style,
  label = 'Loading',
}: {
  size?: SpinnerSize
  className?: string
  style?: CSSProperties
  /** Accessible label; rendered as an sr-only role=status sibling is overkill, so we put it on the svg. */
  label?: string
}) {
  return (
    <svg
      className={`animate-spin ${sizeClass[size]} ${className}`.trim()}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
