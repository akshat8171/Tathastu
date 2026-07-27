'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'

const MIN_PASSWORD_LENGTH = 6

/**
 * Step 2 of password reset: set the new password.
 *
 * By the time the user reaches this page, the recovery link has already been
 * exchanged for a session in `/auth/callback`, so `updateUser({ password })`
 * applies to the correct account. We gate on the presence of that session:
 * landing here without one (link expired, opened directly) shows a recovery
 * prompt instead of a dead form.
 */
export function ResetPasswordForm() {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const router = useRouter()

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setHasSession(Boolean(data.session))
      setChecking(false)
    })
    return () => { mounted = false }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (authError) {
      setError(authError.message || 'Could not update your password. Please try again.')
      return
    }

    setDone(true)
  }

  // ── Verifying the recovery session ────────────────────────────────────────
  if (checking) {
    return (
      <div className="w-full max-w-sm mx-auto flex justify-center py-8">
        <Spinner size="lg" className="text-brand" label="Verifying reset link" />
      </div>
    )
  }

  // ── No session → link invalid/expired ─────────────────────────────────────
  if (!hasSession) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-ink text-lg">Reset link expired</h2>
        <p className="font-sans text-muted text-sm">
          This password-reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request a new link
        </Link>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 text-green-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-ink text-lg">Password updated</h2>
        <p className="font-sans text-muted text-sm">
          Your password has been changed. You&apos;re all set.
        </p>
        <button
          type="button"
          onClick={() => { router.push('/account'); router.refresh() }}
          className="btn-primary inline-block"
        >
          Go to my account
        </button>
      </div>
    )
  }

  // ── The form ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink mb-2 font-sans">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-ink mb-2 font-sans">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setError('') }}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
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
            <span>Updating…</span>
          </>
        ) : (
          'Update password'
        )}
      </button>
    </form>
  )
}
