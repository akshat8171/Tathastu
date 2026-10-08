'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TOWER_HANDLE, TOWER_INSTAGRAM_URL } from '@/lib/tower/constants'
import type { FollowCheckMode, PlayerView, PublicBoard, RunResult, RunTicket } from '@/lib/tower/types'
import { TowerCanvas, type DropEvent } from '@/components/tower/tower-canvas'
import { TOKEN_HEADER, callApi, callApiWithRetry, storage, useBoard, useWakeLock } from '@/components/tower/client-api'
import {
  buzz,
  isTowerMuted,
  playCut,
  playMiss,
  playPerfect,
  playTick,
  setTowerMuted,
  unlockTowerAudio,
} from '@/components/tower/tower-audio'

const KEY_TOKEN = 'tower:token'
const KEY_FOLLOWED = 'tower:followed'
const KEY_PENDING = 'tower:pending'
const KEY_PASS = 'tower:pass'
const KEY_MUTED = 'tower:muted'

type Screen = 'boot' | 'follow' | 'register' | 'home' | 'countdown' | 'playing' | 'saving' | 'result'

interface Pending {
  runId: string
  intervals: number[]
}

interface PlayerAppProps {
  followCheck: FollowCheckMode
}

export function PlayerApp({ followCheck }: PlayerAppProps) {
  const [screen, setScreen] = useState<Screen>('boot')
  const [token, setToken] = useState<string | null>(null)
  const [player, setPlayer] = useState<PlayerView | null>(null)
  const [run, setRun] = useState<RunTicket | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)
  const [previousBest, setPreviousBest] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [muted, setMuted] = useState(false)

  const signOut = useCallback(() => {
    storage.remove(KEY_TOKEN)
    storage.remove(KEY_FOLLOWED)
    storage.remove(KEY_PENDING)
    storage.remove(KEY_PASS)
    setToken(null)
    setPlayer(null)
    setRun(null)
    setResult(null)
    setError('')
    setScreen('follow')
  }, [])

  /** "Next player" on a shared phone: release the handle on the server so its owner can sign in again later. */
  const handOver = useCallback(() => {
    const saved = storage.get(KEY_TOKEN)
    if (saved) {
      void fetch('/api/tower/logout', { method: 'POST', headers: { [TOKEN_HEADER]: saved }, keepalive: true }).catch(
        () => undefined
      )
    }
    signOut()
  }, [signOut])

  const submitPending = useCallback(
    async (activeToken: string, pending: Pending) => {
      setScreen('saving')
      setError('')
      const reply = await callApiWithRetry<{ result: RunResult; player: PlayerView }>(
        '/api/tower/run/finish',
        { method: 'POST', token: activeToken, body: { runId: pending.runId, intervalsMs: pending.intervals } },
        6
      )
      if (reply.ok) {
        storage.remove(KEY_PENDING)
        setResult(reply.data.result)
        setPlayer(reply.data.player)
        setScreen('result')
        return
      }
      if (reply.status >= 400 && reply.status < 500) {
        // The server has a final answer (already counted, rejected, or a stale run). Do not retry forever.
        storage.remove(KEY_PENDING)
        if (reply.status === 401) {
          signOut()
          setError(reply.error)
          return
        }
        setError(reply.error)
        const me = await callApi<{ player: PlayerView }>('/api/tower/me', { token: activeToken })
        if (me.ok) setPlayer(me.data.player)
        setScreen('home')
        return
      }
      setError('Could not reach the server. Your score is safe on this phone — tap retry.')
    },
    [signOut]
  )

  // Boot: restore the player on this phone and finish any game that was cut off by a reload.
  useEffect(() => {
    setMuted(storage.get(KEY_MUTED) === '1')
    setTowerMuted(storage.get(KEY_MUTED) === '1')
    const saved = storage.get(KEY_TOKEN)
    if (!saved) {
      setScreen('follow')
      return
    }
    setToken(saved)
    const pending = readPending()
    if (pending) {
      void submitPending(saved, pending)
      return
    }
    void (async () => {
      const reply = await callApi<{ player: PlayerView }>('/api/tower/me', { token: saved })
      if (reply.ok) {
        setPlayer(reply.data.player)
        setScreen('home')
      } else if (reply.status === 401) {
        signOut()
      } else {
        setError(reply.error)
        setScreen('home')
      }
    })()
  }, [signOut, submitPending])

  const signedIn = useCallback((nextToken: string, view: PlayerView) => {
    storage.set(KEY_TOKEN, nextToken)
    setToken(nextToken)
    setPlayer(view)
    setError('')
    setScreen('home')
  }, [])

  const startGame = useCallback(async () => {
    if (!token || busy) return
    unlockTowerAudio()
    setBusy(true)
    setError('')
    // One key per tap of Play: retries of this request return the same run, never a second try.
    const startKey = newStartKey()
    const reply = await callApiWithRetry<{ run: RunTicket; player: PlayerView }>(
      '/api/tower/run/start',
      { method: 'POST', token, body: { startKey } },
      3
    )
    setBusy(false)
    if (!reply.ok) {
      if (reply.status === 401) signOut()
      setError(reply.error)
      return
    }
    setPreviousBest(reply.data.player.best?.score ?? null)
    setPlayer(reply.data.player)
    setRun(reply.data.run)
    setResult(null)
    storage.set(KEY_PENDING, JSON.stringify({ runId: reply.data.run.runId, intervals: [] } satisfies Pending))
    setScreen('countdown')
  }, [token, busy, signOut])

  const finishGame = useCallback(
    (intervals: number[]) => {
      if (!token || !run) return
      const pending: Pending = { runId: run.runId, intervals }
      storage.set(KEY_PENDING, JSON.stringify(pending))
      // Let the last slab tumble before the score card slides in.
      window.setTimeout(() => void submitPending(token, pending), 900)
    },
    [token, run, submitPending]
  )

  const toggleMute = () => {
    const next = !isTowerMuted()
    setTowerMuted(next)
    setMuted(next)
    storage.set(KEY_MUTED, next ? '1' : '0')
  }

  useWakeLock(screen === 'countdown' || screen === 'playing')

  if (screen === 'countdown' && run) {
    return <Countdown onDone={() => setScreen('playing')} />
  }
  if (screen === 'playing' && run) {
    return <PlayingScreen run={run} onGameOver={finishGame} muted={muted} onToggleMute={toggleMute} />
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-ink via-ink to-brand-900 text-white">
      <div className="mx-auto max-w-md px-5 pb-10 pt-6">
        <Header muted={muted} onToggleMute={toggleMute} />
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-amber-400/15 px-4 py-3 text-amber-100">
            {error}
          </p>
        )}
        {screen === 'boot' && <p className="mt-16 text-center text-white/60">Loading…</p>}
        {screen === 'follow' &&
          (followCheck === 'instagram' ? (
            <InstagramGate onSignedIn={signedIn} />
          ) : (
            <FollowStep onNext={() => setScreen('register')} />
          ))}
        {screen === 'register' && <RegisterStep onSignedIn={signedIn} onBack={() => setScreen('follow')} />}
        {screen === 'home' && player && (
          <HomeScreen player={player} busy={busy} onPlay={() => void startGame()} onNextPlayer={handOver} />
        )}
        {screen === 'home' && !player && (
          <button type="button" onClick={() => window.location.reload()} className="btn-tower mt-10">
            Try again
          </button>
        )}
        {screen === 'saving' && (
          <SavingScreen
            stuck={Boolean(error)}
            onRetry={() => {
              const pending = readPending()
              if (token && pending) void submitPending(token, pending)
            }}
          />
        )}
        {screen === 'result' && result && player && (
          <ResultScreen
            result={result}
            player={player}
            previousBest={previousBest}
            busy={busy}
            onPlay={() => void startGame()}
            onNextPlayer={handOver}
          />
        )}
      </div>
    </main>
  )
}

