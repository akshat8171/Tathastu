'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NAME_MAX_LENGTH, PROGRESS_INTERVAL_MS, TOWER_HANDLE, TOWER_INSTAGRAM_URL } from '@/lib/tower/constants'
import type { PlayerView, PublicBoard, RunResult } from '@/lib/tower/types'
import { TowerCanvas, type DropEvent } from '@/components/tower/tower-canvas'
import {
  TOKEN_HEADER,
  callApi,
  callApiWithRetry,
  storage,
  useBoard,
  useServerOffset,
  useWakeLock,
} from '@/components/tower/client-api'
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
const KEY_MUTED = 'tower:muted'
/** A latecomer (or a phone that reloaded mid-round) gets this long to get ready. */
const LATE_COUNTDOWN_MS = 3_000

type Screen = 'boot' | 'follow' | 'register' | 'home' | 'lobby' | 'ready' | 'countdown' | 'playing' | 'saving'

interface Pending {
  runId: string
  intervals: number[]
}

interface Game {
  runId: string
  seed: number
  roundId: number
  roundNumber: number
}

export function PlayerApp() {
  const [screen, setScreen] = useState<Screen>('boot')
  const [token, setToken] = useState<string | null>(null)
  const [player, setPlayer] = useState<PlayerView | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [goAtLocal, setGoAtLocal] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState('')
  const [muted, setMuted] = useState(false)
  const offset = useServerOffset()
  const offsetRef = useRef(offset)
  offsetRef.current = offset

  const signOut = useCallback(() => {
    storage.remove(KEY_TOKEN)
    storage.remove(KEY_FOLLOWED)
    storage.remove(KEY_PENDING)
    setToken(null)
    setPlayer(null)
    setGame(null)
    setResult(null)
    setError('')
    setScreen('follow')
  }, [])

  /** "Next player" on a shared phone: release the number on the server so its owner can sign in again later. */
  const handOver = useCallback(() => {
    const saved = storage.get(KEY_TOKEN)
    if (saved) {
      void fetch('/api/tower/logout', { method: 'POST', headers: { [TOKEN_HEADER]: saved }, keepalive: true }).catch(
        () => undefined
      )
    }
    signOut()
  }, [signOut])

  /** Decide which screen a player belongs on, from what the server says about their current round. */
  const route = useCallback((view: PlayerView) => {
    setPlayer(view)
    const current = view.current
    const round = view.round
    if (!current || !round || current.roundId !== round.id || current.status !== 'playing') {
      setScreen('home')
      return
    }
    setGame({ runId: current.runId, seed: current.seed, roundId: current.roundId, roundNumber: current.number })
    if (round.status === 'lobby') {
      setScreen('lobby')
      return
    }
    // The round is on (or over) and this game has not been played yet.
    setScreen('ready')
  }, [])

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
        setScreen('home')
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

  const refresh = useCallback(
    async (activeToken: string) => {
      const reply = await callApi<{ player: PlayerView }>('/api/tower/me', { token: activeToken })
      if (reply.ok) route(reply.data.player)
      else if (reply.status === 401) signOut()
      return reply
    },
    [route, signOut]
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
    if (pending && pending.intervals.length > 0) {
      void submitPending(saved, pending)
      return
    }
    void (async () => {
      const reply = await refresh(saved)
      if (!reply.ok && reply.status !== 401) {
        setError(reply.error)
        setScreen('home')
      }
    })()
  }, [refresh, submitPending])

  const signedIn = useCallback(
    (nextToken: string, view: PlayerView) => {
      storage.set(KEY_TOKEN, nextToken)
      setToken(nextToken)
      setError('')
      route(view)
    },
    [route]
  )

  const joined = useCallback(
    (view: PlayerView) => {
      setResult(null)
      setError('')
      route(view)
    },
    [route]
  )

  /** Count down to a server instant, or give a latecomer a short countdown of their own. */
  const beginCountdown = useCallback((goAtServer: number | null) => {
    const target = goAtServer === null ? 0 : goAtServer - offsetRef.current
    setGoAtLocal(target > Date.now() + 500 ? target : Date.now() + LATE_COUNTDOWN_MS)
    setScreen('countdown')
  }, [])

  const startPlaying = useCallback(() => {
    if (game) storage.set(KEY_PENDING, JSON.stringify({ runId: game.runId, intervals: [] } satisfies Pending))
    setScreen('playing')
  }, [game])

  const finishGame = useCallback(
    (intervals: number[]) => {
      if (!token || !game) return
      const pending: Pending = { runId: game.runId, intervals }
      storage.set(KEY_PENDING, JSON.stringify(pending))
      // Let the last slab tumble before the score card slides in.
      window.setTimeout(() => void submitPending(token, pending), 900)
    },
    [token, game, submitPending]
  )

  const toggleMute = () => {
    const next = !isTowerMuted()
    setTowerMuted(next)
    setMuted(next)
    storage.set(KEY_MUTED, next ? '1' : '0')
  }

  useWakeLock(screen === 'lobby' || screen === 'countdown' || screen === 'playing')

  if (screen === 'countdown' && game) {
    return <Countdown goAtLocal={goAtLocal} roundNumber={game.roundNumber} onDone={startPlaying} />
  }
  if (screen === 'playing' && game && token) {
    return <PlayingScreen game={game} token={token} onGameOver={finishGame} muted={muted} onToggleMute={toggleMute} />
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
        {screen === 'follow' && <FollowStep onNext={() => setScreen('register')} />}
        {screen === 'register' && <RegisterStep onSignedIn={signedIn} onBack={() => setScreen('follow')} />}
        {screen === 'home' && player && token && (
          <HomeScreen player={player} token={token} result={result} onJoined={joined} onNextPlayer={handOver} />
        )}
        {screen === 'home' && !player && (
          <button type="button" onClick={() => window.location.reload()} className="btn-tower mt-10">
            Try again
          </button>
        )}
        {screen === 'lobby' && player && game && token && (
          <LobbyScreen
            player={player}
            game={game}
            onStart={beginCountdown}
            onRoundGone={() => {
              setError('The host closed that round. Enter the new code when it is called.')
              void refresh(token)
            }}
          />
        )}
        {screen === 'ready' && game && (
          <ReadyScreen
            roundNumber={game.roundNumber}
            onGo={() => {
              unlockTowerAudio()
              beginCountdown(null)
            }}
          />
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
        Stack the tallest tower and win a 3D-printed keepsake. Everyone plays together when the host says go!
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
        {opened ? "I'm following — next" : 'Follow first, then come back here'}
      </button>
      <p className="mt-4 text-center text-sm text-white/50">We check the winner&apos;s follow before handing over the prize.</p>
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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (busy) return
    unlockTowerAudio()
    setBusy(true)
    setError('')
    const reply = await callApiWithRetry<{ token: string; player: PlayerView }>(
      '/api/tower/register',
      { method: 'POST', body: { name, phone, marketingOptIn: optIn } },
      3
    )
    setBusy(false)
    if (!reply.ok) {
      setError(reply.error)
      return
    }
    onSignedIn(reply.data.token, reply.data.player)
  }

  const digits = phone.replace(/\D/g, '')
  const ready = name.trim().length >= 2 && digits.length >= 10

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
      <p className="mt-2 text-white/70">Your name goes on the big screen. We WhatsApp the winner.</p>

      <label htmlFor="tower-name" className="mt-6 block text-sm font-medium text-white/80">
        Your name
      </label>
      <input
        id="tower-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={NAME_MAX_LENGTH}
        autoComplete="given-name"
        autoCapitalize="words"
        required
        placeholder="Priya"
        className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-4 text-xl outline-none placeholder:text-white/30 focus:border-brand-300"
      />

      <label htmlFor="tower-phone" className="mt-4 block text-sm font-medium text-white/80">
        WhatsApp number
      </label>
      <div className="mt-2 flex items-center rounded-2xl border border-white/20 bg-white/5 px-4 focus-within:border-brand-300">
        <span className="text-xl text-white/50">+91</span>
        <input
          id="tower-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/[^\d+ -]/g, '').slice(0, 18))}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder="98765 43210"
          className="w-full bg-transparent px-2 py-4 text-xl tracking-wide outline-none placeholder:text-white/30"
        />
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-white/75">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(event) => setOptIn(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-300"
        />
        Also send me Tathastu Keepsakes offers on WhatsApp
      </label>
      <p className="mt-3 text-xs text-white/45">
        We use your number to contact you if you win{optIn ? ' and for offers you asked for' : ''}. It never shows on
        the screen.
      </p>

      {error && <p className="mt-3 text-amber-200">{error}</p>}
      <button type="submit" disabled={busy || !ready} className="btn-tower mt-6 disabled:opacity-50">
        {busy ? 'Saving…' : 'Continue'}
      </button>
      <button type="button" onClick={onBack} className="mt-3 w-full py-2 text-sm text-white/60 underline">
        Back
      </button>
    </form>
  )
}

