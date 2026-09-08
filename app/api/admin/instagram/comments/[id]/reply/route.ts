import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { graphPost } from '@/lib/instagram/graph'
import { INSTAGRAM_MAX_REPLY_LENGTH } from '@/lib/instagram/constants'
import { validateReplyMessage } from '@/lib/instagram/oauth'
import { getUsableAccessToken } from '@/lib/instagram/tokens'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

const bodySchema = z.object({
  message: z.string(),
})

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing comment id' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Reply must be JSON { message }' }, { status: 400 })
  }

  const reply = validateReplyMessage(parsed.data.message)
  if (!reply.ok) {
    return NextResponse.json({ error: reply.error }, { status: 400 })
  }
  if (reply.message.length > INSTAGRAM_MAX_REPLY_LENGTH) {
    return NextResponse.json({ error: 'Reply is too long' }, { status: 400 })
  }

  const token = await getUsableAccessToken()
  if (!token.ok) {
    return NextResponse.json({ error: token.error }, { status: 409 })
  }

  try {
    await graphPost(`${id}/replies`, token.connection.accessToken, {
      message: reply.message,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not post reply'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
