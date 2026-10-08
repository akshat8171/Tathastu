import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Server time, never cached. Phones and the big screen use it to count down together. */
export async function GET() {
  return NextResponse.json({ serverNow: Date.now() }, { headers: { 'Cache-Control': 'no-store' } })
}
