'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from './badge'
import { Rating } from './rating'
import { Price } from './price'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/cart-context'
import { useWishlist } from '@/components/wishlist/wishlist-context'

// ── Color swatch hex map (mirrors product-options.tsx, kept in sync) ───────────
const COLOR_HEX: Record<string, string> = {
  black:      '#1a1a1a',
  white:      '#f5f5f5',
  red:        '#dc2626',
  blue:       '#2563eb',
  green:      '#16a34a',
  yellow:     '#eab308',
  orange:     '#ea580c',
  purple:     '#9333ea',
  pink:       '#ec4899',
  grey:       '#6b7280',
  gray:       '#6b7280',
  brown:      '#92400e',
  terracotta: '#c2602d',
  sand:       '#d4a96a',
  natural:    '#d4b896',
  wood:       '#a1775a',
  silver:     '#c0c0c0',
  gold:       '#d4af37',
  ivory:      '#fffff0',
  cream:      '#fffdd0',
  teal:       '#0d9488',
  navy:       '#1e3a5f',
}

function swatchColor(name: string): string {
  return COLOR_HEX[name.toLowerCase()] ?? '#9ca3af'
}

// ── Product shape — must match lib/products.json ──────────────────────────────
export interface ProductCardData {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  badge?: string | null
  labelType?: string | null
  isSoldOut?: boolean
  // Optional enriched fields (all guarded)
  colors?: string[]
  customizable?: boolean
  options?: Array<{ name: string; values: string[] }>
}

// ── Optional callbacks ────────────────────────────────────────────────────────
export interface ProductCardProps extends ProductCardData {
  onAddToCart?: (id: string) => void
  className?: string
  showRating?: boolean  // default true
}

// Swatch overflow threshold
const SWATCH_MAX = 4

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  images,
  category,
  rating,
  reviewCount,
  badge,
  labelType,
  isSoldOut = false,
  onAddToCart,
  className = '',
  colors,
  customizable,
  options,
  showRating = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const { addItem } = useCart()
  const { isWishlisted, toggle, requiresAuth } = useWishlist()

  const primaryImage   = images[0] ?? ''
  const secondaryImage = images[1] ?? images[0] ?? ''
  const displayImage   = isHovered && secondaryImage ? secondaryImage : primaryImage

  // Compute % off
  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  const hasOptions    = !!options && options.length > 0
  const isCustomizable = !!customizable
  const hasColors      = !!colors && colors.length > 0

  // CTA — if product has options/customizable, navigate to PDP instead of instant-add
  const needsPdpFirst = hasOptions || isCustomizable

  // From ₹X pricing label (shown when product has options/colors variants)
  const showFromPrice = hasOptions || hasColors

  const showDiscountBadge = !isSoldOut && discountPct !== null
  const showNewBadge      = labelType === 'new' && !isSoldOut && discountPct === null
  const showSaleBadge     = !isSoldOut && discountPct !== null

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isSoldOut || isAdding) return

    if (needsPdpFirst) {
      // Navigate to PDP for option selection
      router.push(`/products/${id}`)
      return
    }

    setIsAdding(true)
    addItem({
      id,
      name,
      variant: 'Default',
      price,
      originalPrice: originalPrice ?? price,
      quantity: 1,
      image: primaryImage,
    })
    if (onAddToCart) onAddToCart(id)
    setTimeout(() => setIsAdding(false), 800)
  }

  const ctaLabel = isSoldOut
    ? 'Sold Out'
    : needsPdpFirst
    ? isCustomizable
      ? 'Customize'
      : 'Choose options'
    : 'Add to cart'

  return (
    <div className={`card group flex flex-col overflow-hidden h-full ${className}`}>
      {/* ── Image panel ───────────────────────────────────────────────────── */}
      <Link
        href={`/products/${id}`}
        className="relative block bg-panel aspect-square overflow-hidden flex-shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`View ${name}`}
      >
        {displayImage && (
          <Image
            src={displayImage}
            alt={`Buy ${name} - 3D printed ${category} online India`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* PC-01 / PC-03: badges stacked top-left */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {isSoldOut && <Badge variant="sale">Sold Out</Badge>}
          {isCustomizable && !isSoldOut && <Badge variant="customizable">Customizable</Badge>}
          {showSaleBadge && !isCustomizable && <Badge variant="sale">Sale</Badge>}
          {showDiscountBadge && <Badge variant="discount">{discountPct}% OFF</Badge>}
          {showNewBadge && !isCustomizable && <Badge variant="new">New</Badge>}
        </div>

        <button
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110"
          aria-label={isWishlisted(id) ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isWishlisted(id)}
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (requiresAuth) {
              router.push('/login')
            } else {
              await toggle(id)
            }
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isWishlisted(id) ? 'currentColor' : 'none'}
            stroke={isWishlisted(id) ? 'currentColor' : '#6B7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={isWishlisted(id) ? 'text-red-500' : ''}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* PC-01: competitor chrome — price pill + circular ATC always visible on image */}
        {!isSoldOut && (
          <div className="absolute inset-x-2 bottom-2 z-10 flex items-end justify-between gap-2 pointer-events-none">
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-display font-bold text-ink shadow-badge tabular-nums">
              {showFromPrice ? 'From ' : ''}₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="pointer-events-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-badge hover:bg-brand-600 transition-colors disabled:opacity-60"
              aria-label={
                needsPdpFirst
                  ? `${ctaLabel} — ${name}`
                  : `Add ${name} to cart`
              }
            >
              {isAdding ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* ── Info section ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Title */}
        <Link
          href={`/products/${id}`}
          className="text-sm font-display font-semibold text-ink leading-snug line-clamp-2 hover:text-brand transition-colors"
        >
          {name}
        </Link>

        {/* Rating — conditional via prop */}
        {showRating && <Rating value={rating} count={reviewCount} />}

        {/* Price row (mirrors on-image pill for list readability) */}
        {showFromPrice ? (
          <p className="text-sm font-display font-semibold text-brand">
            From <span className="tabular-nums">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        ) : (
          <Price current={price} compareAt={originalPrice} showDiscount={false} />
        )}

        {/* Color swatches — show up to SWATCH_MAX with +N overflow */}
        {hasColors && (
          <div
            className="flex items-center gap-1.5 flex-wrap mt-auto"
            aria-label={`Available in: ${colors!.join(', ')}`}
          >
            <span className="text-[10px] text-muted font-sans">Colors:</span>
            {colors!.slice(0, SWATCH_MAX).map((c) => (
              <span
                key={c}
                title={c}
                className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: swatchColor(c) }}
                aria-hidden="true"
              />
            ))}
            {colors!.length > SWATCH_MAX && (
              <span className="text-[10px] text-muted font-sans">
                +{colors!.length - SWATCH_MAX}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
