'use client'

import { useEffect, useRef, useState } from 'react'
import { GAME_MS, PLAY_HANDLE, DROP_WINDOW_MS } from '@/lib/play/constants'
import { activeDropIndex, idealTapMs, type RunFactors } from '@/lib/play/scoring'
import type { PublicRound } from '@/lib/play/types'
import { PrintBed } from '@/components/play/print-bed'
import { playDropTone, unlockPlayAudio } from '@/components/play/play-audio'
import { useElapsed, useNow } from '@/components/play/use-round-clock'

interface PlayerState {
  pass: { status: string; username: string | null; rejectionReason: string | null } | null
  joined: boolean
  round: PublicRound | null
  factors: RunFactors | null
  serverNow: number
}

const TICKET_KEY = 'tathastu-play-ticket'

export function PlayerBooth() {
  const [ticket, setTicket] = useState('')
  const [dmUrl, setDmUrl] = useState('')
  const [state, setState] = useState<PlayerState | null>(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [taps, setTaps] = useState<number[]>([])
  const [factors, setFactors] = useState<RunFactors | null>(null)
  const submitted = useRef(false)

  useEffect(() => {
    const saved = window.sessionStorage.getItem(TICKET_KEY) ?? ''
    if (saved) {
      setTicket(saved)
      setDmUrl(`https://ig.me/m/${PLAY_HANDLE}?ref=${saved}`)
      return
    }
    void fetch('/api/play/ticket', { method: 'POST' })
      .then((response) => response.json())
      .then((body) => {
        if (!body.ticket) throw new Error(body.error || 'Could not open a play pass.')
        window.sessionStorage.setItem(TICKET_KEY, body.ticket)
        setTicket(body.ticket)
        setDmUrl(body.dmUrl)
      })
      .catch((openError: unknown) => {
        setError(openError instanceof Error ? openError.message : 'Could not open a play pass.')
      })
  }, [])

  useEffect(() => {
    if (!ticket) return
    let cancelled = false
    async function pull() {
      const response = await fetch(`/api/play/state?ticket=${ticket}`, { cache: 'no-store' })
      const body = await response.json()
      if (!cancelled && response.ok) setState(body)
    }
    void pull()
    const timer = window.setInterval(() => void pull(), 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [ticket])

  const round = state?.round ?? null
  const now = useNow(state?.serverNow ?? 0)
  const playing = Boolean(state?.joined && (round?.phase === 'live' || round?.phase === 'submitting'))
  const elapsed = useElapsed(round?.startsAt ?? 0, state?.serverNow ?? 0, playing)

  useEffect(() => {
    if (!ticket || !state?.joined || submitted.current) return
    if (round?.phase !== 'submitting') return
    submitted.current = true
    void fetch('/api/play/taps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, tapsMs: taps }),
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.factors) setFactors(body.factors)
        else submitted.current = false
        if (body.error) setError(body.error)
      })
  }, [round?.phase, ticket, taps, state?.joined])

  useEffect(() => {
    submitted.current = false
    setTaps([])
    setFactors(null)
  }, [round?.roundNumber])

  async function joinRound() {
    setError('')
    const response = await fetch('/api/play/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, code }),
    })
    const body = await response.json()
    if (!response.ok) setError(body.error || 'The code was refused.')
  }

  function dropLayer() {
    if (!round || round.phase !== 'live' || round.seed === null) return
    unlockPlayAudio()
    const tap = Math.max(0, Math.min(GAME_MS - 1, Math.round(elapsed)))
    setTaps((current) => {
      const windowStart = activeDropIndex(tap) * DROP_WINDOW_MS
      if (current.some((value) => value >= windowStart && value < windowStart + DROP_WINDOW_MS)) return current
      const last = current[current.length - 1]
      if (last !== undefined && tap <= last) return current
      const perfect = Math.abs(tap - idealTapMs(activeDropIndex(tap))) <= 80
      playDropTone(perfect)
      return [...current, tap]
    })
  }

  const message = ticket ? `PLAY ${ticket}` : ''
  const instagramDm = dmUrl || `https://ig.me/m/${PLAY_HANDLE}`

  return (
    <main className="min-h-dvh bg-ink text-white px-5 py-8">
      <p className="text-brand-200 text-xs font-semibold tracking-[0.18em] uppercase">Layer Rush</p>
      <h1 className="font-display text-4xl mt-2">One code. One winner.</h1>
      {error && <p className="mt-4 text-amber-200">{error}</p>}
      {state?.pass?.status !== 'verified' && (
        <FollowGate
          message={message}
          dmUrl={instagramDm}
          status={state?.pass?.status ?? 'pending'}
          reason={state?.pass?.rejectionReason}
        />
      )}
      {state?.pass?.status === 'verified' && round?.phase === 'entry' && !state.joined && (
        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault()
            void joinRound()
          }}
        >
          <label className="block text-white/70" htmlFor="round-code">
            Code on the monitor
          </label>
          <input
            id="round-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={4}
            autoCapitalize="characters"
            className="mt-3 w-full bg-transparent border border-white/20 rounded-2xl px-4 py-5 text-4xl tracking-[0.3em] text-center"
          />
          <button type="submit" className="mt-4 w-full bg-brand rounded-full py-4 font-semibold">
            Lock in
          </button>
        </form>
      )}
      {state?.pass?.status === 'verified' && state.joined && round?.phase === 'entry' && (
        <p className="mt-10 text-2xl">You are in. Eyes on the monitor.</p>
      )}
      {state?.joined && round?.phase === 'countdown' && (
        <p className="mt-16 font-display text-8xl text-center">{Math.max(1, Math.ceil((round.startsAt - now) / 1000))}</p>
      )}
      {state?.joined && round && (round.phase === 'live' || round.phase === 'submitting') && round.seed !== null && (
        <div className="mt-8">
          <PrintBed seed={round.seed} elapsedMs={elapsed} tapsMs={taps} showGate />
          <button
            type="button"
            onPointerDown={dropLayer}
            className="mt-6 w-full h-28 rounded-3xl bg-brand text-3xl font-display"
          >
            Drop
          </button>
        </div>
      )}
      {state?.pass?.status === 'verified' && !round && (
        <p className="mt-10 text-xl text-white/80">
          {state.pass.username ? `Cleared as @${state.pass.username}. ` : 'Follow confirmed. '}
          Wait for the code on the monitor.
        </p>
      )}
      {(factors || state?.factors) && round?.phase === 'closed' && (
        <Result factors={factors || state?.factors || null} winner={round.winner?.username ?? null} />
      )}
      {state?.pass?.status === 'verified' && round && round.phase !== 'entry' && !state.joined && (
        <p className="mt-8 text-white/70">
          {round.phase === 'closed'
            ? 'This draw is closed. Stay for the next code.'
            : 'This draw has already started. Wait for the next code.'}
        </p>
      )}
    </main>
  )
}

