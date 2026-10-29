import { NextRequest, NextResponse } from 'next/server'
import { submitIndexNow } from '@/lib/indexnow'

/**
 * POST /api/indexnow
 * Body: { urls: string[] } — absolute or path URLs to submit via IndexNow.
 * Optional header x-indexnow-secret must match INDEXNOW_SUBMIT_SECRET when set.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET
  if (secret) {
    const provided = request.headers.get('x-indexnow-secret')
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let urls: string[] = []
  try {
    const body = await request.json()
    urls = Array.isArray(body?.urls) ? body.urls.map(String) : []
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const absolute = urls.map((u) =>
    u.startsWith('http') ? u : `https://www.tathastukeepsakes.in${u.startsWith('/') ? u : `/${u}`}`
  )

  const result = await submitIndexNow(absolute)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
