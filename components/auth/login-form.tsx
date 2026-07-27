'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { GoogleSignInButton } from '@/components/auth/google-button'
import { Spinner } from '@/components/ui/spinner'

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

/**
 * Login form — two paths only:
 *   - Continue with Google  → Supabase OAuth
 *   - Email + password      → Supabase signInWithPassword
 *
 * Phone-OTP sign-in has been retired from the UI (the Firebase code still
 * exists behind the scenes but is no longer surfaced here).
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  // Preserve the post-login destination when the user hops to the sign-up page.
  const nextQuery = next && next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''

  // Surfaced when /auth/callback fails to exchange the OAuth code (e.g. the
  // redirect URL isn't allow-listed in Supabase, or the link expired).
  const oauthError =
    searchParams.get('error') === 'oauth'
      ? 'Google sign-in could not be completed. Please try again.'
      : ''

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter your email.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    })
    setLoading(false)

    if (authError) {
      setError(authError.message || 'Login failed. Please check your credentials.')
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      {oauthError && (
        <p className="text-red-600 text-sm font-sans bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {oauthError}
        </p>
      )}

      {/* Google */}
      <GoogleSignInButton next={next} label="Continue with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-muted font-sans">or sign in with email</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email + password */}
      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-ink font-sans">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-brand hover:underline font-sans">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Your password"
            autoComplete="current-password"
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
              <span>Signing in…</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-sans">
        New to Tathastu?{' '}
        <Link href={`/signup${nextQuery}`} className="text-brand font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
