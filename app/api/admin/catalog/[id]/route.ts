import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  deleteCatalogProduct,
  getAdminCatalogProduct,
  upsertCatalogProduct,
} from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const product = await getAdminCatalogProduct(id)
  if (!product) {
    return NextResponse.json({ error: 'SKU not found' }, { status: 404 })
  }
  return NextResponse.json({ product })
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    const body = await request.json()
    const published = body.published !== false
    const payload = { ...(body.product ?? body), id }
    const result = await upsertCatalogProduct(payload, published)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ ok: true, product: result.product, published })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const result = await deleteCatalogProduct(id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 })
  }
  return NextResponse.json({ ok: true })
}
