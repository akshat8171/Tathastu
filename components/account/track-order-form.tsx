'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

/**
 * TrackOrderForm — client component.
 *
 * Renders two inputs (order number + email) and a submit button.
 * On submit, hits POST /api/orders/lookup to verify the number+email pair
 * server-side; on success navigates to /order-confirmation/<orderNumber>.
 * The email field is both collected AND enforced — preventing order-number
 * enumeration by requiring both to match.
 */
export function TrackOrderForm() {
  const router = useRouter()

  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const trimmedOrder = orderNumber.trim()
    const trimmedEmail = email.trim()

    if (!trimmedOrder) {
      setError('Please enter your order number.')
      return
    }
    if (!trimmedEmail) {
      setError('Please enter the email used at checkout.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: trimmedOrder, email: trimmedEmail }),
      })

      const data = await res.json()

      if (res.ok && data.found) {
        router.push(`/order-confirmation/${encodeURIComponent(trimmedOrder)}`)
      } else {
        setError(
          data.message ||
            'No order found with that number and email. Please check your details.'
        )
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
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
            Order number <span className="text-red-500">*</span>
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
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            htmlFor="track-order-email"
            className="block font-sans font-medium text-ink text-sm mb-1.5"
          >
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="track-order-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm"
            aria-required="true"
          />
          <p className="mt-1 text-xs font-sans text-muted">
            Use the email you provided at checkout
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            id="track-order-error"
            role="alert"
            className="mb-4 font-sans text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3"
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner size="xs" className="text-white" label="Looking up order" />
              Looking up…
            </>
          ) : (
            'Track Order'
          )}
        </button>
      </form>
    </div>
  )
}
