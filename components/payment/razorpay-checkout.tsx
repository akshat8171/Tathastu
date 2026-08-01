'use client'

import { useState } from 'react'
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  isMockPaymentEnabled,
  createMockRazorpayResult,
  RazorpayPaymentResult,
} from '@/lib/razorpay'

interface Props {
  amount: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  onPaymentSuccess: (result: RazorpayPaymentResult) => void
  onPaymentError?: (error: unknown) => void
  disabled?: boolean
}

export function RazorpayCheckout({
  amount,
  customerName,
  customerPhone,
  customerEmail,
  onPaymentSuccess,
  onPaymentError,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)

    if (isMockPaymentEnabled) {
      await new Promise(r => setTimeout(r, 600))
      onPaymentSuccess(createMockRazorpayResult())
      setLoading(false)
      return
    }

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert('Razorpay failed to load. Check your internet connection.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          customer: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || '',
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.orderId) {
        alert(data.error || 'Failed to create order')
        setLoading(false)
        return
      }

      openRazorpayCheckout({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency || 'INR',
        customerName,
        customerEmail,
        customerPhone,
        onSuccess: async response => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.success) {
              onPaymentSuccess(response)
            } else {
              onPaymentError?.(verifyData.error || 'Payment verification failed')
            }
          } catch (err) {
            onPaymentError?.(err)
          } finally {
            setLoading(false)
          }
        },
        onDismiss: () => {
          setLoading(false)
          onPaymentError?.('Payment cancelled')
        },
        onError: err => {
          setLoading(false)
          onPaymentError?.(err)
        },
      })
    } catch (err) {
      onPaymentError?.(err)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={disabled || loading}
        className="btn-primary w-full text-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
      </button>
      {isMockPaymentEnabled && (
        <p className="mt-2 text-center text-xs font-sans text-amber-600">
          Mock payment mode — no real charge. A real order is still saved to the DB.
        </p>
      )}
    </div>
  )
}
