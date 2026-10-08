'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TOWER_HANDLE } from '@/lib/tower/constants'
import { roundPhase } from '@/lib/tower/rules'
import type { PublicBoard, PublicRound, PublicWinner, RoundPhase, RoundRow } from '@/lib/tower/types'
import { TowerCanvas } from '@/components/tower/tower-canvas'
import { QrCode } from '@/components/tower/qr-code'
import { useBoard, useServerOffset, useWakeLock } from '@/components/tower/client-api'
import { playFanfare, playTick, unlockTowerAudio } from '@/components/tower/tower-audio'

/**
 * Kahoot-style big screen for the stall TV. Open /tower/screen and press F11.
 * lobby (QR + names joining) → countdown → live race → podium, then the winner reveal.
 */
export function StallScreen() {
  const { board, error } = useBoard(1_000)
  const offset = useServerOffset()
  const [soundOn, setSoundOn] = useState(false)
  const now = useNow(250) + offset
  useWakeLock(true)

  const round = board?.round ?? null
  // Re-derive the phase locally so the countdown flips to GO on time between polls.
  const phase: RoundPhase | 'idle' = round
    ? roundPhase({ status: round.status, goAtMs: round.goAt, nowMs: now, joined: round.joined, finished: round.finished })
    : 'idle'
  const winner = board?.event?.winner ?? null

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-white">
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-3">
        {error && <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm text-amber-100">Reconnecting…</span>}
        <button
          type="button"
          onClick={() => {
            unlockTowerAudio()
            setSoundOn(true)
          }}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70"
        >
          {soundOn ? 'Sound on' : 'Enable sound'}
        </button>
      </div>

      {phase === 'idle' && <IdleView board={board} />}
      {round && phase === 'lobby' && <LobbyView board={board} round={round} />}
      {round && phase === 'countdown' && round.goAt !== null && (
        <CountdownView round={round} goAt={round.goAt} now={now} soundOn={soundOn} />
      )}
      {round && phase === 'playing' && <RaceView board={board} round={round} />}
      {round && phase === 'results' && <ResultsView key={round.id} board={board} round={round} soundOn={soundOn} />}

      {winner && board?.event?.announcedAt && (
        <WinnerReveal key={board.event.announcedAt} winner={winner} soundOn={soundOn} />
      )}
    </main>
  )
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

// ------------------------------------------------------------------ phases

function Brand({ small = false }: { small?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">Tathastu Keepsakes</p>
      <h1 className={`text-white font-display font-bold leading-none ${small ? 'mt-1 text-4xl' : 'mt-2 text-6xl xl:text-7xl'}`}>
        Tathastu Tower
      </h1>
    </div>
  )
}

function JoinPanel({ code }: { code: string | null }) {
  return (
    <div className="flex items-center gap-6 rounded-3xl bg-white p-5 text-ink shadow-2xl">
      <QrCode path="/tower" className="w-40 text-ink xl:w-48" label="Scan to play Tathastu Tower" />
      <div>
        <p className="text-lg font-semibold text-ink/60">1. Scan &amp; follow @{TOWER_HANDLE}</p>
        <p className="text-lg font-semibold text-ink/60">2. Enter your name + WhatsApp</p>
        <p className="mt-2 text-lg font-semibold text-ink/60">3. Game code</p>
        {code ? (
          <p className="font-display text-7xl font-bold tracking-[0.2em] tabular-nums xl:text-8xl">{code}</p>
        ) : (
          <p className="font-display text-3xl font-bold">Ask the host!</p>
        )}
      </div>
    </div>
  )
}

function IdleView({ board }: { board: PublicBoard | null }) {
  const open = board?.event?.status === 'open'
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
      <section className="relative min-h-[50vh]">
        <TowerCanvas seed={20261008} mode="demo" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 p-8">
          <Brand />
          <p className="mt-3 max-w-md text-xl text-white/80">
            Stack the tallest tower. Everyone plays together — top score wins a 3D-printed keepsake.
          </p>
        </div>
        <div className="absolute bottom-8 left-8">
          <JoinPanel code={null} />
        </div>
      </section>
      <section className="flex flex-col bg-black/30 p-8 pt-20">
        <p className="text-sm uppercase tracking-widest text-white/50">{board?.event?.name ?? 'Leaderboard'}</p>
        <h2 className="text-white font-display text-4xl font-bold">Top stackers</h2>
        <Leaderboard rows={board?.top ?? []} />
        <Stats board={board} />
        <p className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-2xl text-white/80">
          {!board?.event
            ? `The game opens soon. Follow @${TOWER_HANDLE} to be ready!`
            : open
              ? 'Next round starting soon — scan now to get ready!'
              : 'Entries closed — winner coming up!'}
        </p>
      </section>
    </div>
  )
}

