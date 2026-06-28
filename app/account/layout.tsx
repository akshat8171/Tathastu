import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getProfile } from '@/lib/supabase/account'
import { AccountSidebar } from '@/components/account/account-sidebar'

/**
 * Shared shell for the entire /account/* area, modelled on 3dprintshop.in:
 *
 *   ┌─────────────────────────────────────────┐
 *   │  [AG]  Full Name                          │   ← profile header card
 *   │        +91 phone / email                  │
 *   ├──────────────┬────────────────────────────┤
 *   │  Sidebar nav │   {children}  (sub-page)    │
 *   └──────────────┴────────────────────────────┘
 *
 * requireAuth() gates the whole subtree (redirects to /login when signed out),
 * so individual sub-pages can assume an authenticated AppUser.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const profile = await getProfile(user.id)

  // Display name: profile first/last → fall back to phone/email local part.
  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Your Account'

  // Avatar initials from the display name (max 2 chars).
  const initials =
    fullName
      .split(/\s+/)
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A'

  const contactLine = user.phone || user.email || ''

  return (
    <main className="bg-surface min-h-screen py-8 sm:py-12 px-4">
      <div className="container-page max-w-5xl">
        {/* Profile header card */}
        <div className="bg-white rounded-card2 shadow-card p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 font-display font-bold text-xl">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-ink text-2xl sm:text-3xl truncate">{fullName}</h1>
            {contactLine && <p className="font-sans text-muted text-sm mt-0.5 truncate">{contactLine}</p>}
          </div>
        </div>

        {/* Sidebar + content */}
        <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start">
          <AccountSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  )
}
