'use client'

import { supabase } from '@/lib/supabase/client'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    // 1. Sign out of Supabase (email/password sessions).
    await supabase.auth.signOut().catch(() => { /* ignore */ })

    // 2. Sign out of Firebase (phone OTP sessions). Auth resolved lazily
    //    (browser-only) so this module never boots Firebase during prerender.
    try {
      await firebaseSignOut(getFirebaseAuth())
    } catch { /* ignore */ }

    // 3. Clear the httpOnly Firebase session cookie set by
    //    POST /api/auth/firebase-session.
    try {
      await fetch('/api/auth/firebase-session', { method: 'DELETE' })
    } catch { /* ignore */ }

    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium transition-colors">
      Sign Out
    </button>
  )
}
