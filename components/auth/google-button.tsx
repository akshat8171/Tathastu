'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'

/**
 * "Continue with Google" button — shared by the login and sign-up forms.
 *
 * Kicks off Supabase's OAuth flow. `signInWithOAuth` returns a provider URL and
 * redirects the browser to Google; after consent, Google redirects back to
 * `/auth/callback`, which exchanges the code for a session cookie and forwards
 * the user to `next`. Because the browser navigates away on success, we only
 * clear the loading state on error.
 */
export function GoogleSignInButton({
  next = '/account',
  label = 'Continue with Google',
}: {
  next?: string
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    setError('')
    setLoading(true)

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    // On success the browser is already navigating to Google, so we intentionally
    // leave `loading` true. Only a synchronous config/network error lands here.
    if (authError) {
      setError(authError.message || 'Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white text-ink hover:bg-surface transition-colors font-sans font-medium text-sm disabled:opacity-50"
      >
        {loading ? (
          <Spinner size="sm" className="text-brand" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
        )}
        <span>{label}</span>
      </button>
      {error && <p className="text-red-500 text-sm font-sans mt-2">{error}</p>}
    </div>
  )
}
