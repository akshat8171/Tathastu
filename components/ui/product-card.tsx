'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from './badge'
import { Rating } from './rating'
import { Price } from './price'
import { useCart } from '@/components/cart/cart-context'

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
}

// ── Optional callbacks ────────────────────────────────────────────────────────
export interface ProductCardProps extends ProductCardData {
  onAddToCart?: (id: string) => void
  className?: string
}

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
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const primaryImage   = images[0] ?? ''
  const secondaryImage = images[1] ?? images[0] ?? ''
  const displayImage   = isHovered && secondaryImage ? secondaryImage : primaryImage

  // Compute % off
  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  // Map labelType to sale badge (shown top-left, red)
  const showSaleBadge  = labelType === 'sale' || isSoldOut === false && discountPct !== null
  const showDiscountBadge = !isSoldOut && discountPct !== null
  const showNewBadge   = labelType === 'new'

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isSoldOut || isAdding) return

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

        {/* ── Sale badge – top-left ── */}
        {showSaleBadge && !isSoldOut && discountPct !== null && (
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

        {/* ── New badge – top-left (when no sale) ── */}
        {showNewBadge && !isSoldOut && discountPct === null && (
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

        {/* ── Wishlist heart – top-right (moves down when discount badge present) ── */}
        <button
          className={`absolute ${showDiscountBadge ? 'top-9' : 'top-2'} right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white`}
          aria-label={`Add ${name} to wishlist`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

        {/* Price */}
        <Price current={price} compareAt={originalPrice} showDiscount={false} />

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut || isAdding}
          className={`mt-auto btn-primary-full text-xs py-2 rounded-lg ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isSoldOut ? `${name} is sold out` : `Add ${name} to cart`}
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </span>
          ) : isSoldOut ? (
            'Sold Out'
          ) : (
            'Add to cart'
          )}
        </button>
      </div>
    </div>
  )
}
