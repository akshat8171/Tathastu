import { getCurrentUser, type AppUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

/**
 * Unified auth helpers — delegates to the provider-agnostic session layer.
 *
 * Returns an AppUser that normalizes both Firebase (phone) and Supabase
 * (email-password) sessions so callers don't need to know which backend
 * authenticated the current visitor.
 */

export async function getUser(): Promise<AppUser | null> {
  return getCurrentUser()
}

export async function requireAuth(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
