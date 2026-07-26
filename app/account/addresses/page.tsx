import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getAddresses, backfillAddressesFromOrders } from '@/lib/supabase/account'
import { AddressBook } from '@/components/account/address-book'

/**
 * /account/addresses — Server component.
 *
 * Renders inside the shared AccountLayout (header card + sidebar already present).
 *
 * Model: a multi-entry address book (migration-009). Each order's delivery
 * address is saved here automatically; users can add/edit/remove and pick a
 * default. First load after signing in backfills the book from the user's most
 * recent order, so a guest who checked out then created an account still finds
 * their address here.
 */
export default async function AddressesPage() {
  const user = await requireAuth()

  // Lazy, idempotent backfill: only runs when the book is empty (see helper).
  await backfillAddressesFromOrders({ id: user.id, phone: user.phone, email: user.email })

  const addresses = await getAddresses(user.id)

  return <AddressBook initial={addresses} />
}
