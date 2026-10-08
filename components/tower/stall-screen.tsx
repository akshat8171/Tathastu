'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TOWER_HANDLE } from '@/lib/tower/constants'
import type { PublicBoard, PublicWinner } from '@/lib/tower/types'
import { TowerCanvas } from '@/components/tower/tower-canvas'
import { QrCode } from '@/components/tower/qr-code'
import { useBoard, useWakeLock } from '@/components/tower/client-api'
import { playFanfare, unlockTowerAudio } from '@/components/tower/tower-audio'

/** Big-screen view for the stall monitor or TV. Open /tower/screen and press F11. */
export function StallScreen() {
  const { board, error } = useBoard(2_000)
  const [soundOn, setSoundOn] = useState(false)
  useWakeLock(true)

  const winner = board?.event?.winner ?? null

  return (
    <main className="relative grid min-h-dvh grid-cols-1 overflow-hidden bg-ink text-white lg:grid-cols-[1.15fr_1fr]">
      <section className="relative min-h-[50vh]">
        <TowerCanvas seed={20261008} mode="demo" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">Tathastu Keepsakes</p>
          <h1 className="text-white mt-2 font-display text-6xl font-bold leading-none xl:text-7xl">Tathastu Tower</h1>
          <p className="mt-3 max-w-md text-xl text-white/80">Stack the tallest tower. Top score wins a 3D-printed keepsake.</p>
        </div>
        <div className="absolute bottom-8 left-8 flex items-end gap-5">
          <QrCode path="/tower" className="w-44 text-white xl:w-52" label="Scan to play Tathastu Tower" />
          <div className="pb-8">
            <p className="font-display text-4xl font-bold">Scan to play</p>
            <p className="mt-1 text-lg text-white/75">1. Follow @{TOWER_HANDLE}</p>
            <p className="text-lg text-white/75">2. Stack · 3. Win</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col bg-black/30 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">{board?.event?.name ?? 'Leaderboard'}</p>
            <h2 className="text-white font-display text-4xl font-bold">Top stackers</h2>
          </div>
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
        {error && <p className="mt-3 text-amber-200">Reconnecting… ({error})</p>}
        <Leaderboard board={board} />
        <StatsRow board={board} />
        <Recent board={board} />
        {board?.event?.status === 'closed' && !winner && (
          <p className="mt-6 rounded-2xl bg-amber-400/20 p-4 text-center text-2xl font-semibold text-amber-100">
            Entries closed — winner coming up!
          </p>
        )}
        {!board?.event && board && (
          <p className="mt-6 text-xl text-white/70">The game opens soon. Follow @{TOWER_HANDLE} to be ready!</p>
        )}
      </section>

      {winner && board?.event?.announcedAt && (
        <WinnerReveal key={board.event.announcedAt} winner={winner} soundOn={soundOn} />
      )}
    </main>
  )
}

function Leaderboard({ board }: { board: PublicBoard | null }) {
  const rows = board?.top ?? []
  const previous = useRef(new Map<string, number>())
  const [flash, setFlash] = useState<Set<string>>(new Set())

  useEffect(() => {
    const changed = new Set<string>()
    for (const row of rows) {
      const before = previous.current.get(row.handle)
      if (before === undefined || before !== row.score) changed.add(row.handle)
    }
    if (previous.current.size > 0 && changed.size > 0) {
      setFlash(changed)
      const timer = window.setTimeout(() => setFlash(new Set()), 2_500)
      previous.current = new Map(rows.map((row) => [row.handle, row.score]))
      return () => window.clearTimeout(timer)
    }
    previous.current = new Map(rows.map((row) => [row.handle, row.score]))
  }, [rows])

  if (rows.length === 0) {
    return <p className="mt-10 text-2xl text-white/60">No scores yet — be the first on the board!</p>
  }
  return (
    <ol className="mt-6 space-y-2">
      {rows.map((row) => (
        <li
          key={row.handle}
          className={`flex items-center gap-4 rounded-2xl px-5 py-3 transition-colors duration-700 ${
            flash.has(row.handle) ? 'bg-brand/60' : row.rank === 1 ? 'bg-amber-300/20' : 'bg-white/5'
          }`}
        >
          <span className={`w-10 font-display text-3xl font-bold ${row.rank <= 3 ? 'text-amber-200' : 'text-white/50'}`}>
            {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : row.rank}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-2xl font-semibold">@{row.handle}</span>
            {row.displayName && <span className="block truncate text-sm text-white/50">{row.displayName}</span>}
          </span>
          <span className="text-right">
            <span className="block font-display text-3xl font-bold tabular-nums">{row.score}</span>
            <span className="block text-xs text-white/50">{row.layers} layers</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function StatsRow({ board }: { board: PublicBoard | null }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
      {[
        ['Players', board?.players ?? 0],
        ['Games', board?.games ?? 0],
        ['Playing now', board?.playingNow ?? 0],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-white/5 py-3">
          <p className="font-display text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
        </div>
      ))}
    </div>
  )
}

function Recent({ board }: { board: PublicBoard | null }) {
  const recent = board?.recent ?? []
  if (recent.length === 0) return null
  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-widest text-white/40">Just played</p>
      <p className="mt-2 truncate text-lg text-white/70">
        {recent.map((run) => `@${run.handle} ${run.score}`).join('  ·  ')}
      </p>
    </div>
  )
}

function WinnerReveal({ winner, soundOn }: { winner: PublicWinner; soundOn: boolean }) {
  useEffect(() => {
    if (soundOn) playFanfare()
  }, [soundOn])

  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        left: (index * 37) % 100,
        delay: (index % 14) * 0.25,
        duration: 3.2 + (index % 5) * 0.5,
        drift: ((index % 7) - 3) * 30,
        colour: ['#fcd34d', '#52b5a9', '#f472b6', '#60a5fa', '#ffffff'][index % 5],
      })),
    []
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink/95 text-center">
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
      <div className="relative px-6">
        <p className="text-3xl font-semibold uppercase tracking-[0.4em] text-amber-200">🏆 Winner 🏆</p>
        <p className="mt-6 break-all font-display text-7xl font-bold md:text-9xl">@{winner.handle}</p>
        {winner.displayName && <p className="mt-3 text-3xl text-white/80">{winner.displayName}</p>}
        <p className="mt-8 font-display text-6xl font-bold text-brand-200 tabular-nums">{winner.score}</p>
        <p className="mt-2 text-xl text-white/70">
          {winner.layers} layers · {winner.perfects} perfect drops
        </p>
        <p className="mt-10 text-2xl text-white/80">Come to the stall to collect your keepsake!</p>
      </div>
    </div>
  )
}