function FollowGate({
  message,
  dmUrl,
  status,
  reason,
}: {
  message: string
  dmUrl: string
  status: string
  reason: string | null | undefined
}) {
  return (
    <section className="mt-8 space-y-4">
      <p className="text-lg text-white/80">
        Follow @{PLAY_HANDLE} from the account you will play with. Then send this exact message. If that account does
        not follow us, the round will not open.
      </p>
      <p className="font-display text-4xl tracking-wide">{message || 'Opening a pass…'}</p>
      <a href={`https://instagram.com/${PLAY_HANDLE}`} className="block text-center border border-white/20 rounded-full py-3">
        Open @{PLAY_HANDLE}
      </a>
      <a href={dmUrl} className="block text-center bg-brand rounded-full py-4 font-semibold">
        Message PLAY
      </a>
      {status === 'pending' && <p className="text-white/60">Waiting for Instagram to confirm the follow.</p>}
      {status === 'rejected' && <p className="text-amber-200">{reason}</p>}
    </section>
  )
}

function Result({ factors, winner }: { factors: RunFactors | null; winner: string | null }) {
  if (!factors) return null
  return (
    <section className="mt-8">
      <p className="text-white/60">Your recorded score</p>
      <p className="font-display text-5xl">{factors.composite}</p>
      {winner && <p className="mt-3 text-xl">Draw goes to @{winner}</p>}
    </section>
  )
}
