'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * TrackOrderForm — client component.
 *
 * Renders two inputs (order number + email) and a submit button.
 * On submit, navigates to /order-confirmation/<orderNumber>; the
 * confirmation page handles the actual DB lookup by order number.
 *
 * The email field is collected for parity with the reference UI but
 * the confirmation page resolves orders by order number alone.
 */
export function TrackOrderForm() {
  const router = useRouter()

  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const trimmedOrder = orderNumber.trim()
    if (!trimmedOrder) {
      setError('Please enter your order number.')
      return
    }

    router.push(`/order-confirmation/${encodeURIComponent(trimmedOrder)}`)
  }

  return (
    <div className="bg-white rounded-card2 shadow-card p-6 sm:p-8 max-w-lg">
      <form onSubmit={handleSubmit} noValidate aria-label="Track order form">
        {/* Order number */}
        <div className="mb-5">
          <label
            htmlFor="track-order-number"
            className="block font-sans font-medium text-ink text-sm mb-1.5"
          >
            Order number
          </label>
          <input
            id="track-order-number"
            type="text"
            autoComplete="off"
            value={orderNumber}
            onChange={e => {
              setOrderNumber(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. ORDER_123…"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm"
            aria-required="true"
            aria-describedby={error ? 'track-order-error' : undefined}
          />
          {error && (
            <p
              id="track-order-error"
              role="alert"
              className="mt-1.5 font-sans text-red-600 text-xs"
            >
              {error}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            htmlFor="track-order-email"
            className="block font-sans font-medium text-ink text-sm mb-1.5"
          >
            Email address
          </label>
          <input
            id="track-order-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm"
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary-full">
          Track Order
        </button>
      </form>
    </div>
  )
}
