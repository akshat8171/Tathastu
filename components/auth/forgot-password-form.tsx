'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'

/**
 * Step 1 of password reset: request the email.
 *
 * `resetPasswordForEmail` sends a recovery link that points at our
 * `/auth/callback` route. That route exchanges the code for a (recovery)
 * session and forwards the user to `/reset-password`, where step 2 runs.
 *
 * Supabase intentionally returns success even for unknown addresses to avoid
 * account enumeration, so on success we always show the neutral "check your
 * inbox" state.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)

    if (authError) {
      setError(authError.message || 'Could not send the reset email. Please try again.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-ink text-lg">Check your inbox</h2>
        <p className="font-sans text-muted text-sm">
          If an account exists for{' '}
          <span className="font-medium text-ink">{email.trim().toLowerCase()}</span>, we&apos;ve
          sent a link to reset your password.
        </p>
        <Link href="/login" className="btn-primary inline-block">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-2 font-sans">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-sans">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Sending…</span>
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-sans">
        Remembered it?{' '}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