// ------------------------------------------------------------------ steps

function Header({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-200">Tathastu Keepsakes</p>
        <h1 className="text-white font-display text-3xl font-bold leading-tight">Tathastu Tower</h1>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/80"
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </header>
  )
}

function FollowStep({ onNext }: { onNext: () => void }) {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    setOpened(storage.get(KEY_FOLLOWED) === '1')
  }, [])

  return (
    <section className="mt-8">
      <StepBadge step={1} />
      <h2 className="text-white mt-3 font-display text-3xl font-bold leading-tight">Follow us to unlock the game</h2>
      <p className="mt-3 text-white/75">
        Stack the tallest tower and win a 3D-printed keepsake. The top score at the end of the day wins.
      </p>
      <a
        href={TOWER_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          storage.set(KEY_FOLLOWED, '1')
          setOpened(true)
        }}
        className="mt-6 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] py-4 text-lg font-semibold shadow-lg"
      >
        <InstagramGlyph /> Follow @{TOWER_HANDLE}
      </a>
      <button
        type="button"
        onClick={onNext}
        disabled={!opened}
        className="btn-tower mt-4 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {opened ? "I'm following — let's play" : 'Follow first, then come back here'}
      </button>
      <p className="mt-4 text-center text-sm text-white/50">
        We check the winner&apos;s follow before handing over the prize.
      </p>
    </section>
  )
}

