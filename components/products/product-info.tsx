'use client'

import { useState } from 'react'
import { Rating } from '@/components/ui/rating'
import { Price } from '@/components/ui/price'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  careGuide?: string
  shippingInfo?: string
  productId: string
  image: string
}

type Section = 'description' | 'care' | 'shipping'

export function ProductInfo({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  careGuide,
  shippingInfo,
  productId,
  image,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [openSection, setOpenSection] = useState<Section | null>('description')

  function toggleSection(s: Section) {
    setOpenSection((prev) => (prev === s ? null : s))
  }

  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  return (
    <div className="flex flex-col gap-5">
      {/* ── Name ──────────────────────────────────────────────────────────────── */}
      <h1 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight">
        {name}
      </h1>

      {/* ── Rating summary ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Rating value={rating} count={reviewCount} />
        <span className="text-xs text-muted font-sans">
          Loved by {reviewCount}+ customers
        </span>
      </div>

      {/* ── Price ─────────────────────────────────────────────────────────────── */}
      <div>
        <Price current={price} compareAt={originalPrice} showDiscount />
        <p className="text-xs text-muted font-sans mt-1">Inclusive of all taxes</p>
      </div>

      {/* ── Coupon ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-4 py-3">
        <svg
          className="w-5 h-5 text-brand flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p className="text-sm font-sans text-ink">
          Use code{' '}
          <code className="font-display font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
            FIRST20
          </code>{' '}
          for <strong>20% OFF</strong> your first order
        </p>
      </div>

      {/* ── Quantity + Add to cart ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center gap-4">
          <span className="font-display font-semibold text-sm text-ink">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface transition-colors font-display font-semibold text-lg"
            >
              −
            </button>
            <span
              className="w-12 text-center font-display font-semibold text-sm text-ink"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface transition-colors font-display font-semibold text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to cart — reuse Cart builder's component */}
        <AddToCartButton
          product={{
            id: productId,
            name,
            price,
            originalPrice: originalPrice ?? price,
            image,
          }}
          className="w-full !bg-brand hover:!bg-brand-600 !rounded-xl !py-3.5 !text-base font-display font-semibold"
        />
      </div>

      {/* ── Trust row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            label: 'Secure Checkout',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            label: 'COD Available',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            ),
            label: 'Made in India',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 bg-surface rounded-xl py-3 px-2 text-center"
          >
            {item.icon}
            <span className="text-xs font-sans text-muted leading-tight">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Short description ─────────────────────────────────────────────────── */}
      <p className="text-sm text-muted font-sans leading-relaxed border-t border-gray-100 pt-5">
        {description}
      </p>

      {/* ── Accordion sections ────────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {careGuide && (
          <AccordionItem
            title="Care Guide"
            content={careGuide}
            isOpen={openSection === 'care'}
            onToggle={() => toggleSection('care')}
            icon={
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
        )}
        {shippingInfo && (
          <AccordionItem
            title="Shipping Information"
            content={shippingInfo}
            isOpen={openSection === 'shipping'}
            onToggle={() => toggleSection('shipping')}
            icon={
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  )
}

// ── Accordion ─────────────────────────────────────────────────────────────────

interface AccordionItemProps {
  title: string
  content: string
  isOpen: boolean
  onToggle: () => void
  icon: React.ReactNode
}

function AccordionItem({ title, content, isOpen, onToggle, icon }: AccordionItemProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between py-4 text-left hover:text-brand transition-colors"
      >
        <span className="flex items-center gap-2 font-display font-semibold text-sm text-ink">
          {icon}
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm text-muted font-sans leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}
