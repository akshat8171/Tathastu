import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getProfile, getAddresses } from '@/lib/supabase/account'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/account/checkout-prefill
 *
 * Returns everything the checkout form needs to pre-populate for a logged-in
 * user: their contact details (from profile + session) and their saved
 * addresses (billing/shipping slots). Guests get 200 with authenticated:false
 * so the checkout can render blank fields without treating it as an error.
 *
 * Phone is sourced from the session (the OTP sign-in number) for Firebase
 * users; the local 10-digit form is returned to match the checkout input.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ authenticated: false, contact: null, addresses: [] })
    }

    const [profile, addresses] = await Promise.all([
      getProfile(user.id),
      getAddresses(user.id),
    ])

    const fullName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || ''

    // Session phone is E.164 (+91XXXXXXXXXX); the checkout phone field expects
    // the bare 10-digit local form.
    const localPhone = user.phone ? user.phone.replace(/^\+91/, '') : ''

    const email = profile?.email || user.email || ''

    return NextResponse.json({
      authenticated: true,
      contact: {
        name: fullName,
        phone: localPhone,
        email,
      },
      addresses: addresses.map(a => ({
        id: a.id,
        address_type: a.address_type,
        name: a.name,
        phone: a.phone,
        address_line: a.address_line,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
      })),
    })
  } catch (error) {
    console.error('checkout-prefill error:', error)
    // Never block checkout on a prefill failure — degrade to guest-blank.
    return NextResponse.json({ authenticated: false, contact: null, addresses: [] })
  }
}