function RegisterStep({
  onSignedIn,
  onBack,
}: {
  onSignedIn: (token: string, player: PlayerView) => void
  onBack: () => void
}) {
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (busy) return
    setBusy(true)
    setError('')
    const reply = await callApiWithRetry<{ token: string; player: PlayerView }>(
      '/api/tower/register',
      { method: 'POST', body: { handle, displayName: name } },
      3
    )
    setBusy(false)
    if (!reply.ok) {
      setError(reply.error)
      return
    }
    onSignedIn(reply.data.token, reply.data.player)
  }

  return (
    <form
      className="mt-8"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <StepBadge step={2} />
      <h2 className="text-white mt-3 font-display text-3xl font-bold leading-tight">Who&apos;s playing?</h2>
      <p className="mt-2 text-white/70">Use the Instagram account that follows us — that&apos;s how we find the winner.</p>
      <label htmlFor="tower-handle" className="mt-6 block text-sm font-medium text-white/80">
        Instagram username
      </label>
      <div className="mt-2 flex items-center rounded-2xl border border-white/20 bg-white/5 px-4 focus-within:border-brand-300">
        <span className="text-xl text-white/50">@</span>
        <input
          id="tower-handle"
          value={handle}
          onChange={(event) => setHandle(event.target.value.replace(/^@+/, ''))}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          spellCheck={false}
          inputMode="email"
          maxLength={60}
          required
          placeholder="yourname"
          className="w-full bg-transparent px-2 py-4 text-xl outline-none placeholder:text-white/30"
        />
      </div>
      <label htmlFor="tower-name" className="mt-4 block text-sm font-medium text-white/80">
        First name <span className="text-white/40">(optional, for the big screen)</span>
      </label>
      <input
        id="tower-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={40}
        autoComplete="given-name"
        className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-xl outline-none focus:border-brand-300"
      />
      {error && <p className="mt-3 text-amber-200">{error}</p>}
      <button type="submit" disabled={busy || !handle.trim()} className="btn-tower mt-6 disabled:opacity-50">
        {busy ? 'Saving…' : 'Continue'}
      </button>
      <button type="button" onClick={onBack} className="mt-3 w-full py-2 text-sm text-white/60 underline">
        Back
      </button>
    </form>
  )
}

