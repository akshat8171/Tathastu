import 'server-only'
import { supabaseAdmin } from './admin'
import type { Order } from './client'

/**
 * Escape LIKE/ILIKE metacharacters (`\`, `%`, `_`) so a value is matched
 * literally. Use whenever user/session-derived text is passed to `.ilike()` for
 * an intended exact, case-insensitive comparison.
 */
export function escapeLike(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1')
}

/**
 * Account-area data access layer.
 *
 * SERVER-SIDE ONLY. Every function runs on the service-role client
 * (supabaseAdmin, RLS-bypassing) and scopes rows by the unified AppUser.id
 * passed in by the caller. Callers MUST resolve the current user via
 * getCurrentUser() (lib/auth/session.ts) and pass user.id — never trust a
 * client-supplied id.
 *
 * Requires migration-005-account.sql (profiles, wishlist_items, addresses
 * with TEXT user_id + address_type).
 *
 * NEVER import this module from a Client Component — supabaseAdmin is
 * `server-only` and carries the service-role key. Client components talk to
 * the /api/account/* routes instead.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  created_at?: string
  updated_at?: string
}

export type AddressType = 'billing' | 'shipping'

export interface Address {
  id: string
  user_id: string
  name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
  // Kept for backward-compat with older billing/shipping rows. New addresses
  // default to 'shipping'; the address book no longer enforces one-per-type.
  address_type?: AddressType | null
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

/** The six user-supplied fields that define a delivery address. */
export interface AddressInput {
  name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string // catalog slug
  created_at?: string
}

// ── Orders (provider-agnostic) ──────────────────────────────────────────────

/**
 * Fetch a user's orders regardless of auth provider.
 *
 * - Phone (Firebase) users have NO email, so we resolve their customers.id by
 *   the E.164 phone and match orders.customer_id.
 * - Email (Supabase) users match orders.customer_email.
 *
 * Pass whatever the unified session exposes; either or both may be undefined.
 * Returns newest-first, de-duplicated by order id.
 */
export async function getOrdersForUser(opts: {
  phone?: string | null // E.164, e.g. +91XXXXXXXXXX
  email?: string | null
}): Promise<Order[]> {
  const byId: Map<string, Order> = new Map()

  // 1) Phone path → customers.id → orders.customer_id
  if (opts.phone) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', opts.phone)
      .maybeSingle()

    if (customer?.id) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
      if (error) console.error('getOrdersForUser (phone) error:', error)
      for (const o of (data ?? []) as Order[]) byId.set(o.id, o)
    }
  }

  // 2) Email path → orders.customer_email
  //
  // Match case-insensitively so a customer who signs up as `Rahul@Example.com`
  // still sees a legacy order placed as `rahul@example.com`. We use `ilike`, but
  // the email VALUE can itself contain LIKE metacharacters — `_` matches any
  // single char and `%` any substring — so we escape them to force an exact
  // (case-insensitive) comparison. Without this, `john_doe@x.com` would also
  // match `johnadoe@x.com`, leaking another customer's orders.
  if (opts.email) {
    const email = escapeLike(opts.email.trim().toLowerCase())
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .ilike('customer_email', email)
      .order('created_at', { ascending: false })
    if (error) console.error('getOrdersForUser (email) error:', error)
    for (const o of (data ?? []) as Order[]) byId.set(o.id, o)
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// ── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('getProfile error:', error)
    return null
  }
  return (data as Profile) ?? null
}

/**
 * Create-or-update the caller's profile. Never throws; returns null on error.
 */
export async function upsertProfile(
  userId: string,
  input: { first_name?: string; last_name?: string; email?: string }
): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        first_name: input.first_name ?? null,
        last_name: input.last_name ?? null,
        email: input.email || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()
  if (error) {
    console.error('upsertProfile error:', error)
    return null
  }
  return data as Profile
}

// ── Addresses (multi-address book) ─────────────────────────────────────────
//
// A user keeps as many saved addresses as they like (migration-009 dropped the
// one-per-type constraint). CRUD is id-based; the default address (if any) is
// surfaced first and pre-selected at checkout.

/** Default address first, then most-recently-updated. */
export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('getAddresses error:', error)
    return []
  }
  return (data ?? []) as Address[]
}

/**
 * Insert a new saved address for the user. The first address a user ever saves
 * is marked default automatically. Never throws; returns null on error.
 */
export async function createAddress(
  userId: string,
  input: AddressInput,
  opts: { makeDefault?: boolean } = {}
): Promise<Address | null> {
  const existing = await getAddresses(userId)
  const makeDefault = opts.makeDefault || existing.length === 0

  // Keep the single-default invariant: clear the flag on siblings first.
  if (makeDefault && existing.length > 0) {
    await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
  }

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert({
      user_id: userId,
      address_type: 'shipping',
      is_default: makeDefault,
      name: input.name,
      phone: input.phone,
      address_line: input.address_line,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    })
    .select('*')
    .single()
  if (error) {
    console.error('createAddress error:', error)
    return null
  }
  return data as Address
}

