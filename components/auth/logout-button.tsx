'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium transition-colors">
      Sign Out
    </button>
  )
}
