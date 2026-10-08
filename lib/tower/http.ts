import { NextResponse, type NextRequest } from 'next/server'
import type { ApiResult } from '@/lib/tower/types'

export const TOKEN_HEADER = 'x-tower-token'

export function tokenFrom(request: NextRequest): string {
  return request.headers.get(TOKEN_HEADER)?.trim() ?? ''
}

/** Turns a service result into JSON. Never cached — the stall screen and phones poll this. */
export function respond<T extends object>(result: ApiResult<T>): NextResponse {
  const headers = { 'Cache-Control': 'no-store' }
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status ?? 500, headers })
  const { ok: _ok, ...body } = result as { ok: true } & T
  return NextResponse.json(body, { headers })
}

export async function readJson(request: NextRequest): Promise<unknown> {
  return request.json().catch(() => null)
}

/**
 * Runs a service call and converts any unexpected throw (missing env, Supabase outage)
 * into a JSON 503. Clients treat 5xx as retryable, so a blip never strands a player.
 */
export async function guard<T extends object>(work: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  try {
    return await work()
  } catch (error) {
    console.error('[tower]', error)
    return { ok: false, error: 'The game server is busy. Try again in a moment.', status: 503 }
  }
}
