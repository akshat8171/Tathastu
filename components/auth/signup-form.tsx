'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { GoogleSignInButton } from '@/components/auth/google-button'
import { Spinner } from '@/components/ui/spinner'
import { getPostLoginPath } from '@/lib/auth/post-login-path'

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

const MIN_PASSWORD_LENGTH = 6

/**
 * Sign-up form — mirror of the login form:
 *   - Continue with Google  → Supabase OAuth
 *   - Email + password      → Supabase signUp
 *
 * Depending on the Supabase project's "Confirm email" setting, signUp either
 * returns a live session (auto-confirm on) or sends a confirmation email
 * (auto-confirm off). We branch on the presence of a session to either forward
 * the user straight in or ask them to check their inbox.
 */
export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))
  const nextQuery = next && next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({
      email: trimmed,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)

    if (authError) {
      setError(authError.message || 'Could not create your account. Please try again.')
      return
    }

    // Session present → auto-confirm is on, the user is signed in immediately.
    if (data.session) {
      let isAdmin = false
      try {
        const me = await fetch('/api/admin/me')
        isAdmin = me.ok
      } catch {
        isAdmin = false
      }
      router.push(getPostLoginPath(isAdmin, next))
      router.refresh()
      return
    }

    // No session → a confirmation email was sent.
    setNeedsConfirmation(true)
  }

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-ink text-lg">Check your email</h2>
        <p className="font-sans text-muted text-sm">
          If <span className="font-medium text-ink">{email.trim().toLowerCase()}</span> is a
          new account, we&apos;ve sent a confirmation link — click it to activate your account,
          then sign in.
        </p>
        <p className="font-sans text-muted text-sm">
          Already registered with this email? No new link is sent — just sign in below.
        </p>
        <Link href={`/login${nextQuery}`} className="btn-primary inline-block">
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      {/* Google */}
      <GoogleSignInButton next={next} label="Sign up with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-muted font-sans">or sign up with email</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email + password */}
      <form onSubmit={handleSignup} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-2 font-sans">
            Password
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
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError('') }}
            placeholder="Re-enter your password"
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
              <span>Creating account…</span>
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-sans">
        Already have an account?{' '}
        <Link href={`/login${nextQuery}`} className="text-brand font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