/** Enter the code the host reads out. The game only starts after this. */
function CodeEntry({ token, onJoined }: { token: string; onJoined: (player: PlayerView) => void }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function submit(value: string) {
    if (busy || value.length !== 4) return
    unlockTowerAudio()
    setBusy(true)
    setError('')
    const reply = await callApiWithRetry<{ player: PlayerView }>(
      '/api/tower/join',
      { method: 'POST', token, body: { code: value } },
      3
    )
    setBusy(false)
    if (!reply.ok) {
      setError(reply.error)
      setCode('')
      buzz(80)
      inputRef.current?.focus()
      return
    }
    buzz(20)
    onJoined(reply.data.player)
  }

  return (
    <form
      className="mt-6 rounded-3xl bg-white/10 p-5 text-center"
      onSubmit={(event) => {
        event.preventDefault()
        void submit(code)
      }}
    >
      <StepBadge step={3} />
      <label htmlFor="tower-code" className="mt-3 block font-display text-2xl font-bold">
        Enter the game code
      </label>
      <p className="mt-1 text-sm text-white/65">The host will call it out when the next round opens.</p>
      <input
        ref={inputRef}
        id="tower-code"
        value={code}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, '').slice(0, 4)
          setCode(next)
          if (next.length === 4) void submit(next)
        }}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={4}
        placeholder="••••"
        aria-describedby="tower-code-error"
        className="mx-auto mt-4 block w-52 rounded-2xl border-2 border-white/25 bg-ink/60 py-4 text-center font-display text-5xl tracking-[0.4em] outline-none placeholder:text-white/25 focus:border-amber-300"
      />
      <p id="tower-code-error" role="alert" className="mt-3 min-h-[1.5rem] text-amber-200">
        {error}
      </p>
      <button type="submit" disabled={busy || code.length !== 4} className="btn-tower mt-1 disabled:opacity-50">
        {busy ? 'Joining…' : 'Join the round'}
      </button>
    </form>
  )
}

