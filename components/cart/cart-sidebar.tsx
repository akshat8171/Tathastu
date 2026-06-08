'use client'

import { useEffect } from 'react'
import { useCart } from './cart-context'
import Link from 'next/link'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items: cartItems, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
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

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-md bg-brand-dark border-l border-surface-light/20 shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-light/20">
          <span className="text-sm font-display font-semibold">YOUR CART ({cartItems.length})</span>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors" aria-label="Close cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <span className="text-4xl mb-4">🛒</span>
              <p className="font-medium">Your cart is empty</p>
              <Link href="/products" onClick={onClose} className="mt-4 text-brand-purple hover:underline text-sm">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-surface/50 rounded-xl">
                  <div className="w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.variant}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-surface rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center hover:bg-surface-light rounded-l-lg disabled:opacity-40 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-surface-light rounded-r-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors self-start">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-surface-light/20 px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-lg font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full text-center block"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
