'use client'

import { useEffect, useState } from 'react'
import { DRAW_SLOTS, GAME_MS, PLAY_HANDLE } from '@/lib/play/constants'
import { PrintBed } from '@/components/play/print-bed'
import { playCountdownTone, playWinnerTone, unlockPlayAudio } from '@/components/play/play-audio'
import { useElapsed, useNow } from '@/components/play/use-round-clock'
import type { PublicRound, PublicWinner } from '@/lib/play/types'

interface BoardPayload {
  serverNow: number
  verifiedCount: number
  rounds: PublicRound[]
  slots: string[]
}

export function CrowdScreen() {
  const [board, setBoard] = useState<BoardPayload | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function pull() {
      try {
        const response = await fetch('/api/play/board', { cache: 'no-store' })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'The board is unavailable.')
        if (!cancelled) {
          setBoard(body)
          setError('')
        }
      } catch (pullError) {
        if (!cancelled) setError(pullError instanceof Error ? pullError.message : 'The board is unavailable.')
      }
    }
    void pull()
    const timer = window.setInterval(() => void pull(), 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const round = activeRound(board?.rounds ?? [])
  const now = useNow(board?.serverNow ?? 0)
  const elapsed = useElapsed(round?.startsAt ?? 0, board?.serverNow ?? 0, round?.phase === 'live' || round?.phase === 'submitting' || round?.phase === 'closed')

  return (
    <main className="min-h-dvh bg-ink text-white px-6 py-8 flex flex-col">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-brand-200 text-sm font-semibold tracking-[0.2em] uppercase">Tathastu Keepsakes</p>
          <h1 className="font-display text-4xl md:text-6xl leading-none mt-2">Layer Rush</h1>
        </div>
        <button
          type="button"
          className="border border-white/20 rounded-full px-4 py-2 text-sm"
          onClick={() => {
            unlockPlayAudio()
            setSoundOn(true)
          }}
        >
          {soundOn ? 'Sound on' : 'Turn sound on'}
        </button>
      </header>

      {error && <p className="mt-6 text-amber-200">{error}</p>}

      <section className="flex-1 flex flex-col justify-center">
        {!round && <IdleBoard verifiedCount={board?.verifiedCount ?? 0} />}
        {round?.phase === 'entry' && <EntryBoard round={round} now={now} />}
        {round?.phase === 'countdown' && <CountdownBoard round={round} now={now} soundOn={soundOn} />}
        {(round?.phase === 'live' || round?.phase === 'submitting') && round.seed !== null && (
          <LiveBoard seed={round.seed} elapsedMs={elapsed} joined={round.joined} />
        )}
        {round?.phase === 'closed' && <WinnerBoard round={round} />}
      </section>

      <footer className="text-white/50 text-sm">
        Draws {DRAW_SLOTS.join(' · ')} · Follow @{PLAY_HANDLE} before the code
      </footer>
    </main>
  )
}

function IdleBoard({ verifiedCount }: { verifiedCount: number }) {
  return (
    <div>
      <p className="font-display text-5xl md:text-7xl leading-tight">Gather at the stall.</p>
      <p className="mt-6 text-2xl text-white/80 max-w-3xl">
        Follow @{PLAY_HANDLE}, send PLAY from that account, then wait for the code.
      </p>
      <p className="mt-8 text-brand-200 text-xl">{verifiedCount} followers cleared to play</p>
    </div>
  )
}

function EntryBoard({ round, now }: { round: PublicRound; now: number }) {
  const seconds = Math.max(0, Math.ceil((round.entryClosesAt - now) / 1000))
  return (
    <div>
      <p className="text-white/70 text-2xl">Draw {round.roundNumber} of 5 · type this code</p>
      <p className="font-display text-8xl md:text-9xl tracking-[0.2em] mt-4">{round.code}</p>
      <p className="mt-6 text-3xl text-amber-200">{seconds}s to enter</p>
      <p className="mt-4 text-white/70">{round.joined.length} phones in</p>
    </div>
  )
}

function CountdownBoard({ round, now, soundOn }: { round: PublicRound; now: number; soundOn: boolean }) {
  const seconds = Math.max(1, Math.ceil((round.startsAt - now) / 1000))
  useEffect(() => {
    if (soundOn) playCountdownTone()
  }, [seconds, soundOn])
  return <p className="font-display text-[10rem] leading-none text-center">{seconds}</p>
}

function LiveBoard({ seed, elapsedMs, joined }: { seed: number; elapsedMs: number; joined: string[] }) {
  return (
    <div className="grid md:grid-cols-[1.4fr_0.8fr] gap-8 items-center">
      <div>
        <p className="text-white/70 mb-4">Drop when the head covers the gold line</p>
        <PrintBed seed={seed} elapsedMs={elapsedMs} tapsMs={[]} showGate />
      </div>
      <div>
        <p className="text-white/60 text-sm uppercase tracking-widest">In this draw</p>
        <ul className="mt-3 space-y-2 text-2xl">
          {joined.slice(0, 8).map((name) => (
            <li key={name}>@{name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function WinnerBoard({ round }: { round: PublicRound }) {
  const winner = round.winner
  const winnerName = winner?.username ?? ''
  useEffect(() => {
    if (winnerName) playWinnerTone()
  }, [winnerName, round.roundNumber])
  if (!winner) {
    return <p className="font-display text-5xl">No eligible winner this draw.</p>
  }
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <p className="text-amber-200 text-xl">One draw · draw {round.roundNumber}</p>
        <h2 className="font-display text-6xl mt-2">@{winner.username}</h2>
        <p className="text-5xl mt-4 text-brand-200">{winner.composite}</p>
        <FactorList winner={winner} />
      </div>
      <PrintBed seed={winner.seed} elapsedMs={replayElapsed()} tapsMs={winner.tapsMs} showGate={false} />
    </div>
  )
}

function FactorList({ winner }: { winner: PublicWinner }) {
  const rows = [
    ['Accuracy', winner.accuracy],
    ['Combo', winner.combo],
    ['Speed', winner.speed],
    ['Steady', winner.stability],
    ['Clutch', winner.clutch],
  ] as const
  return (
    <dl className="mt-6 grid grid-cols-5 gap-3 max-w-xl">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-white/50 text-xs uppercase">{label}</dt>
          <dd className="text-xl">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function activeRound(rounds: PublicRound[]): PublicRound | null {
  return rounds.find((round) => round.phase !== 'closed') ?? rounds[rounds.length - 1] ?? null
}

function replayElapsed(): number {
  const cycle = GAME_MS + 1_500
  const frame = Date.now() % cycle
  return Math.min(GAME_MS, frame)
}