function HomeScreen({
  player,
  token,
  result,
  onJoined,
  onNextPlayer,
}: {
  player: PlayerView
  token: string
  result: RunResult | null
  onJoined: (player: PlayerView) => void
  onNextPlayer: () => void
}) {
  const { board } = useBoard(3_000)
  const event = board?.event ?? player.event
  const round = board?.round ?? player.round
  const open = event.status === 'open'
  const canJoin = open && player.attemptsLeft > 0 && !player.disqualified
  const thisRound = player.current && round && player.current.roundId === round.id ? player.current : null
  const roundOpen = round && round.status !== 'ended' && !thisRound

  return (
    <section className="mt-6">
      {result && thisRound && <RoundResult result={result} player={player} board={board} />}
      {!result && (
        <>
          <p className="text-white/60">Playing as</p>
          <p className="font-display text-3xl font-bold">{player.name}</p>
          <p className="text-sm text-white/45">{player.phoneHint}</p>
        </>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Rounds left" value={`${player.attemptsLeft}/${player.attemptsAllowed}`} />
        <Stat label="Best" value={player.best ? String(player.best.score) : '—'} />
        <Stat label="Today" value={player.rank ? `#${player.rank}` : '—'} />
      </div>

      {event.winner && <WinnerBanner board={board} />}

      {canJoin ? (
        <>
          {roundOpen && (
            <p className="mt-6 animate-pulse rounded-2xl bg-amber-300/20 px-4 py-3 text-center font-semibold text-amber-100">
              Round {round.number} is open — enter the code!
            </p>
          )}
          <CodeEntry token={token} onJoined={onJoined} />
          {!player.best && <HowToPlay />}
        </>
      ) : (
        <p className="mt-8 rounded-2xl bg-white/10 p-4 text-lg">
          {!open
            ? 'Entries are closed. Stay close — the winner is announced at the stall!'
            : player.disqualified
              ? 'Please speak to the stall team.'
              : 'You have played all your rounds. Your best score is on the board — good luck!'}
        </p>
      )}

      <MiniBoard board={board} />
      <button type="button" onClick={onNextPlayer} className="mt-6 w-full py-3 text-sm text-white/60 underline">
        Not {player.name}? Next player
      </button>
    </section>
  )
}

function RoundResult({ result, player, board }: { result: RunResult; player: PlayerView; board: PublicBoard | null }) {
  const current = player.current
  const newBest = !player.best || result.score >= player.best.score
  const inRound = board?.round && current && board.round.id === current.roundId ? board.round.joined : null
  return (
    <div className="text-center">
      <p className="text-lg text-white/60">{newBest ? '🎉 Your best yet!' : 'Nice stacking!'}</p>
      <p className="mt-1 font-display text-7xl font-bold">{result.score}</p>
      <p className="mt-2 text-white/70">
        {result.layers} layers · {result.perfects} perfect · best streak {result.bestCombo}
      </p>
      {current?.rank && (
        <p className="mt-3 inline-block rounded-full bg-brand/40 px-4 py-1.5 font-semibold">
          #{current.rank}
          {inRound ? ` of ${inRound}` : ''} in round {current.number}
        </p>
      )}
      <p className="mt-2 text-sm text-white/50">Watch the big screen for the podium!</p>
    </div>
  )
}

function LobbyScreen({
  player,
  game,
  onStart,
  onRoundGone,
}: {
  player: PlayerView
  game: Game
  onStart: (goAtServer: number | null) => void
  onRoundGone: () => void
}) {
  const { board } = useBoard(1_500)
  const started = useRef(false)
  const round = board?.round

  useEffect(() => {
    if (!round || started.current) return
    if (round.id !== game.roundId) {
      started.current = true
      onRoundGone()
      return
    }
    if (round.status === 'playing' || round.status === 'ended') {
      started.current = true
      onStart(round.goAt)
    }
  }, [round, game.roundId, onStart, onRoundGone])

  const names = board?.roundRows.map((row) => row.name) ?? []

  return (
    <section className="mt-10 text-center">
      <p className="text-6xl">✅</p>
      <h2 className="text-white mt-4 font-display text-3xl font-bold">You&apos;re in, {player.name}!</h2>
      <p className="mt-2 text-lg text-white/75">Look for your name on the big screen.</p>
      <div className="mx-auto mt-8 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
      <p className="mt-4 text-white/70">Waiting for the host to start round {game.roundNumber}…</p>
      <p className="mt-1 text-sm text-white/50">Keep this screen open. Turn your sound on!</p>
      {names.length > 0 && (
        <div className="mt-8 rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">{round?.joined ?? names.length} players in</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{names.slice(0, 30).join(' · ')}</p>
        </div>
      )}
      <HowToPlay />
    </section>
  )
}

function ReadyScreen({ roundNumber, onGo }: { roundNumber: number; onGo: () => void }) {
  return (
    <section className="mt-16 text-center">
      <h2 className="text-white font-display text-4xl font-bold">Round {roundNumber} is on!</h2>
      <p className="mt-3 text-lg text-white/75">Your tower is waiting. Tap when you&apos;re ready.</p>
      <button type="button" onClick={onGo} className="btn-tower mt-10 py-6 text-2xl">
        Start my game
      </button>
      <HowToPlay />
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

function Countdown({ goAtLocal, roundNumber, onDone }: { goAtLocal: number; roundNumber: number; onDone: () => void }) {
  const [left, setLeft] = useState(() => Math.max(0, Math.ceil((goAtLocal - Date.now()) / 1000)))
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let last = -1
    let finished = false
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((goAtLocal - Date.now()) / 1000))
      if (remaining !== last) {
        last = remaining
        setLeft(remaining)
        if (remaining <= 3) playTick()
      }
      if (remaining === 0 && !finished) {
        finished = true
        doneRef.current()
      }
    }
    tick()
    const timer = window.setInterval(tick, 100)
    return () => window.clearInterval(timer)
  }, [goAtLocal])

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-ink text-white">
      <p className="text-lg uppercase tracking-[0.3em] text-amber-200">Round {roundNumber}</p>
      <p className="mt-2 text-white/60">Tap anywhere to drop</p>
      <p key={left} className="mt-4 animate-ping-once font-display text-[9rem] font-bold leading-none">
        {left || 'GO'}
      </p>
    </main>
  )
}

