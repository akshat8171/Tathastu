import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getAddresses, upsertAddress, deleteAddress } from '@/lib/supabase/account'
import type { AddressType } from '@/lib/supabase/account'

export const runtime = 'nodejs'

const VALID_TYPES: AddressType[] = ['billing', 'shipping']

function isValidAddressType(v: unknown): v is AddressType {
  return typeof v === 'string' && (VALID_TYPES as string[]).includes(v)
}

// ── GET /api/account/addresses ───────────────────────────────────────────────

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await getAddresses(user.id)
    return NextResponse.json({ addresses })
  } catch (err) {
    console.error('GET /api/account/addresses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/account/addresses ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Validate address_type
    if (!isValidAddressType(body.address_type)) {
      return NextResponse.json(
        { error: 'address_type must be "billing" or "shipping"' },
        { status: 400 }
      )
    }

    // Validate required string fields
    const requiredFields = ['name', 'phone', 'address_line', 'city', 'state', 'pincode'] as const
    for (const field of requiredFields) {
      if (typeof body[field] !== 'string' || !(body[field] as string).trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const address = await upsertAddress(user.id, body.address_type, {
      name: (body.name as string).trim(),
      phone: (body.phone as string).trim(),
      address_line: (body.address_line as string).trim(),
      city: (body.city as string).trim(),
      state: (body.state as string).trim(),
      pincode: (body.pincode as string).trim(),
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Failed to save address. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ address })
  } catch (err) {
    console.error('POST /api/account/addresses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/account/addresses ────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!isValidAddressType(body.address_type)) {
      return NextResponse.json(
        { error: 'address_type must be "billing" or "shipping"' },
        { status: 400 }
      )
    }

    const ok = await deleteAddress(user.id, body.address_type)
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to delete address. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/account/addresses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
