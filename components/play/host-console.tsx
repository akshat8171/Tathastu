'use client'

import { useEffect, useState } from 'react'
import { DRAW_SLOTS, PLAY_HANDLE } from '@/lib/play/constants'
import type { PublicRound } from '@/lib/play/types'

interface BoardPayload {
  serverNow: number
  verifiedCount: number
  rounds: PublicRound[]
  error?: string
}

export function HostConsole() {
  const [board, setBoard] = useState<BoardPayload | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function pull() {
      const response = await fetch('/api/play/board', { cache: 'no-store' })
      const body = await response.json()
      if (!cancelled) setBoard(body)
    }
    void pull()
    const timer = window.setInterval(() => void pull(), 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  async function announce() {
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/play/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'announce' }),
    })
    const body = await response.json()
    setBusy(false)
    setMessage(response.ok ? `Say ${body.round?.code} now. The monitor is showing it.` : body.error)
  }

  async function resetDraws() {
    if (!window.confirm('Clear all five draw results? Follow passes stay.')) return
    setBusy(true)
    const response = await fetch('/api/play/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    })
    const body = await response.json()
    setBusy(false)
    setMessage(response.ok ? 'Draws cleared.' : body.error)
  }

  const open = board?.rounds.find((round) => round.phase !== 'closed')
  const nextSlot = DRAW_SLOTS[board?.rounds.length ?? 0]

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Layer Rush</h1>
        <p className="text-ink-soft mt-2">
          Laptop stays here. Open the monitor at <a className="text-brand underline" href="/play/screen">/play/screen</a>.
          Phones use <a className="text-brand underline" href="/play">/play</a>.
        </p>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm text-ink-soft">{board?.verifiedCount ?? 0} follows confirmed in the last 8 hours.</p>
        <p className="text-sm text-ink-soft">
          Next planned call: {nextSlot ?? 'All five draws are on the board.'}
        </p>
        {open?.phase === 'entry' && (
          <p className="font-display text-5xl tracking-[0.2em]">{open.code}</p>
        )}
        <button
          type="button"
          disabled={busy || Boolean(open)}
          onClick={() => void announce()}
          className="bg-brand text-white rounded-full px-5 py-3 font-semibold disabled:opacity-50"
        >
          Announce code
        </button>
        {message && <p className="text-sm text-ink">{message}</p>}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="font-semibold">Recorded draws</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(board?.rounds ?? []).map((round) => (
            <li key={round.roundNumber}>
              Draw {round.roundNumber} · {round.phase}
              {round.winner ? ` · @${round.winner.username} · ${round.winner.composite}` : ''}
            </li>
          ))}
          {(board?.rounds.length ?? 0) === 0 && <li className="text-ink-soft">No draws yet.</li>}
        </ul>
        <button type="button" className="mt-4 text-sm underline" onClick={() => void resetDraws()}>
          Reset draws
        </button>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 text-sm text-ink-soft space-y-2">
        <h2 className="font-semibold text-ink">Follow check</h2>
        <p>
          A phone can enter the code only after Instagram’s webhook says that account follows @{PLAY_HANDLE}. Meta
          sends that field only after the person messages the business account.
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Add instagram_business_manage_messages on the Meta app, then reconnect Instagram.</li>
          <li>Set INSTAGRAM_WEBHOOK_VERIFY_TOKEN and subscribe the messages field to /api/instagram/webhook.</li>
          <li>Run supabase/migration-016-play-rounds.sql.</li>
          <li>In Development mode, Meta only delivers messages from Instagram Testers on the app.</li>
        </ol>
      </section>
    </div>
  )
}
