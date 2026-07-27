'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    setError('')
    setBusy(true)

    // Clear the Supabase session two independent ways and require AT LEAST ONE
    // to succeed before we tell the user they're signed out:
    //   1. Server route deletes the cookies via Set-Cookie (works even if
    //      client JS is blocked).
    //   2. Client signOut clears the browser client's cookies + in-memory
    //      session (cookies are non-httpOnly, so this is effective too).
    let serverOk = false
    try {
      const res = await fetch('/auth/signout', { method: 'POST' })
      serverOk = res.ok
    } catch { /* handled via clientOk below */ }

    let clientOk = false
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
      clientOk = !signOutError
    } catch { /* handled below */ }

    // Fail loud: if BOTH sign-out paths failed the Supabase session may still be
    // live — do NOT navigate away pretending we logged out.
    if (!serverOk && !clientOk) {
      setBusy(false)
      setError('Could not sign you out. Please check your connection and try again.')
      return
    }

    // Firebase (phone OTP) cleanup — best-effort; a phone session failing here
    // doesn't invalidate the confirmed Supabase sign-out above.
    try {
      await firebaseSignOut(getFirebaseAuth())
    } catch { /* ignore */ }
    try {
      await fetch('/api/auth/firebase-session', { method: 'DELETE' })
    } catch { /* ignore */ }

    router.push('/')
    router.refresh()
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={busy}
        className="text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
      >
        {busy ? 'Signing out…' : 'Sign Out'}
      </button>
      {error && (
        <p role="alert" className="text-red-500 text-xs font-sans mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
