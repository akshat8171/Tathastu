import { NextRequest, NextResponse } from 'next/server'
import { InstagramGraphError } from '@/lib/instagram/graph'
import { getInstagramAppConfig } from '@/lib/instagram/config'
import { FollowCheckError, readFollowStatus } from '@/lib/play/follow-check'
import { markPassRejected, markPassVerified } from '@/lib/play/repository'
import { isValidMetaSignature, readPlayMessages } from '@/lib/play/webhook'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NOT_FOLLOWING = 'This Instagram account does not follow @tathastukeepsakes. Follow, then send PLAY again.'

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')
  const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN?.trim()
  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const config = getInstagramAppConfig()
  if (!config) return NextResponse.json({ error: 'Instagram app is not configured' }, { status: 503 })

  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  if (!isValidMetaSignature(rawBody, signature, config.appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    for (const message of readPlayMessages(payload)) {
      if (!message.ticket || !message.senderId) continue
      const profile = await readFollowStatus(message.senderId)
      if (!profile.follows) {
        await markPassRejected({
          ticket: message.ticket,
          igScopedId: message.senderId,
          username: profile.username,
          reason: NOT_FOLLOWING,
        })
        continue
      }
      await markPassVerified({
        ticket: message.ticket,
        igScopedId: message.senderId,
        username: profile.username,
      })
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof InstagramGraphError || error instanceof FollowCheckError) {
      return NextResponse.json({ error: 'Follow check unavailable' }, { status: 500 })
    }
    console.error('Instagram play webhook failed', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
