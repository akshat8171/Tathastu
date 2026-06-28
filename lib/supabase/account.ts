import 'server-only'
import { supabaseAdmin } from './admin'
import type { Order } from './client'

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
  address_type: AddressType
  is_default?: boolean
  created_at?: string
  updated_at?: string
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
  if (opts.email) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_email', opts.email)
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

// ── Addresses ─────────────────────────────────────────────────────────────

export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
  if (error) {
    console.error('getAddresses error:', error)
    return []
  }
  return (data ?? []) as Address[]
}

/**
 * Upsert the caller's billing OR shipping address (one slot each, keyed by
 * (user_id, address_type)). Never throws; returns null on error.
 */
export async function upsertAddress(
  userId: string,
  type: AddressType,
  input: {
    name: string
    phone: string
    address_line: string
    city: string
    state: string
    pincode: string
  }
): Promise<Address | null> {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .upsert(
      {
        user_id: userId,
        address_type: type,
        name: input.name,
        phone: input.phone,
        address_line: input.address_line,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,address_type' }
    )
    .select('*')
    .single()
  if (error) {
    console.error('upsertAddress error:', error)
    return null
  }
  return data as Address
}

export async function deleteAddress(userId: string, type: AddressType): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('addresses')
    .delete()
    .eq('user_id', userId)
    .eq('address_type', type)
  if (error) {
    console.error('deleteAddress error:', error)
    return false
  }
  return true
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
