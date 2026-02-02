'use client'

import { useEffect, useState } from 'react'
import { useCart } from './cart-context'
import { UpiCheckout } from '@/components/payment/upi-checkout'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items: cartItems, removeItem, updateQuantity } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  // Prevent body scroll when cart is open
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
  const savings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Opens from RIGHT with 95% width */}
      <div
        className={`fixed top-0 right-0 h-full w-[95%] bg-white shadow-[-10px_0px_30px_0px_rgba(0,0,0,0.15)] z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pr-4 h-[44px] border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider">YOUR CART</span>
            <span className="text-xs text-gray-500">({cartItems.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 256 256">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
            </svg>
          </button>
        </div>

        {/* Banner Strip */}
        <div className="bg-[#99A58F] text-white text-center py-1.5 px-3 text-xs font-semibold shadow-[0px_1px_5px_0px_rgba(0,0,0,0.2)] border-b border-[#99A58F]/50">
          Want Express Delivery? WhatsApp Us Now!
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 pt-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z"></path>
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="bg-zinc-100 rounded-xl p-2.5">
              <ul className="flex flex-col gap-5">
                {cartItems.map((item) => (
                  <li key={item.id} className="relative pb-5 border-b border-zinc-200 last:border-b-0 last:pb-0">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="relative min-h-[72px] min-w-[72px] h-[72px] w-[72px]">
                        <div className="overflow-hidden border border-gray-300 rounded-lg h-full w-full">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between min-h-[72px]">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-zinc-700 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-500">{item.variant}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                              <span className="text-sm font-semibold text-zinc-900">
                                ₹{item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                            aria-label="Remove item"
                          >
                            <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M216,48H180V36A28,28,0,0,0,152,8H104A28,28,0,0,0,76,36V48H40a12,12,0,0,0,0,24h4V208a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V72h4a12,12,0,0,0,0-24ZM100,36a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4V48H100Zm88,168H68V72H188ZM116,104v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm48,0v64a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Z"></path>
                            </svg>
                          </button>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center h-7 w-[72px] rounded border border-gray-300 bg-white overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <svg className="w-3.5 h-3.5 text-zinc-500" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"></path>
                              </svg>
                            </button>
                            <span className="flex-1 text-center text-xs font-medium text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <svg className="w-3.5 h-3.5 text-zinc-500" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View Coupons Button */}
          {cartItems.length > 0 && (
            <div className="mt-3 border border-green-600/20 rounded-xl bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center px-3 py-3.5">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M96,104a8,8,0,1,1,8-8A8,8,0,0,1,96,104Zm64,48a8,8,0,1,0,8,8A8,8,0,0,0,160,152Zm80-24c0,10.44-7.51,18.27-14.14,25.18-3.77,3.94-7.67,8-9.14,11.57-1.36,3.27-1.44,8.69-1.52,13.94-.15,9.76-.31,20.82-8,28.51s-18.75,7.85-28.51,8c-5.25.08-10.67.16-13.94,1.52-3.57,1.47-7.63,5.37-11.57,9.14C146.27,232.49,138.44,240,128,240s-18.27-7.51-25.18-14.14c-3.94-3.77-8-7.67-11.57-9.14-3.27-1.36-8.69-1.44-13.94-1.52-9.76-.15-20.82-.31-28.51-8s-7.85-18.75-8-28.51c-.08-5.25-.16-10.67-1.52-13.94-1.47-3.57-5.37-7.63-9.14-11.57C23.51,146.27,16,138.44,16,128s7.51-18.27,14.14-25.18c3.77-3.94,7.67-8,9.14-11.57,1.36-3.27,1.44-8.69,1.52-13.94.15-9.76.31-20.82,8-28.51s18.75-7.85,28.51-8c5.25-.08,10.67-.16,13.94-1.52,3.57-1.47,7.63-5.37,11.57-9.14C109.73,23.51,117.56,16,128,16s18.27,7.51,25.18,14.14c3.94,3.77,8,7.67,11.57,9.14,3.27,1.36,8.69,1.44,13.94,1.52,9.76.15,20.82.31,28.51,8s7.85,18.75,8,28.51c.08,5.25.16,10.67,1.52,13.94,1.47,3.57,5.37,7.63,9.14,11.57C232.49,109.73,240,117.56,240,128ZM96,120A24,24,0,1,0,72,96,24,24,0,0,0,96,120Zm77.66-26.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,11.32,11.32ZM184,160a24,24,0,1,0-24,24A24,24,0,0,0,184,160Z"></path>
                  </svg>
                  <span className="text-sm font-medium">View Coupons</span>
                </div>
                <svg className="w-3.5 h-3.5 text-zinc-700/60" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200">
            {/* Promo Banner */}
            <div className="bg-[#493E3E] text-white text-center py-1 px-3 text-[10px] font-bold shadow-[0px_-1px_5px_0px_rgba(0,0,0,0.2)]">
              Free Everything Mist Sample with All Orders
            </div>

            {/* Total Section */}
            <div className="px-4 pt-2 pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1">
                  <svg className="w-[18px] h-[18px] text-zinc-500/60" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V208a8,8,0,0,0,11.58,7.15L64,200.94l28.42,14.21a8,8,0,0,0,7.16,0L128,200.94l28.42,14.21a8,8,0,0,0,7.16,0L192,200.94l28.42,14.21A8,8,0,0,0,232,208V56A16,16,0,0,0,216,40ZM176,144H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm0-32H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z"></path>
                  </svg>
                  <span className="text-sm font-medium text-zinc-700">Estimated total</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-semibold text-zinc-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                  <div className="text-xs font-semibold text-green-600">
                    You saved ₹{savings.toLocaleString()}!
                  </div>
                </div>
              </div>

              {/* Checkout Section */}
              {!showCheckout ? (
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-14 bg-[#8B7B6C] hover:bg-[#7a6b5d] text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-sm text-zinc-600 hover:text-zinc-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Cart
                  </button>
                  <UpiCheckout 
                    onSuccess={(orderId) => {
                      window.location.href = `/payment/callback?order_id=${orderId}`
                    }}
                    onFailure={(error) => {
                      alert(`Payment failed: ${error}`)
                      setShowCheckout(false)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Powered by Cashfree */}
            <div className="flex justify-center items-center pb-2.5">
              <span className="text-[10px] font-medium text-zinc-400">Secure payment by Cashfree</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
