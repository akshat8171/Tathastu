'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      setStatus('failed')
      return
    }

    // Verify payment status
    async function verifyPayment() {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        })

        const data = await response.json()

        if (data.success && data.orderStatus === 'PAID') {
          setStatus('success')
          setOrderDetails(data)
        } else {
          setStatus('failed')
          setOrderDetails(data)
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('failed')
      }
    }

    verifyPayment()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#8B7B6C] mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h2 className="text-xl font-semibold text-zinc-800">Verifying Payment...</h2>
          <p className="text-zinc-600 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-center text-zinc-800 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-center text-zinc-600 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-zinc-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Order ID:</span>
                <span className="font-mono text-zinc-800">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Amount Paid:</span>
                <span className="font-semibold text-zinc-800">₹{orderDetails.orderAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Payment Method:</span>
                <span className="text-zinc-800">UPI</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Status:</span>
                <span className="text-green-600 font-semibold">PAID</span>
              </div>
            </div>
          )}

          {/* Email Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Order confirmation sent!</p>
                <p className="text-xs text-blue-700 mt-1">
                  Check your email for order details and tracking information.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#8B7B6C] hover:bg-[#7a6b5d] text-white text-center py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="block w-full border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 text-center py-3 rounded-lg font-semibold transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-center text-zinc-800 mb-2">
          Payment Failed
        </h1>
        <p className="text-center text-zinc-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again.
        </p>

        {/* Order Details */}
        {orderDetails && orderDetails.orderId && (
          <div className="bg-zinc-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Order ID:</span>
              <span className="font-mono text-zinc-800">{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Status:</span>
              <span className="text-red-600 font-semibold">{orderDetails.orderStatus || 'FAILED'}</span>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-900">Need Help?</p>
              <p className="text-xs text-yellow-700 mt-1">
                If money was deducted, it will be refunded within 5-7 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-[#8B7B6C] hover:bg-[#7a6b5d] text-white text-center py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 text-center py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
