'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_ATTEMPTS, TOWER_HANDLE } from '@/lib/tower/constants'
import { whatsappDigits } from '@/lib/tower/rules'
import type { AdminRound, AdminRunRow, AdminSnapshot } from '@/lib/tower/types'
import { callApi } from '@/components/tower/client-api'
import { QrCode } from '@/components/tower/qr-code'

type Action =
  | { action: 'create-event'; name: string; attemptsPerPlayer: number }
  | { action: 'set-status'; status: 'open' | 'closed' }
  | { action: 'set-attempts'; attemptsPerPlayer: number }
  | { action: 'new-round' }
  | { action: 'start-round' }
  | { action: 'end-round' }
  | { action: 'show-code'; show: boolean }
  | { action: 'announce'; expectedPlayerId?: string }
  | { action: 'unannounce' }
  | { action: 'disqualify'; playerId: string; disqualified: boolean }
  | { action: 'grant-attempt'; playerId: string }
  | { action: 'reset-device'; playerId: string }

/**
 * Host console. The live one is /admin/tower (behind admin login); `npm run dev` without
 * Supabase also serves it at /tower/host against the in-memory store.
 */
export function TowerHostConsole({ apiBase = '/api/admin/tower' }: { apiBase?: string }) {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')

  const refresh = useCallback(async () => {
    const reply = await callApi<{ snapshot: AdminSnapshot }>(apiBase)
    if (reply.ok) {
      setSnapshot(reply.data.snapshot)
      setLoadError('')
    } else {
      setLoadError(reply.error)
    }
  }, [apiBase])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 2_000)
    return () => window.clearInterval(timer)
  }, [refresh])

  async function act(body: Action, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setMessage(null)
    const reply = await callApi<{ message: string }>(apiBase, { method: 'POST', body })
    setBusy(false)
    setMessage(reply.ok ? { tone: 'ok', text: reply.data.message } : { tone: 'error', text: reply.error })
    void refresh()
  }

  const event = snapshot?.event ?? null
  const round = snapshot?.round ?? null
  const query = filter.trim().toLowerCase()
  const players = (snapshot?.players ?? []).filter(
    (player) =>
      !query || player.name.toLowerCase().includes(query) || player.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '') || '§')
  )
  const leader = snapshot?.players.find((player) => player.rank === 1)
  const live = round && round.status !== 'ended' ? round : null
  const stillPlaying = live?.status === 'playing' ? live.joined - live.finished : 0
  const roundRuns = round ? (snapshot?.runs ?? []).filter((run) => run.round === round.number) : []
  const exportUrl = (id: number) => `${apiBase}/export?event=${id}`

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Tathastu Tower</h1>
          <p className="mt-1 text-ink-soft">
            Phones play at{' '}
            <a className="text-brand underline" href="/tower" target="_blank">
              /tower
            </a>
            , the TV shows{' '}
            <a className="text-brand underline" href="/tower/screen" target="_blank">
              /tower/screen
            </a>{' '}
            (press F11).
          </p>
        </div>
        {event && (
          <a href={exportUrl(event.id)} className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink">
            Download CSV (names, WhatsApp, scores)
          </a>
        )}
      </header>

      {loadError && <Banner tone="error" text={loadError} />}
      {message && <Banner tone={message.tone} text={message.text} />}

      {!event && snapshot && (
        <CreateEvent busy={busy} onCreate={(name, attempts) => void act({ action: 'create-event', name, attemptsPerPlayer: attempts })} />
      )}

      {event && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <RoundPanel
            round={round}
            eventOpen={event.status === 'open'}
            busy={busy}
            onNew={() =>
              void act(
                { action: 'new-round' },
                live
                  ? `Round ${live.number} is still ${live.status === 'lobby' ? 'in its lobby' : 'running'}. Close it and open round ${live.number + 1}?`
                  : undefined
              )
            }
            onStart={() =>
              void act(
                { action: 'start-round' },
                round && round.joined === 0 ? 'Nobody has joined yet. Start anyway?' : undefined
              )
            }
            onEnd={() =>
              void act(
                { action: 'end-round' },
                stillPlaying > 0 ? `${stillPlaying} player(s) are still stacking. End the round now? Their games will not count.` : undefined
              )
            }
            onShowCode={(show) => void act({ action: 'show-code', show })}
          />
          <aside className="rounded-2xl border border-gray-200 bg-white p-5 text-ink">
            <h2 className="font-semibold">Stall QR code</h2>
            <QrCode path="/tower" className="mt-3 text-ink" label="QR code for the Tathastu Tower game" />
            <button type="button" onClick={() => window.print()} className="btn-admin-ghost mt-3 w-full">
              Print
            </button>
          </aside>
        </div>
      )}

      {event && round && <RoundTable round={round} runs={roundRuns} />}

      {event && (
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-ink">{event.name}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                event.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {event.status === 'open' ? 'Entries open' : 'Entries closed'}
            </span>
            {event.winner && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Winner announced: {event.winner.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Players" value={snapshot?.players.length ?? 0} />
            <Metric label="Games" value={snapshot?.runs.filter((run) => run.status === 'finished').length ?? 0} />
            <Metric label="Rounds" value={round?.number ?? 0} />
            <Metric label="Leader" value={leader ? `${leader.name} · ${leader.bestScore}` : '—'} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || !leader}
              onClick={() =>
                void act(
                  { action: 'announce', expectedPlayerId: leader?.id },
                  [
                    stillPlaying > 0 ? `${stillPlaying} game(s) are still in progress — end the round first if they should count.` : '',
                    leader?.bestSuspicious
                      ? `⚠ ${leader.name}'s best run has almost every drop perfect — it may be scripted. Watch them play first.`
                      : '',
                    `Announce ${leader ? `${leader.name} (${leader.bestScore})` : 'the top score'} as today's winner? This also closes entries. Check they follow @${TOWER_HANDLE} first.`,
                  ]
                    .filter(Boolean)
                    .join('\n\n')
                )
              }
              className="btn-admin btn-admin-gold"
            >
              🏆 Announce winner
            </button>
            {event.winner && (
              <button type="button" disabled={busy} onClick={() => void act({ action: 'unannounce' })} className="btn-admin-ghost">
                Hide winner
              </button>
            )}
            {event.status === 'open' ? (
              <button type="button" disabled={busy} onClick={() => void act({ action: 'set-status', status: 'closed' })} className="btn-admin-ghost">
                Close entries
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={() => void act({ action: 'set-status', status: 'open' })} className="btn-admin-ghost">
                Reopen entries
              </button>
            )}
            <AttemptsEditor
              value={event.attemptsPerPlayer}
              busy={busy}
              onSave={(attempts) => void act({ action: 'set-attempts', attemptsPerPlayer: attempts })}
            />
          </div>
          <p className="text-sm text-ink-soft">
            Each round: <b>New round</b> → read the code out → wait for names on the TV → <b>Start</b> → podium shows when
            everyone finishes (or press <b>End round</b>). At the end of the day: check the leader follows @{TOWER_HANDLE} →{' '}
            <b>Announce winner</b>. If they don&apos;t follow, hide them and announce again.
          </p>
        </section>
      )}

      {event && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">Players ({snapshot?.players.length ?? 0})</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search name or number"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase text-ink-soft">
                <tr>
                  <th className="py-2">Rank</th>
                  <th>Name</th>
                  <th>WhatsApp</th>
                  <th>Offers</th>
                  <th>Best</th>
                  <th>Rounds</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className={`border-t border-gray-100 ${player.disqualified ? 'opacity-50' : ''}`}>
                    <td className="py-2 font-semibold">{player.rank ? `#${player.rank}` : '—'}</td>
                    <td className="font-medium">{player.name}</td>
                    <td>
                      <a
                        href={`https://wa.me/${whatsappDigits(player.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand underline tabular-nums"
                      >
                        {player.phone}
                      </a>
                    </td>
                    <td>{player.marketingOptIn ? '✅' : '—'}</td>
                    <td className="tabular-nums">
                      {player.bestScore ?? '—'}
                      {player.bestLayers !== null && <span className="text-ink-soft"> · {player.bestLayers}L</span>}
                      {player.bestSuspicious && (
                        <span className="ml-1 text-amber-600" title="Almost every drop perfect — may be scripted. Watch them play before announcing.">
                          ⚠ check
                        </span>
                      )}
                    </td>
                    <td className="tabular-nums">
                      {player.attemptsUsed} played · {player.attemptsLeft} left
                    </td>
                    <td className="space-x-2 whitespace-nowrap text-right">
                      <button type="button" disabled={busy} className="text-brand underline" onClick={() => void act({ action: 'grant-attempt', playerId: player.id })}>
                        +1 round
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-ink-soft underline"
                        title="Signs out their current phone so they can sign in on another one"
                        onClick={() =>
                          void act(
                            { action: 'reset-device', playerId: player.id },
                            `Sign ${player.name} out of their current phone so they can sign in on a new one?`
                          )
                        }
                      >
                        Reset phone
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className={player.disqualified ? 'text-brand underline' : 'text-red-600 underline'}
                        onClick={() =>
                          void act(
                            { action: 'disqualify', playerId: player.id, disqualified: !player.disqualified },
                            player.disqualified ? undefined : `Hide ${player.name} from the big screen and the leaderboard?`
                          )
                        }
                      >
                        {player.disqualified ? 'Restore' : 'Hide'}
                      </button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-ink-soft">
                      No players yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {event && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-ink">New event</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Starting a new event (say, the next exhibition day) closes this one and starts a fresh leaderboard. Old results stay in the
            CSV export.
          </p>
          <CreateEvent
            compact
            busy={busy}
            onCreate={(name, attempts) =>
              void act(
                { action: 'create-event', name, attemptsPerPlayer: attempts },
                `Close "${event.name}" and start "${name || 'Exhibition'}" with a fresh leaderboard?`
              )
            }
          />
          {(snapshot?.pastEvents.length ?? 0) > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-ink-soft">
              {snapshot?.pastEvents.map((past) => (
                <li key={past.id}>
                  {past.name}
                  {past.winner ? ` · winner ${past.winner.name} (${past.winner.score})` : ''} ·{' '}
                  <a className="text-brand underline" href={exportUrl(past.id)}>
                    CSV
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function RoundPanel({
  round,
  eventOpen,
  busy,
  onNew,
  onStart,
  onEnd,
  onShowCode,
}: {
  round: AdminRound | null
  eventOpen: boolean
  busy: boolean
  onNew: () => void
  onStart: () => void
  onEnd: () => void
  onShowCode: (show: boolean) => void
}) {
  const active = round && round.status !== 'ended' ? round : null
  const label = !round
    ? 'No round yet'
    : round.status === 'lobby'
      ? 'Lobby — players are joining'
      : round.status === 'playing'
        ? round.phase === 'results'
          ? 'Everyone finished — podium on screen'
          : 'Playing'
        : 'Ended — podium on screen'

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 text-ink">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            {round ? `Round ${round.number}` : 'Rounds'} · {label}
          </p>
          {active ? (
            <>
              <p className="mt-1 font-display text-7xl font-bold tracking-[0.2em] tabular-nums">{active.secretCode}</p>
              <p className="text-sm text-ink-soft">Read this code out loud. Players type it on their phones.</p>
            </>
          ) : (
            <p className="mt-2 text-lg">
              {eventOpen ? 'Gather the crowd, then open a round to get a code.' : 'Entries are closed. Reopen them to play more rounds.'}
            </p>
          )}
        </div>
        {round && (
          <div className="grid grid-cols-2 gap-3 text-center">
            <Metric label="Joined" value={round.joined} />
            <Metric label="Finished" value={round.finished} />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !eventOpen} onClick={onNew} className={active ? 'btn-admin-ghost' : 'btn-admin'}>
          {round ? '＋ New round' : '＋ Open round 1'}
        </button>
        {active?.status === 'lobby' && (
          <button type="button" disabled={busy} onClick={onStart} className="btn-admin btn-admin-gold text-lg">
            ▶ Start round {active.number}
          </button>
        )}
        {active && (
          <button type="button" disabled={busy} onClick={onEnd} className="btn-admin-ghost">
            ■ End round
          </button>
        )}
        {round && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={round.showCode}
              disabled={busy}
              onChange={(e) => onShowCode(e.target.checked)}
              className="h-4 w-4"
            />
            Show the code on the TV
          </label>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        {round?.showCode
          ? 'The code is on the TV — anyone who can see the screen can join.'
          : 'The code is hidden from the TV, so only people at the stall who hear you can join.'}
      </p>
    </section>
  )
}

function RoundTable({ round, runs }: { round: AdminRound; runs: AdminRunRow[] }) {
  const sorted = [...runs].sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.startedAt - b.startedAt)
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-ink">
        Round {round.number} — {runs.length} {runs.length === 1 ? 'player' : 'players'}
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-ink-soft">
            <tr>
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Status</th>
              <th>Score</th>
              <th>Layers</th>
              <th>Perfect</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((run, index) => (
              <tr key={run.id} className="border-t border-gray-100">
                <td className="py-2 font-semibold">{index + 1}</td>
                <td>{run.name}</td>
                <td>
                  {runStatus(run, round)}
                  {run.rejectReason && <span className="block text-xs text-ink-soft">{run.rejectReason}</span>}
                </td>
                <td className="tabular-nums">
                  {run.score ?? '—'}
                  {run.suspicious && (
                    <span className="ml-1 text-amber-600" title="Almost every drop perfect">
                      ⚠
                    </span>
                  )}
                </td>
                <td className="tabular-nums">{run.layers ?? '—'}</td>
                <td className="tabular-nums">{run.perfects ?? '—'}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink-soft">
                  Nobody has entered the code yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CreateEvent({
  busy,
  compact,
  onCreate,
}: {
  busy: boolean
  compact?: boolean
  onCreate: (name: string, attempts: number) => void
}) {
  const [name, setName] = useState('')
  const [attempts, setAttempts] = useState(DEFAULT_ATTEMPTS)
  return (
    <form
      className={compact ? 'mt-4 flex flex-wrap items-end gap-3' : 'rounded-2xl border border-gray-200 bg-white p-6'}
      onSubmit={(e) => {
        e.preventDefault()
        onCreate(name.trim(), attempts)
      }}
    >
      {!compact && (
        <>
          <h2 className="font-display text-2xl font-bold text-ink">Start the game</h2>
          <p className="mt-1 text-ink-soft">Name the event, choose how many rounds each person can play, and go live.</p>
        </>
      )}
      <div className={compact ? 'flex flex-wrap items-end gap-3' : 'mt-4 flex flex-wrap items-end gap-3'}>
        <label className="text-sm text-ink">
          Event name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exhibition — Day 1"
            maxLength={80}
            className="mt-1 block w-72 rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-ink">
          Rounds per person
          <input
            type="number"
            min={1}
            max={20}
            value={attempts}
            onChange={(e) => setAttempts(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="mt-1 block w-28 rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-admin">
          {compact ? 'Start new event' : 'Go live'}
        </button>
      </div>
    </form>
  )
}

function AttemptsEditor({ value, busy, onSave }: { value: number; busy: boolean; onSave: (value: number) => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      Rounds each
      <input
        type="number"
        min={1}
        max={20}
        value={draft}
        onChange={(e) => setDraft(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
        className="w-16 rounded-lg border border-gray-300 px-2 py-1.5"
      />
      {draft !== value && (
        <button type="button" disabled={busy} onClick={() => onSave(draft)} className="text-brand underline">
          Save
        </button>
      )}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs uppercase text-ink-soft">{label}</p>
      <p className="mt-1 truncate font-display text-xl font-bold text-ink">{value}</p>
    </div>
  )
}

function Banner({ tone, text }: { tone: 'ok' | 'error'; text: string }) {
  return (
    <p className={`rounded-xl px-4 py-3 text-sm ${tone === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
      {text}
    </p>
  )
}

function runStatus(run: AdminRunRow, round: AdminRound): string {
  if (run.status === 'finished') return 'Finished'
  if (run.status === 'rejected') return 'Not counted'
  if (round.status === 'lobby') return 'In lobby'
  return 'Stacking…'
}
