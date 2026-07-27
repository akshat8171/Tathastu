'use client'

import { useState } from 'react'
import {
  loadCashfreeScript,
  openCashfreeCheckout,
  isMockPaymentEnabled,
  createMockCashfreeResult,
  CashfreePaymentResult,
} from '@/lib/cashfree'

interface Props {
  amount: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  onPaymentSuccess: (result: CashfreePaymentResult) => void
  onPaymentError?: (error: unknown) => void
  disabled?: boolean
}

export function CashfreeCheckout({
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

    // ── Mock-payment mode (local E2E testing only) ──────────────────────────
    // Skips the Cashfree SDK, /api/payment/create-order, the modal, and
    // /api/payment/verify entirely. We hand a synthetic reference straight to
    // onPaymentSuccess, so the order still POSTs to /api/orders and writes a
    // REAL row to Supabase (left 'pending' since Cashfree can't confirm it).
    // Guarded so it cannot run in a production build.
    if (isMockPaymentEnabled) {
      await new Promise(r => setTimeout(r, 600))
      onPaymentSuccess(createMockCashfreeResult())
      setLoading(false)
      return
    }

    try {
      const loaded = await loadCashfreeScript()
      if (!loaded) {
        alert('Cashfree failed to load. Check your internet connection.')
        setLoading(false)
        return
      }

      // 1. Create the Cashfree order server-side → payment_session_id.
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
      if (!data.success || !data.paymentSessionId) {
        alert(data.error || 'Failed to create order')
        setLoading(false)
        return
      }

      const cashfreeOrderId: string = data.orderId

      // 2. Open the hosted checkout modal. The modal resolving is NOT proof of
      //    payment — we confirm the status server-side next.
      await openCashfreeCheckout({
        paymentSessionId: data.paymentSessionId,
        onClose: async () => {
          // 3. Confirm the order status with our server (which asks Cashfree).
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cashfree_order_id: cashfreeOrderId }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            onPaymentSuccess({ cashfree_order_id: cashfreeOrderId })
          } else {
            onPaymentError?.(verifyData.error || 'Payment not completed')
          }
          setLoading(false)
        },
        onError: err => {
          onPaymentError?.(err)
          setLoading(false)
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
          ⚠️ Mock payment mode — no real charge. A real order is still saved to the DB.
        </p>
      )}
    </div>
  )
}
