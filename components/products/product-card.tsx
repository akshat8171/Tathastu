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
      bgColor: '#99a58f',
    }
  }

  switch (labelType) {
    case 'trending':
      return {
        text: 'Trending Now',
        bgColor: '#99a58f',
      }
    case 'editors-choice':
      return {
        text: "Editors' Choice",
        bgColor: '#8b7b6c',
      }
    case 'lightning-deal':
      return {
        text: 'Lightning Deal',
        bgColor: '#3e4f47',
      }
    case 'new':
      return {
        text: 'New',
        bgColor: '#3e4f47',
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

  const labelText = label?.text || badge

  return (
    <div className="product-card js-product-card product-card--style7" data-price={price * 100}>
      <div className="product-card__image-wr overflow-hidden">
        <Link
          href={`/products/${id}`}
          className="product-card__image js image-content__image-wrapper square"
          style={{ maxWidth: '800px', paddingTop: '100.0%', position: 'relative', display: 'block' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={image}
            alt={name}
            fill
            className="scale-in first-image lazyautosizes lazyloaded"
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 360px, 540px"
            style={{ objectFit: 'cover' }}
            unoptimized
            priority={false}
            onError={(e) => {
              console.error('Image failed to load:', image, e)
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', image)
            }}
          />
          {secondImageUrl && (
            <Image
              src={secondImageUrl}
              alt={name}
              fill
              className={`transition second-image lazyautosizes lazyloaded ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 360px, 540px"
              style={{ objectFit: 'cover' }}
              unoptimized
              priority={false}
            />
          )}
        </Link>
        <div className="product-card__overlay d-flex justify-content-center flex-column">
          <span className="btn product-card__overlay-btn js-grid-cart" title="Add to Cart">
            <svg aria-hidden="true" fill="none" focusable="false" width="24" className="svg-cart" viewBox="0 0 24 24">
              <path d="M10 7h13l-4 9H7.5L5 3H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
              <circle cx="17" cy="20" r="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
            </svg>
            <div className="product-card__loading spinner-grow" role="status"></div>
            <span>Add to Cart</span>
          </span>
        </div>

        {/* Product Label */}
        {labelText && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              backgroundColor: label?.bgColor || '#99a58f',
              borderRadius: 'var(--g-radius-label)',
              color: '#ffffff',
              fontSize: 'calc(var(--g-label-size) + 2px)',
              fontFamily: 'var(--g-font-2)',
              letterSpacing: 'var(--g-label-space)',
              fontWeight: 500,
              lineHeight: 1,
              padding: '6px 10px',
            }}
          >
            {labelText}
          </span>
        )}

        <div className="product-label" style={{ top: '4px', left: '4px', right: 'auto' }}></div>
      </div>
      <div className="product-card__info">
        <Link href={`/products/${id}`} title={name} className="product-card__name d-block">
          {name}
        </Link>
        <div className={`product-card__price ${originalPrice || comparePrice ? 'product-card__pricesale' : ''}`}>
          <span className="visually-hidden">Regular price</span>
          <span className="money">₹ {price.toLocaleString()}</span>
          {(originalPrice || comparePrice) && (
            <>
              <s className="product-card__regular-price">
                <span className="money">₹ {(originalPrice || comparePrice)?.toLocaleString()}</span>
              </s>
              <span className="visually-hidden">Sale price</span>
              {calculatedDiscount && (
                <span className="badge percent_off"> ({calculatedDiscount}% OFF) </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
