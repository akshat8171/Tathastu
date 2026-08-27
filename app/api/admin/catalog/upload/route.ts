import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { uploadCatalogImage } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const form = await request.formData()
    const file = form.get('file')
    const productId = String(form.get('productId') ?? '')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Choose a photo to upload' }, { status: 400 })
    }

    const result = await uploadCatalogImage(file, productId || undefined)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ ok: true, url: result.url, path: result.path })
  } catch {
    return NextResponse.json({ error: 'Could not upload the photo' }, { status: 400 })
  }
}