/** Verified mode: reuses the Layer Rush play-pass webhook, which asks Instagram whether this account follows us. */
function InstagramGate({ onSignedIn }: { onSignedIn: (token: string, player: PlayerView) => void }) {
  const [pass, setPass] = useState<{ ticket: string; dmUrl: string; message: string } | null>(null)
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const signingIn = useRef(false)

  const openPass = useCallback(async () => {
    setError('')
    setReason('')
    setStatus('pending')
    const reply = await callApiWithRetry<{ ticket: string; dmUrl: string; message: string }>(
      '/api/play/ticket',
      { method: 'POST' },
      3
    )
    if (!reply.ok) {
      setError(reply.error)
      return
    }
    storage.set(KEY_PASS, JSON.stringify(reply.data))
    setPass(reply.data)
  }, [])

  useEffect(() => {
    const saved = storage.get(KEY_PASS)
    if (saved) {
      try {
        setPass(JSON.parse(saved))
        return
      } catch {
        storage.remove(KEY_PASS)
      }
    }
    void openPass()
  }, [openPass])

  useEffect(() => {
    if (!pass) return
    let cancelled = false
    const check = async () => {
      if (document.visibilityState === 'hidden' || signingIn.current) return
      const reply = await callApi<{ status: 'pending' | 'verified' | 'rejected'; rejectionReason: string | null }>(
        `/api/play/ticket?ticket=${encodeURIComponent(pass.ticket)}`
      )
      if (cancelled || !reply.ok) return
      setStatus(reply.data.status)
      setReason(reply.data.rejectionReason ?? '')
      if (reply.data.status !== 'verified' || signingIn.current) return
      signingIn.current = true
      const registered = await callApiWithRetry<{ token: string; player: PlayerView }>(
        '/api/tower/register',
        { method: 'POST', body: { passId: pass.ticket } },
        3
      )
      signingIn.current = false
      if (cancelled) return
      if (registered.ok) {
        storage.remove(KEY_PASS)
        onSignedIn(registered.data.token, registered.data.player)
      } else {
        setError(registered.error)
      }
    }
    void check()
    const timer = window.setInterval(() => void check(), 2_500)
    document.addEventListener('visibilitychange', check)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [pass, onSignedIn])

  return (
    <section className="mt-8 space-y-4">
      <StepBadge step={1} />
      <h2 className="text-white font-display text-3xl font-bold leading-tight">Follow us to unlock the game</h2>
      <a
        href={TOWER_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] py-4 text-lg font-semibold"
      >
        <InstagramGlyph /> 1. Follow @{TOWER_HANDLE}
      </a>
      <p className="text-white/75">2. Then send us this message from the same account so Instagram can confirm it:</p>
      <p className="rounded-2xl bg-white/10 py-4 text-center font-display text-3xl tracking-wider">
        {pass?.message ?? 'Opening…'}
      </p>
      <a href={pass?.dmUrl ?? TOWER_INSTAGRAM_URL} className="btn-tower block text-center">
        Send the message
      </a>
      {status === 'pending' && <p className="text-center text-white/60">Waiting for Instagram to confirm…</p>}
      {status === 'rejected' && (
        <div className="space-y-3 text-center">
          <p className="text-amber-200">{reason || 'That account does not follow us yet.'}</p>
          <button type="button" className="underline" onClick={() => void openPass()}>
            Get a new code
          </button>
        </div>
      )}
      {error && <p className="text-amber-200">{error}</p>}
    </section>
  )
}

function HomeScreen({
  player,
  busy,
  onPlay,
  onNextPlayer,
}: {
  player: PlayerView
  busy: boolean
  onPlay: () => void
  onNextPlayer: () => void
}) {
  const { board } = useBoard(6_000)
  const event = board?.event ?? player.event
  const open = event.status === 'open'
  const canPlay = open && player.attemptsLeft > 0 && !player.disqualified

  return (
    <section className="mt-8">
      <p className="text-white/60">Playing as</p>
      <p className="font-display text-3xl font-bold">@{player.handle}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Tries left" value={`${player.attemptsLeft}/${player.attemptsAllowed}`} />
        <Stat label="Best" value={player.best ? String(player.best.score) : '—'} />
        <Stat label="Rank" value={player.rank ? `#${player.rank}` : '—'} />
      </div>

      {event.winner && <WinnerBanner board={board} />}

      {canPlay ? (
        <>
          <button type="button" onClick={onPlay} disabled={busy} className="btn-tower mt-8 py-6 text-2xl disabled:opacity-60">
            {busy ? 'Starting…' : player.best ? 'Play again' : 'Play'}
          </button>
          <HowToPlay />
        </>
      ) : (
        <p className="mt-8 rounded-2xl bg-white/10 p-4 text-lg">
          {!open
            ? 'Entries are closed. Stay close — the winner is announced at the stall!'
            : player.disqualified
              ? 'Please speak to the stall team.'
              : 'All your tries are used. Your best score is on the board — good luck!'}
        </p>
      )}

      <MiniBoard board={board} you={player.handle} />
      <button type="button" onClick={onNextPlayer} className="mt-6 w-full py-3 text-sm text-white/60 underline">
        Not @{player.handle}? Next player
      </button>
    </section>
  )
}

function ResultScreen({
  result,
  player,
  previousBest,
  busy,
  onPlay,
  onNextPlayer,
}: {
  result: RunResult
  player: PlayerView
  previousBest: number | null
  busy: boolean
  onPlay: () => void
  onNextPlayer: () => void
}) {
  const { board } = useBoard(6_000)
  const newBest = previousBest === null || result.score > previousBest
  const canPlay = player.event.status === 'open' && player.attemptsLeft > 0 && !player.disqualified

  return (
    <section className="mt-8 text-center">
      <p className="text-lg text-white/60">{newBest ? '🎉 New personal best!' : 'Nice run!'}</p>
      <p className="mt-1 font-display text-7xl font-bold">{result.score}</p>
      <p className="mt-2 text-white/70">
        {result.layers} layers · {result.perfects} perfect · best streak {result.bestCombo}
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Your best" value={player.best ? String(player.best.score) : String(result.score)} />
        <Stat label="Rank" value={player.rank ? `#${player.rank}` : '—'} />
        <Stat label="Tries left" value={String(player.attemptsLeft)} />
      </div>
      {canPlay ? (
        <button type="button" onClick={onPlay} disabled={busy} className="btn-tower mt-8 py-5 text-xl disabled:opacity-60">
          {busy ? 'Starting…' : `Play again (${player.attemptsLeft} left)`}
        </button>
      ) : (
        <p className="mt-8 rounded-2xl bg-white/10 p-4">
          That&apos;s all your tries. Watch the stall screen — the winner is announced at the end!
        </p>
      )}
      <MiniBoard board={board} you={player.handle} />
      <button type="button" onClick={onNextPlayer} className="btn-tower-ghost mt-6">
        Next player
      </button>
    </section>
  )
}

function SavingScreen({ stuck, onRetry }: { stuck: boolean; onRetry: () => void }) {
  return (
    <section className="mt-20 text-center">
      {!stuck && <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-brand-300" />}
      <p className="mt-6 text-xl">{stuck ? 'Score not sent yet' : 'Saving your score…'}</p>
      {stuck && (
        <button type="button" onClick={onRetry} className="btn-tower mt-6">
          Retry
        </button>
      )}
    </section>
  )
}

// ------------------------------------------------------------------ game

function Countdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => {
    playTick()
    if (count === 0) {
      doneRef.current()
      return
    }
    const timer = window.setTimeout(() => setCount((value) => value - 1), 750)
    return () => window.clearTimeout(timer)
  }, [count])
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-ink text-white">
      <p className="text-white/60">Tap anywhere to drop</p>
      <p key={count} className="mt-4 animate-ping-once font-display text-[9rem] font-bold leading-none">
        {count || 'GO'}
      </p>
    </main>
  )
}

