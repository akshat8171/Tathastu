'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { detectIdentifier } from '@/lib/auth/identifier'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'
import { Spinner } from '@/components/ui/spinner'

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

/**
 * Unified login form:
 * - Email + password  → Supabase signInWithPassword
 * - Phone number      → renders PhoneOtpForm (Firebase OTP flow)
 *
 * Live identifier detection routes the user to the correct path.
 */
export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  const kind = detectIdentifier(identifier)
  // Show password field when the identifier looks like an email
  const showPassword = identifier.includes('@') || kind === 'email'

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (kind !== 'email') {
      setError("Use 'Login with OTP' for phone numbers.")
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
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

  function handleOtpLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (kind === 'email') {
      setError("Use 'Login with Password' for email addresses.")
      return
    }
    if (kind === 'unknown') {
      setError('Enter a valid email or 10-digit mobile number.')
      return
    }
    // kind === 'phone' — switch to PhoneOtpForm
    setShowOtp(true)
  }

  // Once the user chose "Login with OTP" and has a valid phone, hand off to
  // the dedicated PhoneOtpForm (which manages its own Firebase flow).
  if (showOtp) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        <button
          type="button"
          onClick={() => { setShowOtp(false); setError('') }}
          className="text-sm text-muted hover:text-brand transition-colors font-sans"
        >
          ← Back
        </button>
        <PhoneOtpForm initialPhone={identifier.replace(/\D/g, '')} />
      </div>
    )
  }

  return (
    <form onSubmit={handlePasswordLogin} className="w-full max-w-sm mx-auto space-y-4">
      {/* Single identifier field */}
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-ink mb-2 font-sans">
          Email or Mobile Number
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={e => { setIdentifier(e.target.value); setError('') }}
          placeholder="you@email.com or 9876543210"
          autoComplete="username"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
        />
      </div>

      {/* Password field — shown for email path */}
      {showPassword && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-2 font-sans">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-sans">{error}</p>}

      {/* Primary action row */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          onClick={handlePasswordLogin}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Signing in…</span>
            </>
          ) : (
            'Login with Password'
          )}
        </button>

        <button
          type="button"
          onClick={handleOtpLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-brand text-brand bg-transparent hover:bg-brand/5 transition-colors font-sans font-medium text-sm disabled:opacity-50"
        >
          Login with OTP
        </button>
      </div>
    </form>
  )
}
