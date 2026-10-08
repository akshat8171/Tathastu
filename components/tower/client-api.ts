'use client'

import { useEffect, useState } from 'react'
import type { PublicBoard } from '@/lib/tower/types'

export const TOKEN_HEADER = 'x-tower-token'

export type ApiReply<T> = { ok: true; data: T } | { ok: false; error: string; status: number }

/** fetch with a timeout that never throws — exhibition Wi-Fi is flaky, the UI must not crash on it. */
export async function callApi<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; token?: string | null; timeoutMs?: number } = {}
): Promise<ApiReply<T>> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000)
  try {
    const headers: Record<string, string> = {}
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    if (options.token) headers[TOKEN_HEADER] = options.token
    const response = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
      signal: controller.signal,
    })
    const json = (await response.json().catch(() => ({}))) as T & { error?: string }
    if (!response.ok) {
      return { ok: false, error: json.error || 'Something went wrong. Try again.', status: response.status }
    }
    return { ok: true, data: json }
  } catch {
    return { ok: false, error: 'No connection. Check the Wi-Fi and try again.', status: 0 }
  } finally {
    window.clearTimeout(timer)
  }
}

/** Retries network failures and 5xx with backoff. 4xx answers are final. */
export async function callApiWithRetry<T>(
  path: string,
  options: Parameters<typeof callApi>[1],
  tries = 5
): Promise<ApiReply<T>> {
  let last: ApiReply<T> = { ok: false, error: 'No connection.', status: 0 }
  for (let attempt = 0; attempt < tries; attempt += 1) {
    last = await callApi<T>(path, options)
    if (last.ok || (last.status >= 400 && last.status < 500)) return last
    await new Promise((resolve) => window.setTimeout(resolve, Math.min(8_000, 700 * 2 ** attempt)))
  }
  return last
}

/** Polls the public leaderboard. Pauses while the tab is hidden. */
export function useBoard(intervalMs: number, enabled = true): { board: PublicBoard | null; error: string } {
  const [board, setBoard] = useState<PublicBoard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let timer = 0
    let inFlight = false
    const pull = async () => {
      if (inFlight || document.visibilityState === 'hidden') return
      inFlight = true
      const reply = await callApi<{ board: PublicBoard }>('/api/tower/board', { timeoutMs: 8_000 })
      inFlight = false
      if (cancelled) return
      if (reply.ok) {
        setBoard(reply.data.board)
        setError('')
      } else {
        setError(reply.error)
      }
    }
    void pull()
    timer = window.setInterval(() => void pull(), intervalMs)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pull()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs, enabled])

  return { board, error }
}

/** Keeps the screen awake (game in progress, or the stall monitor). Silently does nothing if unsupported. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    type Sentinel = { release: () => Promise<void> }
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<Sentinel> } }
    if (!nav.wakeLock) return
    let sentinel: Sentinel | null = null
    let cancelled = false
    const acquire = () => {
      nav.wakeLock
        ?.request('screen')
        .then((lock) => {
          if (cancelled) void lock.release().catch(() => undefined)
          else sentinel = lock
        })
        .catch(() => undefined)
    }
    acquire()
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release().catch(() => undefined)
    }
  }, [active])
}

export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Private mode / full storage — the game still works, it just cannot resume.
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
