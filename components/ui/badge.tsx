import type { ReactNode } from 'react'

type Variant = 'sale' | 'discount' | 'new'

const variantClass: Record<Variant, string> = {
  sale:     'badge-sale',
  discount: 'badge-discount',
  new:      'badge-new',
}

interface BadgeProps {
  variant: Variant
  children: ReactNode
  className?: string
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantClass[variant]} ${className}`.trim()}>
      {children}
    </span>
  )
}
