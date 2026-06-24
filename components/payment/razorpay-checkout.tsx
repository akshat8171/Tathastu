'use client'

import { useState } from 'react'
import { loadRazorpayScript, openRazorpayCheckout, RazorpayResponse } from '@/lib/razorpay'

interface Props {
  amount: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  onPaymentSuccess: (response: RazorpayResponse) => void
  onPaymentError?: (error: any) => void
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

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      alert('Razorpay failed to load. Check your internet connection.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })

    const data = await res.json()
    if (!data.success) {
      alert(data.error || 'Failed to create order')
      setLoading(false)
      return
    }

    openRazorpayCheckout({
      orderId: data.orderId,
      amount: data.amount,
      customerName,
      customerPhone,
      customerEmail,
      onSuccess: async (response) => {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        })
        const verifyData = await verifyRes.json()
        if (verifyData.success) {
          onPaymentSuccess(response)
        } else {
          onPaymentError?.(verifyData.error)
        }
        setLoading(false)
      },
      onError: (err) => {
        onPaymentError?.(err)
        setLoading(false)
      },
    })
  }

  return (
    <button
      onClick={handlePay}
      disabled={disabled || loading}
      className="btn-primary w-full text-lg disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
    </button>
  )
}