function LobbyView({ board, round }: { board: PublicBoard | null; round: PublicRound }) {
  const names = board?.roundRows.map((row) => row.name) ?? []
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-brand-900 via-ink to-[#3b1a5a] p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <Brand small />
          <p className="mt-4 inline-block rounded-full bg-amber-300 px-5 py-2 font-display text-2xl font-bold text-ink">
            Round {round.number} · join now!
          </p>
        </div>
        <JoinPanel code={round.code} />
      </div>
      <div className="mt-8 flex items-center gap-4">
        <p className="font-display text-7xl font-bold tabular-nums">{round.joined}</p>
        <p className="text-2xl uppercase tracking-widest text-white/60">{round.joined === 1 ? 'player' : 'players'} in</p>
      </div>
      <div className="mt-6 flex flex-1 flex-wrap content-start gap-3">
        {names.length === 0 && <p className="text-3xl text-white/50">Waiting for players…</p>}
        {names.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="animate-ping-once rounded-2xl bg-white/15 px-5 py-3 font-display text-3xl font-bold shadow-lg"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function CountdownView({ round, goAt, now, soundOn }: { round: PublicRound; goAt: number; now: number; soundOn: boolean }) {
  const left = Math.max(0, Math.ceil((goAt - now) / 1000))
  const last = useRef(-1)
  useEffect(() => {
    if (left === last.current) return
    last.current = left
    if (soundOn && left <= 3) playTick()
  }, [left, soundOn])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#3b1a5a] via-ink to-brand-900 text-center">
      <p className="text-3xl uppercase tracking-[0.4em] text-amber-200">Round {round.number}</p>
      <p className="mt-2 text-2xl text-white/70">{round.joined} players · get ready to tap!</p>
      <p key={left} className="mt-6 animate-ping-once font-display text-[16rem] font-bold leading-none tabular-nums">
        {left || 'GO'}
      </p>
    </div>
  )
}

function RaceView({ board, round }: { board: PublicBoard | null; round: PublicRound }) {
  const rows = board?.roundRows ?? []
  const top = Math.max(1, ...rows.map((row) => row.score))
  return (
    <div className="flex min-h-dvh flex-col p-8">
      <div className="flex items-end justify-between">
        <div>
          <Brand small />
          <p className="mt-3 text-2xl text-white/70">Round {round.number} · live</p>
        </div>
        <div className="text-right">
          <p className="font-display text-6xl font-bold tabular-nums">
            {round.finished}/{round.joined}
          </p>
          <p className="text-lg uppercase tracking-widest text-white/50">finished</p>
        </div>
      </div>
      <ol className="mt-8 space-y-2">
        {rows.slice(0, 12).map((row, index) => (
          <RaceBar key={row.name} row={row} place={index + 1} top={top} />
        ))}
      </ol>
      {rows.length > 12 && <p className="mt-3 text-xl text-white/50">+{rows.length - 12} more stacking…</p>}
    </div>
  )
}

function RaceBar({ row, place, top }: { row: RoundRow; place: number; top: number }) {
  const width = Math.max(6, Math.round((row.score / top) * 100))
  return (
    <li className="flex items-center gap-4">
      <span className="w-12 text-right font-display text-3xl font-bold text-white/60">{place}</span>
      <div className="relative h-14 flex-1 overflow-hidden rounded-2xl bg-white/5">
        <div
          className={`absolute inset-y-0 left-0 rounded-2xl transition-[width] duration-700 ease-out ${
            row.done ? 'bg-brand-300/70' : place === 1 ? 'bg-amber-400/80' : 'bg-[#8b5cf6]/70'
          }`}
          style={{ width: `${width}%` }}
        />
        <div className="relative flex h-full items-center justify-between px-5">
          <span className="truncate font-display text-2xl font-bold">
            {row.name} {row.done && <span className="text-base font-normal text-white/70">✓ done</span>}
          </span>
          <span className="font-display text-3xl font-bold tabular-nums">{row.score}</span>
        </div>
      </div>
    </li>
  )
}

/** Podium revealed third → second → first, like the end of a Kahoot. */
function ResultsView({ board, round, soundOn }: { board: PublicBoard | null; round: PublicRound; soundOn: boolean }) {
  const rows = board?.roundRows.filter((row) => row.done) ?? []
  const podium = rows.slice(0, 3)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timers = [1, 2, 3].map((step) =>
      window.setTimeout(() => {
        setShown(step)
        if (step === 3 && soundOn) playFanfare()
      }, step * 1_400)
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [soundOn])

  // Step 1 reveals third place, step 3 reveals the round winner.
  const visible = (place: number) => shown >= 4 - place || podium.length < place
  const slots: { place: number; height: string; tone: string }[] = [
    { place: 2, height: 'h-56', tone: 'bg-slate-300 text-ink' },
    { place: 1, height: 'h-80', tone: 'bg-amber-400 text-ink' },
    { place: 3, height: 'h-44', tone: 'bg-orange-400 text-ink' },
  ]

  return (
    <div className="grid min-h-dvh grid-cols-1 gap-8 bg-gradient-to-b from-brand-900 to-ink p-8 lg:grid-cols-[1.4fr_1fr]">
      <section className="flex flex-col">
        <Brand small />
        <p className="mt-3 text-3xl font-semibold text-amber-200">Round {round.number} results</p>
        {podium.length === 0 ? (
          <p className="mt-16 text-3xl text-white/60">No finished games this round.</p>
        ) : (
          <div className="mt-auto flex items-end justify-center gap-6 pb-4">
            {slots.map(({ place, height, tone }) => {
              const row = podium[place - 1]
              if (!row) return <div key={place} className="w-64" />
              const show = visible(place)
              return (
                <div key={place} className="flex w-64 flex-col items-center">
                  <div className={`mb-3 text-center transition-all duration-700 ${show ? 'opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <p className="break-words font-display text-4xl font-bold">{row.name}</p>
                    <p className="font-display text-3xl tabular-nums text-white/80">{row.score}</p>
                  </div>
                  <div
                    className={`flex w-full origin-bottom items-start justify-center rounded-t-3xl pt-4 font-display text-7xl font-bold shadow-2xl transition-transform duration-700 ${height} ${tone} ${
                      show ? 'scale-y-100' : 'scale-y-0'
                    }`}
                  >
                    {place}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {shown >= 3 && podium.length > 0 && <Confetti count={40} />}
      </section>
      <section className="flex flex-col rounded-3xl bg-black/30 p-6">
        <p className="text-sm uppercase tracking-widest text-white/50">Overall today</p>
        <h2 className="text-white font-display text-3xl font-bold">Top stackers</h2>
        <Leaderboard rows={board?.top.slice(0, 8) ?? []} compact />
        <p className="mt-auto pt-6 text-center text-xl text-white/70">Next round soon — scan the QR to join!</p>
      </section>
    </div>
  )
}

// ------------------------------------------------------------------ bits

function Leaderboard({ rows, compact = false }: { rows: PublicBoard['top']; compact?: boolean }) {
  if (rows.length === 0) {
    return <p className="mt-10 text-2xl text-white/60">No scores yet — be the first on the board!</p>
  }
  return (
    <ol className={`mt-6 ${compact ? 'space-y-1.5' : 'space-y-2'}`}>
      {rows.map((row) => (
        <li
          key={`${row.rank}-${row.name}`}
          className={`flex items-center gap-4 rounded-2xl px-5 ${compact ? 'py-2' : 'py-3'} ${
            row.rank === 1 ? 'bg-amber-300/20' : 'bg-white/5'
          }`}
        >
          <span className={`w-10 font-display text-3xl font-bold ${row.rank <= 3 ? 'text-amber-200' : 'text-white/50'}`}>
            {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : row.rank}
          </span>
          <span className="min-w-0 flex-1 truncate text-2xl font-semibold">{row.name}</span>
          <span className="text-right">
            <span className="block font-display text-3xl font-bold tabular-nums">{row.score}</span>
            {!compact && <span className="block text-xs text-white/50">{row.layers} layers</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

function Stats({ board }: { board: PublicBoard | null }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 text-center">
      {[
        ['Players', board?.players ?? 0],
        ['Games', board?.games ?? 0],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-white/5 py-3">
          <p className="font-display text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
        </div>
      ))}
    </div>
  )
}

function Confetti({ count }: { count: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: (index * 37) % 100,
        delay: (index % 14) * 0.25,
        duration: 3.2 + (index % 5) * 0.5,
        drift: ((index % 7) - 3) * 30,
        colour: ['#fcd34d', '#52b5a9', '#f472b6', '#60a5fa', '#ffffff'][index % 5],
      })),
    [count]
  )
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="tower-confetti"
          style={
            {
              left: `${piece.left}%`,
              background: piece.colour,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              '--drift': `${piece.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function WinnerReveal({ winner, soundOn }: { winner: PublicWinner; soundOn: boolean }) {
  useEffect(() => {
    if (soundOn) playFanfare()
  }, [soundOn])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink/95 text-center">
      <Confetti count={70} />
      <div className="relative px-6">
        <p className="text-3xl font-semibold uppercase tracking-[0.4em] text-amber-200">🏆 Today&apos;s winner 🏆</p>
        <p className="mt-6 break-words font-display text-7xl font-bold md:text-9xl">{winner.name}</p>
        <p className="mt-8 font-display text-6xl font-bold text-brand-200 tabular-nums">{winner.score}</p>
        <p className="mt-2 text-xl text-white/70">
          {winner.layers} layers · {winner.perfects} perfect drops
        </p>
        <p className="mt-10 text-2xl text-white/80">Come to the stall to collect your keepsake!</p>
      </div>
    </div>
  )
}
