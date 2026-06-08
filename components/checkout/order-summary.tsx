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
      <h2 className="font-serif font-semibold text-lg mb-4">Order Summary</h2>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warm-gray rounded-lg overflow-hidden relative flex-shrink-0">
              {item.image && (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
              <p className="text-xs text-charcoal-light">Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-charcoal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-warm-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-charcoal-light">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm text-charcoal-light">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-warm-border text-charcoal">
          <span>Total</span>
          <span className="text-sage-green">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
