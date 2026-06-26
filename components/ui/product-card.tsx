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
    <div className={`card group flex flex-col overflow-hidden ${className}`}>
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
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        )}

        {/* ── Customizable badge – top-left (P1) ── */}
        {isCustomizable && !isSoldOut && (
          <span className="absolute top-2 left-2 z-10">
            <Badge variant="customizable">Customizable</Badge>
          </span>
        )}

        {/* ── Sale badge – top-left (when not customizable) ── */}
        {showSaleBadge && !isCustomizable && (
          <span className="absolute top-2 left-2 z-10">
            <Badge variant="sale">Sale</Badge>
          </span>
        )}

        {/* ── Sold-out overlay ── */}
        {isSoldOut && (
          <span className="absolute top-2 left-2 z-10">
            <Badge variant="sale">Sold Out</Badge>
          </span>
        )}

        {/* ── New badge – top-left (when no sale / customizable) ── */}
        {showNewBadge && !isCustomizable && (
          <span className="absolute top-2 left-2 z-10">
            <Badge variant="new">New</Badge>
          </span>
        )}

        {/* ── Discount badge – top-right ── */}
        {showDiscountBadge && (
          <span className="absolute top-2 right-2 z-10">
            <Badge variant="discount">{discountPct}% OFF</Badge>
          </span>
        )}

        {/* ── Wishlist heart – top-right ── */}
        <button
          className={`absolute ${showDiscountBadge ? 'top-9' : 'top-2'} right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white`}
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

        {/* Rating */}
        <Rating value={rating} count={reviewCount} />

        {/* Price — "From ₹X" when has options/variants (P1) */}
        {showFromPrice ? (
          <p className="text-sm font-display font-semibold text-brand">
            From <span className="tabular-nums">₹{price.toLocaleString('en-IN')}</span>
          </p>
        ) : (
          <Price current={price} compareAt={originalPrice} showDiscount={false} />
        )}

        {/* Color swatches (P1) — show up to SWATCH_MAX with +N overflow */}
        {hasColors && (
          <div
            className="flex items-center gap-1.5 flex-wrap"
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

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut || isAdding}
          className={`mt-auto btn-primary-full text-xs py-2 rounded-lg ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={
            isSoldOut
              ? `${name} is sold out`
              : needsPdpFirst
              ? `${ctaLabel} — ${name}`
              : `Add ${name} to cart`
          }
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </span>
          ) : (
            ctaLabel
          )}
        </button>
      </div>
    </div>
  )
}
