'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './cart-context'
import { Button } from '@/components/ui/button'

// ── Free-delivery threshold (mirrors lib/pricing.ts) ─────────────────────────
const FREE_SHIPPING_THRESHOLD = 999

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items: cartItems, removeItem, updateQuantity, itemCount } = useCart()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id)
    if (item) {
      updateQuantity(id, item.quantity + delta)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 99
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const freeShippingPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-[90%] max-w-md bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <span className="font-display font-semibold text-ink">
            Cart{' '}
            {itemCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-ink"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free-delivery progress */}
        {cartItems.length > 0 && (
          <div className="px-5 py-3 bg-surface border-b border-gray-100">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <p className="text-xs font-sans font-semibold text-brand text-center">
                🎉 You&apos;ve unlocked FREE delivery!
              </p>
            ) : (
              <p className="text-xs font-sans text-muted text-center mb-1.5">
                Add <span className="font-semibold text-ink">{formatINR(remaining)}</span> more for FREE delivery
              </p>
            )}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{ width: `${freeShippingPct}%` }}
                role="progressbar"
                aria-valuenow={freeShippingPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-panel flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </div>
              <p className="font-display font-semibold text-ink mb-1">Your cart is empty</p>
              <p className="text-sm text-muted font-sans mb-5">Add items to get started</p>
              <Button variant="outline" size="sm" href="/products" onClick={onClose}>
                Browse products
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-surface rounded-xl">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-panel overflow-hidden flex-shrink-0 relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-panel" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-ink leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    {item.variant && item.variant !== 'Default' && (
                      <p className="text-xs text-muted">{item.variant}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-muted hover:bg-surface disabled:opacity-30 transition-colors text-base font-medium"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-display font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-muted hover:bg-surface transition-colors text-base font-medium"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-display font-bold text-sm text-ink">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="self-start p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted font-sans">Subtotal</span>
              <span className="font-display font-bold text-lg text-ink">{formatINR(subtotal)}</span>
            </div>
            {/* Shipping */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted font-sans">Shipping</span>
              {shipping === 0 ? (
                <span className="font-semibold text-brand font-sans">FREE</span>
              ) : (
                <span className="text-muted font-sans">{formatINR(shipping)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                href="/cart"
                onClick={onClose}
                className="flex-1 justify-center"
              >
                View cart
              </Button>
              <Button
                variant="primary"
                size="sm"
                href="/checkout"
                onClick={onClose}
                className="flex-1 justify-center"
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