/** Update one of the user's addresses by id. Never throws; null on error. */
export async function updateAddressById(
  userId: string,
  addressId: string,
  input: AddressInput
): Promise<Address | null> {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .update({
      name: input.name,
      phone: input.phone,
      address_line: input.address_line,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', addressId)
    .select('*')
    .single()
  if (error) {
    console.error('updateAddressById error:', error)
    return null
  }
  return data as Address
}

/** Delete one of the user's addresses by id. Never throws; false on error. */
export async function deleteAddressById(userId: string, addressId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('addresses')
    .delete()
    .eq('user_id', userId)
    .eq('id', addressId)
  if (error) {
    console.error('deleteAddressById error:', error)
    return false
  }
  return true
}

/** Make one address the user's default, clearing the flag on the rest. */
export async function setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
  // Clear all, then set the chosen one — keeps the one-default invariant even if
  // the partial unique index isn't present on an older DB.
  const { error: clearError } = await supabaseAdmin
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
  if (clearError) {
    console.error('setDefaultAddress (clear) error:', clearError)
    return false
  }
  const { error } = await supabaseAdmin
    .from('addresses')
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('id', addressId)
  if (error) {
    console.error('setDefaultAddress (set) error:', error)
    return false
  }
  return true
}

/**
 * Normalize an address into a comparable key so we don't save the same place
 * twice (e.g. after every order to the same home address).
 *
 * DEDUPE POLICY: two addresses are "the same" when their line + city + state +
 * pincode match, case- and whitespace-insensitively. Name and phone are
 * deliberately EXCLUDED — the same household address is often used with
 * different recipient names/numbers (gifts, family), and we don't want those to
 * create duplicate address-book entries.
 */
function addressFingerprint(input: AddressInput): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  return [input.address_line, input.city, input.state, input.pincode].map(norm).join('|')
}

/**
 * Save a checkout address into the user's address book, skipping exact
 * duplicates. Best-effort: any failure is logged and swallowed so it can never
 * block the order that triggered it.
 */
export async function saveAddressFromOrder(
  userId: string,
  input: AddressInput
): Promise<void> {
  try {
    const existing = await getAddresses(userId)
    const fingerprint = addressFingerprint(input)
    const isDuplicate = existing.some(a => addressFingerprint(a) === fingerprint)
    if (isDuplicate) return
    await createAddress(userId, input)
  } catch (err) {
    console.error('saveAddressFromOrder error:', err)
  }
}

/**
 * Reconstruct a delivery address from a past order.
 *
 * Prefers the structured `shipping_address` JSONB (populated at checkout going
 * forward). Falls back to the migration-008 geography columns + the free-text
 * `notes` line ("Address: <line>, <city>, <state> - <pincode>") for legacy rows.
 * Returns null when there isn't enough to form a usable address.
 */
function extractAddressFromOrder(order: Order): AddressInput | null {
  const sa = order.shipping_address
  if (sa && sa.address_line && sa.city && sa.state && sa.pincode) {
    return {
      name: sa.name || order.customer_name || '',
      phone: sa.phone || order.customer_phone || '',
      address_line: sa.address_line,
      city: sa.city,
      state: sa.state,
      pincode: sa.pincode,
    }
  }

  // Legacy fallback: strip the "Address: " prefix and, if present, the trailing
  // ", <city>, <state> - <pincode>" so address_line doesn't duplicate them.
  const city = order.shipping_city || ''
  const state = order.shipping_state || ''
  const pincode = order.shipping_pincode || ''
  let line = (order.notes || '').replace(/^Address:\s*/i, '').trim()
  if (city && state) {
    line = line.replace(new RegExp(`,?\\s*${city}\\s*,\\s*${state}\\s*-?\\s*${pincode}\\s*$`, 'i'), '').trim()
  }
  if (line && city && state && pincode) {
    return {
      name: order.customer_name || '',
      phone: order.customer_phone || '',
      address_line: line,
      city,
      state,
      pincode,
    }
  }
  return null
}

/**
 * Backfill a newly-signed-in user's empty address book from their most recent
 * order. Runs ONLY when they have zero saved addresses, so it's idempotent and
 * safe to call on every account/checkout read. Matches orders by the same keys
 * the account uses (phone → customers.id, and/or email). Never throws.
 */
export async function backfillAddressesFromOrders(user: {
  id: string
  phone?: string | null
  email?: string | null
}): Promise<void> {
  try {
    const existing = await getAddresses(user.id)
    if (existing.length > 0) return

    const orders = await getOrdersForUser({ phone: user.phone, email: user.email })
    for (const order of orders) {
      const address = extractAddressFromOrder(order)
      if (address) {
        await createAddress(user.id, address, { makeDefault: true })
        return // one is enough — most recent order wins
      }
    }
  } catch (err) {
    console.error('backfillAddressesFromOrders error:', err)
  }
}

// ── Wishlist ─────────────────────────────────────────────────────────────

export async function getWishlist(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getWishlist error:', error)
    return []
  }
  return (data ?? []).map((r: { product_id: string }) => r.product_id)
}

/** Idempotent add (UNIQUE(user_id, product_id) makes a repeat a no-op). */
export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
  if (error) {
    console.error('addToWishlist error:', error)
    return false
  }
  return true
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) {
    console.error('removeFromWishlist error:', error)
    return false
  }
  return true
}
