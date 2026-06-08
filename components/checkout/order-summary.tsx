'use client'

import { useCart } from '@/components/cart/cart-context'
import Image from 'next/image'

export function OrderSummary() {
  const { items } = useCart()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + shipping

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface rounded-lg overflow-hidden relative flex-shrink-0">
              {item.image && (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-surface-light pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-surface-light">
          <span>Total</span>
          <span className="gradient-text">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
