import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/supabase/account'

export const runtime = 'nodejs'

// ── GET /api/account/wishlist ────────────────────────────────────────────────
// Returns { productIds: string[] } — the wishlist context reads data.productIds.

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const productIds = await getWishlist(user.id)
    return NextResponse.json({ productIds })
  } catch (err) {
    console.error('GET /api/account/wishlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/account/wishlist ───────────────────────────────────────────────
// Body: { productId: string }
// Adds (idempotent) and returns { ok: true }.

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    let body: { productId?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body.productId || typeof body.productId !== 'string') {
      return NextResponse.json({ error: 'productId is required and must be a string' }, { status: 400 })
    }

    const ok = await addToWishlist(user.id, body.productId)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/account/wishlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/account/wishlist ─────────────────────────────────────────────
// Body: { productId: string }
// Removes and returns { ok: true }.

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    let body: { productId?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body.productId || typeof body.productId !== 'string') {
      return NextResponse.json({ error: 'productId is required and must be a string' }, { status: 400 })
    }

    const ok = await removeFromWishlist(user.id, body.productId)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/account/wishlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
