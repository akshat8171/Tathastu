'use client'

import { useState } from 'react'

interface ProfileFormProps {
  initialFirstName?: string
  initialLastName?: string
  initialEmail?: string
  /** The sign-in phone number — read-only. Undefined for email-only users. */
  mobile?: string
}

/**
 * Client-side profile edit form.
 *
 * Fields:
 *   - First name + Last name (side-by-side on sm+)
 *   - Email (editable, with helper text)
 *   - Mobile (read-only/disabled, shows lock icon, always visible)
 *
 * On submit POSTs to /api/account/profile with { first_name, last_name, email }.
 */
export function ProfileForm({
  initialFirstName = '',
  initialLastName = '',
  initialEmail = '',
  mobile,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(initialEmail)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          (body as { error?: string }).error ||
            'Something went wrong. Please try again.'
        )
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* First name + Last name — side by side on sm+ */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-2">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => { setFirstName(e.target.value); setSuccess(false) }}
            placeholder="First name"
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-ink mb-2">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={e => { setLastName(e.target.value); setSuccess(false) }}
            placeholder="Last name"
            autoComplete="family-name"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setSuccess(false) }}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
        />
        <p className="text-xs text-muted mt-1 font-sans">
          Used for order receipts and tracking. Optional, but recommended.
        </p>
      </div>

      {/* Mobile — always read-only */}
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-ink mb-2">
          Mobile number
        </label>
        <div className="relative">
          <input
            id="mobile"
            type="tel"
            value={mobile ?? ''}
            placeholder="—"
            disabled
            readOnly
            className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-ink placeholder-muted/60 font-sans opacity-60 cursor-not-allowed"
          />
          {/* Lock icon */}
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted opacity-60"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </span>
        </div>
        <p className="text-xs text-muted mt-1 font-sans">
          This is your sign-in number and can&apos;t be changed here.
        </p>
      </div>

      {/* Inline status messages */}
      {error && <p className="text-red-500 text-sm font-sans">{error}</p>}
      {success && <p className="text-green-600 text-sm font-sans">Saved</p>}

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