function PlayingScreen({
  game,
  token,
  onGameOver,
  muted,
  onToggleMute,
}: {
  game: Game
  token: string
  onGameOver: (intervals: number[]) => void
  muted: boolean
  onToggleMute: () => void
}) {
  const [score, setScore] = useState(0)
  const [layers, setLayers] = useState(0)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [over, setOver] = useState(false)
  const toastId = useRef(0)
  const lastSent = useRef(0)
  const latest = useRef({ score: 0, layers: 0 })

  /** Fire-and-forget live score for the big screen. Never blocks or retries — the game must not lag. */
  const sendProgress = useCallback(
    (force = false) => {
      const now = Date.now()
      if (!force && now - lastSent.current < PROGRESS_INTERVAL_MS) return
      lastSent.current = now
      void fetch('/api/tower/run/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [TOKEN_HEADER]: token },
        body: JSON.stringify({ runId: game.runId, ...latest.current }),
        keepalive: true,
      }).catch(() => undefined)
    },
    [game.runId, token]
  )

  useEffect(() => {
    const timer = window.setInterval(() => sendProgress(), PROGRESS_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [sendProgress])

  const handleDrop = useCallback(
    (event: DropEvent) => {
      storage.set(KEY_PENDING, JSON.stringify({ runId: game.runId, intervals: event.intervals } satisfies Pending))
      setScore(event.score)
      setLayers(event.layers)
      latest.current = { score: event.score, layers: event.layers }
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
    [game.runId]
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
      <TowerCanvas seed={game.seed} mode="play" onDrop={handleDrop} onGameOver={handleOver} className="absolute inset-0" />
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
      Step {step} of 3
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
    <ul className="mt-6 space-y-2 text-left text-white/75">
      <li>👆 Tap anywhere to drop the sliding slab.</li>
      <li>🎯 Line it up — anything hanging over gets sliced off.</li>
      <li>✨ Perfect drops score bonus points and grow your slab back.</li>
      <li>🏆 Everyone in the round stacks the same tower. Top score today wins!</li>
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
        {winner.name} · {winner.score}
      </p>
    </div>
  )
}

function MiniBoard({ board }: { board: PublicBoard | null }) {
  if (!board || board.top.length === 0) return null
  return (
    <section className="mt-8 rounded-2xl bg-white/5 p-4 text-left">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Today&apos;s top stackers</h3>
      <ol className="mt-3 space-y-2">
        {board.top.slice(0, 5).map((row) => (
          <li key={`${row.rank}-${row.name}`} className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="truncate">
              <span className="mr-2 text-white/50">#{row.rank}</span>
              {row.name}
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
