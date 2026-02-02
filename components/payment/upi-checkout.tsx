'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { validatePhoneNumber, validateEmail, generateOrderId, getCashfreeConfig, loadCashfreeSDK } from '@/lib/cashfree'

interface CustomerDetails {
  name: string
  email: string
  phone: string
}

interface UpiCheckoutProps {
  onSuccess?: (orderId: string) => void
  onFailure?: (error: string) => void
}

export function UpiCheckout({ onSuccess, onFailure }: UpiCheckoutProps) {
  const { items, clearCart } = useCart()
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  function validateForm(): boolean {
    const newErrors: Partial<CustomerDetails> = {}

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(customerDetails.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhoneNumber(customerDetails.phone)) {
      newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePayment() {
    // Validate form
    if (!validateForm()) {
      return
    }

    // Check if cart is empty
    if (items.length === 0) {
      alert('Your cart is empty!')
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderAmount: total,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          orderNote: `Order for ${items.length} item(s)`,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: Load Cashfree SDK
      await loadCashfreeSDK()

      // Step 3: Initialize Cashfree
      const config = getCashfreeConfig()
      const cashfree = (window as any).Cashfree({
        mode: config.env,
      })

      // Step 4: Create checkout options (UPI only)
      const checkoutOptions = {
        paymentSessionId: orderData.orderToken,
        returnUrl: `${window.location.origin}/payment/callback?order_id=${orderData.orderId}`,
        paymentMethods: {
          upi: {
            enabled: true,
          },
          card: {
            enabled: false,
          },
          netbanking: {
            enabled: false,
          },
          wallet: {
            enabled: false,
          },
        },
      }

      // Step 5: Open payment modal
      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.error('Payment error:', result.error)
          if (onFailure) {
            onFailure(result.error.message || 'Payment failed')
          }
          setIsProcessing(false)
        }
        
        if (result.paymentDetails) {
          console.log('Payment successful:', result.paymentDetails)
          
          // Clear cart on success
          clearCart()
          
          if (onSuccess) {
            onSuccess(orderData.orderId)
          }
          
          setIsProcessing(false)
        }
      })

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.'
      
      if (onFailure) {
        onFailure(errorMessage)
      } else {
        alert(errorMessage)
      }
      
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Customer Details Form */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
          Customer Details
        </h3>

        {/* Name */}
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-zinc-700 mb-1">
            Full Name *
          </label>
          <input
            id="customer-name"
            type="text"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7B6C] ${
              errors.name ? 'border-red-500' : 'border-zinc-300'
            }`}
            placeholder="Enter your full name"
            disabled={isProcessing}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium text-zinc-700 mb-1">
            Email Address *
          </label>
          <input
            id="customer-email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7B6C] ${
              errors.email ? 'border-red-500' : 'border-zinc-300'
            }`}
            placeholder="your.email@example.com"
            disabled={isProcessing}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="customer-phone" className="block text-sm font-medium text-zinc-700 mb-1">
            Phone Number *
          </label>
          <input
            id="customer-phone"
            type="tel"
            value={customerDetails.phone}
            onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7B6C] ${
              errors.phone ? 'border-red-500' : 'border-zinc-300'
            }`}
            placeholder="9876543210"
            maxLength={10}
            disabled={isProcessing}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">UPI Payment Only</p>
            <p className="text-xs text-blue-700 mt-1">
              You'll be redirected to complete payment via UPI (Google Pay, PhonePe, Paytm, etc.)
            </p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Transaction Fee: Only 0.5% 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing || items.length === 0}
        className="w-full bg-[#8B7B6C] hover:bg-[#7a6b5d] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ₹{total.toLocaleString()} via UPI
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-zinc-500 text-center">
        🔒 Secure payment powered by Cashfree
      </p>
    </div>
  )
}
