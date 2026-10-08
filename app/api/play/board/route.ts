import { NextResponse } from 'next/server'
import { DRAW_SLOTS } from '@/lib/play/constants'
import { loadBoard } from '@/lib/play/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const board = await loadBoard()
  return NextResponse.json({ ...board, slots: DRAW_SLOTS })
}
