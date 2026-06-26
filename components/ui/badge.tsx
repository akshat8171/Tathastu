import type { ReactNode } from 'react'

export type BadgeVariant = 'sale' | 'discount' | 'new' | 'customizable'

const variantClass: Record<BadgeVariant, string> = {
  sale:         'badge-sale',
  discount:     'badge-discount',
  new:          'badge-new',
  customizable: 'badge-customizable',
}

interface BadgeProps {
  variant: BadgeVariant
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