function PlayingScreen({
  run,
  onGameOver,
  muted,
  onToggleMute,
}: {
  run: RunTicket
  onGameOver: (intervals: number[]) => void
  muted: boolean
  onToggleMute: () => void
}) {
  const [score, setScore] = useState(0)
  const [layers, setLayers] = useState(0)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [over, setOver] = useState(false)
  const toastId = useRef(0)

  const handleDrop = useCallback(
    (event: DropEvent) => {
      storage.set(KEY_PENDING, JSON.stringify({ runId: run.runId, intervals: event.intervals } satisfies Pending))
      setScore(event.score)
      setLayers(event.layers)
      if (event.outcome.kind === 'perfect') {
        playPerfect(event.combo)
        buzz(15)
        toastId.current += 1
        setToast({ id: toastId.current, text: event.combo > 1 ? `PERFECT ×${event.combo}` : 'PERFECT' })
      } else if (event.outcome.kind === 'cut') {
        playCut()
        buzz(8)
      } else {
        playMiss()
        buzz(120)
      }
    },
    [run.runId]
  )

  const handleOver = useCallback(
    (intervals: number[]) => {
      setOver(true)
      onGameOver(intervals)
    },
    [onGameOver]
  )

  return (
    <main className="fixed inset-0 overflow-hidden overscroll-none bg-ink text-white">
      <TowerCanvas
        seed={run.seed}
        mode="play"
        onDrop={handleDrop}
        onGameOver={handleOver}
        className="absolute inset-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center pt-[max(1.5rem,env(safe-area-inset-top))]">
        <p className="font-display text-6xl font-bold tabular-nums drop-shadow">{score}</p>
        <p className="text-sm text-white/70">{layers} layers</p>
        {toast && (
          <p key={toast.id} className="mt-3 animate-toast font-display text-2xl font-bold text-amber-200">
            {toast.text}
          </p>
        )}
      </div>
      {over && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 text-center">
          <p className="font-display text-4xl font-bold">Game over</p>
        </div>
      )}
      {layers === 0 && !over && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] animate-pulse text-center text-lg text-white/80">
          Tap anywhere when the slab lines up
        </p>
      )}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onToggleMute}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-black/30 px-3 py-1.5 text-sm"
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </main>
  )
}

