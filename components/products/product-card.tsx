'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductLabelType } from '@/types/product'

export interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  comparePrice?: number
  discountPercentage?: number
  image: string
  secondImageUrl?: string
  badge?: string
  labelType?: ProductLabelType
  isSoldOut?: boolean
  category?: string
}

function getLabelStyles(labelType?: ProductLabelType, isSoldOut?: boolean) {
  if (isSoldOut) {
    return {
      text: 'Sold Out',
      className: 'bg-gray-800 text-white',
    }
  }

  switch (labelType) {
    case 'trending':
      return {
        text: 'Trending Now',
        className: 'bg-[#3e4f47] text-white',
      }
    case 'editors-choice':
      return {
        text: "Editors' Choice",
        className: 'bg-[#8b7b6c] text-white',
      }
    case 'lightning-deal':
      return {
        text: 'Lightning Deal',
        className: 'bg-[#80270f] text-white',
      }
    case 'new':
      return {
        text: 'New',
        className: 'bg-[#3e4f47] text-white',
      }
    default:
      return null
  }
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  comparePrice,
  discountPercentage,
  image,
  secondImageUrl,
  badge,
  labelType,
  isSoldOut,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const label = getLabelStyles(labelType, isSoldOut)
  const displayImage = isHovered && secondImageUrl ? secondImageUrl : image

  const calculatedDiscount = discountPercentage
    ? discountPercentage
    : originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : comparePrice
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : null

  return (
    <Link
      href={`/products/${id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] mb-4 bg-[#f5f5f5]">
        {(label || badge) && (
          <div
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-[4px] text-[10px] font-semibold uppercase tracking-[0.1em] ${
              label?.className || 'bg-[#3e4f47] text-white'
            }`}
          >
            {label?.text || badge}
          </div>
        )}
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-lg uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <h3 className="font-sans text-base font-semibold text-[#000000] mb-2 group-hover:text-[#3e4f47] transition-colors">
        {name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-lg font-bold text-[#000000]">
          ₹{price.toLocaleString()}
        </span>
        {(originalPrice || comparePrice) && (
          <>
            <span className="font-sans text-sm text-[#666666] line-through">
              ₹{(originalPrice || comparePrice)?.toLocaleString()}
            </span>
            {calculatedDiscount && (
              <span className="font-sans text-xs text-[#80270f] font-semibold">
                ({calculatedDiscount}% OFF)
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  )
}
