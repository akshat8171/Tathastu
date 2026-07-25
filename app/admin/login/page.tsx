'use client'

import { useEffect } from 'react'
import { Lock } from 'lucide-react'

/**
 * Admin login is now the SAME phone-OTP sign-in the rest of the site uses.
 *
 * The previous implementation "authenticated" admins by comparing a typed phone
 * number to a hardcoded constant on the CLIENT and storing the result in
 * localStorage('admin_phone') — trivially forgeable, and it protected nothing
 * because the /api/admin/* routes had no server check. That gate is gone.
 *
 * Authorization now lives server-side: sign in through the real /login flow
 * (Firebase phone OTP → httpOnly session cookie), and lib/auth/admin.ts checks
 * the cryptographically-verified phone against the admin allowlist on every
 * admin API call. This page just forwards to that real flow.
 */
export default function AdminLoginRedirectPage() {
  useEffect(() => {
    // Clean up any stale forged marker from the old scheme.
    try {
      localStorage.removeItem('admin_phone')
    } catch {
      /* ignore */
    }
    window.location.replace('/login?next=/admin')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <Lock className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Redirecting to secure sign-in…</h1>
        <p className="text-brand-100 mt-2">
          Admin access uses your verified phone sign-in.{' '}
          <a href="/login?next=/admin" className="underline font-medium">
            Continue
          </a>
        </p>
      </div>
    </div>
  )
}
