import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getAddresses } from '@/lib/supabase/account'
import { AddressManager } from '@/components/account/address-manager'

/**
 * /account/addresses — Server component.
 *
 * Renders inside the shared AccountLayout (header card + sidebar already present).
 * This component outputs only the right-hand content panel.
 *
 * Model: exactly TWO address slots per user — Billing and Shipping.
 * Each slot is either filled or empty; upsertAddress enforces the
 * (user_id, address_type) unique constraint so there's never more than one.
 */
export default async function AddressesPage() {
  const user = await requireAuth()
  const addresses = await getAddresses(user.id)

  const billing = addresses.find(a => a.address_type === 'billing')
  const shipping = addresses.find(a => a.address_type === 'shipping')

  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div className="bg-white rounded-card2 shadow-card p-6">
        <h2 className="font-display font-semibold text-ink text-xl">Addresses</h2>
        <p className="font-sans text-muted text-sm mt-1">
          Manage the billing and shipping addresses used at checkout.
        </p>
      </div>

      {/* Address slot cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <AddressManager
          type="billing"
          label="Billing Address"
          initial={billing}
        />
        <AddressManager
          type="shipping"
          label="Shipping Address"
          initial={shipping}
        />
      </div>
    </div>
  )
}