// ------------------------------------------------------------------ bits

function StepBadge({ step }: { step: number }) {
  return (
    <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-200">
      Step {step} of 2
    </p>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  )
}

function HowToPlay() {
  return (
    <ul className="mt-6 space-y-2 text-white/75">
      <li>👆 Tap anywhere to drop the sliding slab.</li>
      <li>🎯 Line it up — anything hanging over gets sliced off.</li>
      <li>✨ Perfect drops score bonus points and grow your slab back.</li>
      <li>🏆 Your best try counts. Top score at the end wins!</li>
    </ul>
  )
}

function WinnerBanner({ board }: { board: PublicBoard | null }) {
  const winner = board?.event?.winner
  if (!winner) return null
  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 p-4 text-ink">
      <p className="text-sm font-semibold uppercase tracking-wider">Winner</p>
      <p className="font-display text-2xl font-bold">
        @{winner.handle} · {winner.score}
      </p>
    </div>
  )
}

function MiniBoard({ board, you }: { board: PublicBoard | null; you: string }) {
  if (!board || board.top.length === 0) return null
  return (
    <section className="mt-8 rounded-2xl bg-white/5 p-4 text-left">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Leaderboard</h3>
      <ol className="mt-3 space-y-2">
        {board.top.slice(0, 5).map((row) => (
          <li
            key={row.handle}
            className={`flex items-center justify-between rounded-xl px-3 py-2 ${row.handle === you ? 'bg-brand/40' : ''}`}
          >
            <span className="truncate">
              <span className="mr-2 text-white/50">#{row.rank}</span>@{row.handle}
            </span>
            <span className="font-display font-bold tabular-nums">{row.score}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-white/40">
        {board.players} players · {board.games} games
      </p>
    </section>
  )
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function readPending(): Pending | null {
  const raw = storage.get(KEY_PENDING)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Pending
    if (typeof parsed.runId !== 'string' || !Array.isArray(parsed.intervals)) return null
    return { runId: parsed.runId, intervals: parsed.intervals.filter((value) => Number.isInteger(value)) }
  } catch {
    return null
  }
}

function newStartKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {
    // Older Safari or an insecure origin — fall through.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
