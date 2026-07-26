import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import {
  getAddresses,
  createAddress,
  updateAddressById,
  deleteAddressById,
  setDefaultAddress,
} from '@/lib/supabase/account'
import type { AddressInput } from '@/lib/supabase/account'

export const runtime = 'nodejs'

const REQUIRED_FIELDS = ['name', 'phone', 'address_line', 'city', 'state', 'pincode'] as const

/**
 * Validate + normalize the six address fields from a request body.
 * Returns the trimmed input, or an error message describing the first problem.
 */
function parseAddressInput(
  body: Record<string, unknown>
): { input: AddressInput } | { error: string } {
  for (const field of REQUIRED_FIELDS) {
    if (typeof body[field] !== 'string' || !(body[field] as string).trim()) {
      return { error: `${field} is required` }
    }
  }
  return {
    input: {
      name: (body.name as string).trim(),
      phone: (body.phone as string).trim(),
      address_line: (body.address_line as string).trim(),
      city: (body.city as string).trim(),
      state: (body.state as string).trim(),
      pincode: (body.pincode as string).trim(),
    },
  }
}

async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

// ── GET /api/account/addresses — list all saved addresses ────────────────────

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

// ── POST /api/account/addresses — create (no id) or update (with id) ──────────

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJson(req)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = parseAddressInput(body)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    // Presence of `id` distinguishes an edit from a new address.
    const addressId = typeof body.id === 'string' ? body.id : null
    const address = addressId
      ? await updateAddressById(user.id, addressId, parsed.input)
      : await createAddress(user.id, parsed.input)

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

// ── PATCH /api/account/addresses — set an address as default ──────────────────

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJson(req)
    if (!body || typeof body.id !== 'string' || !body.id.trim()) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const ok = await setDefaultAddress(user.id, body.id)
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to set default. Please try again.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/account/addresses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/account/addresses — remove an address by id ───────────────────

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJson(req)
    if (!body || typeof body.id !== 'string' || !body.id.trim()) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const ok = await deleteAddressById(user.id, body.id)
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
