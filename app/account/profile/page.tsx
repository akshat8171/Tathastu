import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getProfile } from '@/lib/supabase/account'
import { ProfileForm } from '@/components/account/profile-form'

/**
 * /account/profile — Server component.
 *
 * Renders inside the shared AccountLayout (header card + sidebar already present).
 * This component outputs only the right-hand content panel.
 */
export default async function ProfilePage() {
  const user = await requireAuth()
  const profile = await getProfile(user.id)

  // Derive initial email: prefer stored profile email, then fall back to
  // the Supabase session email (email-password users). Phone-only Firebase
  // users get an empty string so the field is still editable.
  const initialEmail =
    profile?.email ??
    (user.provider === 'supabase' ? (user.email ?? '') : '')

  return (
    <div className="bg-white rounded-card2 shadow-card p-6">
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="font-display font-semibold text-ink text-xl">Profile</h2>
        <p className="font-sans text-muted text-sm mt-1">
          Your name appears on orders and invoices.
        </p>
      </div>

      <ProfileForm
        initialFirstName={profile?.first_name ?? undefined}
        initialLastName={profile?.last_name ?? undefined}
        initialEmail={initialEmail}
        mobile={user.phone ?? undefined}
      />
    </div>
  )
}
