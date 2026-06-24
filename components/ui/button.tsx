'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
}

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-4 py-2',
  md: '',           // default – globals.css sizes already applied in btn-* classes
  lg: 'text-base px-8 py-4',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BaseProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
  className?: string
}

// Button element (no href)
interface ButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | 'children'> {
  href?: undefined
}

// Anchor/Link (with href)
interface LinkProps extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'children'> {
  href: string
}

type Props = ButtonProps | LinkProps

// ── Component ─────────────────────────────────────────────────────────────────

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...rest
}: Props) {
  const base =
    `${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as LinkProps
    return (
      <Link href={href} className={base} {...(anchorRest as object)}>
        {children}
      </Link>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={base} {...buttonRest}>
      {children}
    </button>
  )
}
