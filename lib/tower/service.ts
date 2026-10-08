import 'server-only'

import { createHash, randomBytes, randomInt } from 'crypto'
import { loadPass } from '@/lib/play/repository'
import { DEFAULT_ATTEMPTS } from '@/lib/tower/constants'
import { replayRun } from '@/lib/tower/engine'
import {
  countLeadersAbove,
  loadEventById,
  countPlayers,
  countRuns,
  finishRun,
  insertEvent,
  insertRun,
  listAllRuns,
  listPlayerRuns,
  listPlayers,
  listRecentFinished,
  listRuns,
  loadAllLeaders,
  loadEvents,
  loadLatestEvent,
  loadLeaders,
  loadPlayer,
  loadPlayerByToken,
  loadRun,
  updateEvent,
  updatePlayer,
  upsertPlayer,
  type EventRow,
  type PlayerRow,
  type RunRow,
} from '@/lib/tower/repository'
import { attemptsLeft, checkRunTiming, clampIntervals, isSuspiciousRun, normalizeHandle } from '@/lib/tower/rules'
import type {
  AdminPlayerRow,
  AdminRunRow,
  AdminSnapshot,
  ApiResult,
  FollowCheckMode,
  PlayerView,
  PublicBoard,
  PublicEvent,
  RunResult,
  RunTicket,
} from '@/lib/tower/types'

/** A double-tap on Start inside this window returns the same game instead of burning a try. */
const START_DEBOUNCE_MS = 4_000
const BOARD_CACHE_MS = 1_500
const BOARD_SIZE = 10

export function getFollowCheckMode(): FollowCheckMode {
  return process.env.TOWER_FOLLOW_CHECK?.trim().toLowerCase() === 'instagram' ? 'instagram' : 'honor'
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ---------------------------------------------------------------- players

export async function registerPlayer(input: {
  handle?: string
  displayName?: string
  passId?: string
}): Promise<ApiResult<{ token: string; player: PlayerView }>> {
  const live = await openEvent()
  if (!live.ok) return live
  const mode = getFollowCheckMode()

  let handle: string | null = null
  let passId: string | null = null
  if (mode === 'instagram') {
    if (!input.passId) return { ok: false, error: 'Follow and send the PLAY message first.', status: 400 }
    const pass = await loadPass(input.passId)
    if (!pass || pass.status !== 'verified') {
      return { ok: false, error: pass?.rejectionReason || 'Instagram has not confirmed your follow yet.', status: 403 }
    }
    handle = pass.igUsername ? normalizeHandle(pass.igUsername) : null
    passId = pass.id
    if (!handle) return { ok: false, error: 'Instagram did not share your username. Ask at the stall.', status: 403 }
  } else {
    handle = normalizeHandle(input.handle ?? '')
    if (!handle) return { ok: false, error: 'Enter your Instagram username, like @yourname.', status: 400 }
  }

  const displayName = cleanName(input.displayName)
  const token = randomBytes(24).toString('base64url')
  const saved = await upsertPlayer({
    eventId: live.event.id,
    handle,
    displayName,
    followCheck: mode,
    playPassId: passId,
    tokenHash: hashToken(token),
    // Instagram proved who they are, so a new phone may take over. In honor mode a typed
    // handle that is already playing elsewhere needs the host to reset it first.
    allowRelink: mode === 'instagram',
  })
  if (!saved.ok && saved.code === 'handle-taken') {
    return {
      ok: false,
      error: `@${handle} is already playing on another phone. If that's you, ask the stall team to reset it.`,
      status: 409,
    }
  }
  if (!saved.ok) return { ok: false, error: saved.error, status: 500 }
  const player = await viewPlayer(saved.player, live.event)
  return { ok: true, token, player }
}

export async function getPlayer(token: string): Promise<ApiResult<{ player: PlayerView }>> {
  const found = await playerForToken(token)
  if (!found.ok) return found
  return { ok: true, player: await viewPlayer(found.player, found.event) }
}

/** "Next player": drop this phone's token so the handle can be signed into again later. */
export async function releasePlayer(token: string): Promise<ApiResult<{ released: boolean }>> {
  if (!token || token.length < 20 || token.length > 100) return { ok: true, released: false }
  const player = await loadPlayerByToken(hashToken(token))
  if (!player) return { ok: true, released: false }
  const cleared = await updatePlayer(player.id, { clearToken: true })
  return cleared.ok ? { ok: true, released: true } : { ok: false, error: cleared.error, status: 500 }
}

// ---------------------------------------------------------------- runs

export async function startRun(
  token: string,
  startKey: string | null = null
): Promise<ApiResult<{ run: RunTicket; player: PlayerView }>> {
  const found = await playerForToken(token)
  if (!found.ok) return found
  const { player, event } = found
  if (player.disqualified) return { ok: false, error: 'Please speak to the stall team.', status: 403 }

  const runs = await listPlayerRuns(player.id)
  // A retried or slow "Play" request carries the same key — hand back the run it already created.
  const retried = startKey ? runs.find((run) => run.startKey === startKey) : undefined
  if (retried) {
    if (retried.status !== 'playing') return { ok: false, error: 'That game has already finished.', status: 409 }
    return { ok: true, run: ticketFor(retried), player: await viewPlayer(player, event, runs) }
  }
  if (event.status !== 'open') return { ok: false, error: 'Entries are closed for this event.', status: 409 }

  const latest = runs[runs.length - 1]
  if (
    latest &&
    latest.status === 'playing' &&
    !latest.finishedAt &&
    Date.now() - Date.parse(latest.startedAt) < START_DEBOUNCE_MS
  ) {
    return { ok: true, run: ticketFor(latest), player: await viewPlayer(player, event, runs) }
  }

  const left = attemptsLeft({ allowed: event.attemptsPerPlayer, bonus: player.bonusAttempts, used: runs.length })
  if (left <= 0) return { ok: false, error: 'You have used all your tries. Good luck in the draw!', status: 409 }

  const attempt = runs.reduce((max, run) => Math.max(max, run.attempt), 0) + 1
  const saved = await insertRun({
    eventId: event.id,
    playerId: player.id,
    attempt,
    seed: randomInt(1, 2_147_483_647),
    startKey,
  })
  if (!saved.ok && saved.code === '23505' && startKey) {
    // The same key raced in twice at once — return the run the other request created.
    const again = (await listPlayerRuns(player.id)).find((run) => run.startKey === startKey)
    if (again?.status === 'playing') return { ok: true, run: ticketFor(again), player: await viewPlayer(player, event) }
  }
  if (!saved.ok) {
    const status = saved.code === '23505' ? 409 : 500
    return { ok: false, error: status === 409 ? 'A game is already starting on another screen.' : saved.error, status }
  }
  invalidateBoard()
  return { ok: true, run: ticketFor(saved.run), player: await viewPlayer(player, event, [...runs, saved.run]) }
}

export async function submitRun(input: {
  token: string
  runId: string
  intervalsMs: number[]
}): Promise<ApiResult<{ result: RunResult; player: PlayerView }>> {
  // Any event, not just the latest: a game still running when the host starts a new event
  // must still be recorded against the event it was played in.
  const found = await playerForToken(input.token, { anyEvent: true })
  if (!found.ok) return found
  const { player, event } = found
  const intervalsMs = clampIntervals(input.intervalsMs)
  const run = await loadRun(input.runId)
  if (!run || run.playerId !== player.id) return { ok: false, error: 'That game is not yours.', status: 404 }

  if (run.status === 'finished') {
    return { ok: true, result: resultOf(run), player: await viewPlayer(player, event) }
  }
  if (run.status === 'rejected') {
    if (run.score !== null) return { ok: true, result: resultOf(run), player: await viewPlayer(player, event) }
    return { ok: false, error: run.rejectReason || 'This game could not be counted.', status: 409 }
  }

  const timingError = checkRunTiming({
    intervalsMs,
    startedAtMs: Date.parse(run.startedAt),
    nowMs: Date.now(),
  })
  if (timingError) {
    await finishRun(run.id, { status: 'rejected', intervalsMs, reason: timingError })
    invalidateBoard()
    return { ok: false, error: timingError, status: 422 }
  }

  const summary = replayRun(run.seed, intervalsMs)
  const stats = {
    intervalsMs: intervalsMs.slice(0, summary.used),
    score: summary.score,
    layers: summary.layers,
    perfects: summary.perfects,
    bestCombo: summary.bestCombo,
  }
  // Once the winner is on the big screen, a game that ends later cannot overtake them.
  // It is still stored (with its score) so every game stays tracked.
  const saved = event.announcedAt
    ? await finishRun(run.id, { status: 'rejected', reason: 'Finished after the winner was announced.', ...stats })
    : await finishRun(run.id, { status: 'finished', ...stats })
  if (!saved.ok) return { ok: false, error: saved.error, status: 500 }
  invalidateBoard()

  if (!saved.updated) {
    // Lost a race with a retry of the same submission — return whatever was stored first.
    const stored = await loadRun(run.id)
    if (stored?.status === 'finished' || (stored?.status === 'rejected' && stored.score !== null)) {
      return { ok: true, result: resultOf(stored), player: await viewPlayer(player, event) }
    }
    return { ok: false, error: stored?.rejectReason || 'This game could not be counted.', status: 409 }
  }

  const result: RunResult = {
    score: summary.score,
    layers: summary.layers,
    perfects: summary.perfects,
    bestCombo: summary.bestCombo,
  }
  return { ok: true, result, player: await viewPlayer(player, event) }
}

// ---------------------------------------------------------------- public board

let boardCache: { at: number; board: PublicBoard } | null = null

function invalidateBoard(): void {
  boardCache = null
}

export async function loadBoard(): Promise<ApiResult<{ board: PublicBoard }>> {
  const now = Date.now()
  if (boardCache && now - boardCache.at < BOARD_CACHE_MS) {
    return { ok: true, board: { ...boardCache.board, serverNow: now } }
  }
  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  const event = latest.event
  if (!event) {
    const board: PublicBoard = { serverNow: now, event: null, top: [], players: 0, games: 0, playingNow: 0, recent: [] }
    return { ok: true, board }
  }

  const liveSince = new Date(now - 3 * 60_000).toISOString()
  const [leaders, players, games, playingNow, recent] = await Promise.all([
    loadLeaders(event.id, BOARD_SIZE),
    countPlayers(event.id),
    countRuns(event.id, 'finished'),
    countRuns(event.id, 'playing', liveSince),
    listRecentFinished(event.id, 6),
  ])

  const board: PublicBoard = {
    serverNow: now,
    event: publicEvent(event, leaders.find((row) => row.playerId === event.winnerPlayerId) ?? null),
    top: leaders.map((row, index) => ({
      rank: index + 1,
      handle: row.handle,
      displayName: row.displayName,
      score: row.score,
      layers: row.layers,
      perfects: row.perfects,
    })),
    players,
    games,
    playingNow,
    recent: recent.map((run) => ({
      handle: run.handle,
      score: run.score ?? 0,
      layers: run.layers ?? 0,
      finishedAt: run.finishedAt ? Date.parse(run.finishedAt) : 0,
    })),
  }
  boardCache = { at: now, board }
  return { ok: true, board }
}

// ---------------------------------------------------------------- admin

export async function adminSnapshot(): Promise<ApiResult<{ snapshot: AdminSnapshot }>> {
  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  const events = await loadEvents()
  const event = latest.event
  const snapshot: AdminSnapshot = {
    serverNow: Date.now(),
    followCheck: getFollowCheckMode(),
    event: event ? publicEvent(event, null) : null,
    pastEvents: events.filter((row) => row.id !== event?.id).map((row) => publicEvent(row, null)),
    players: [],
    runs: [],
  }
  if (!event) return { ok: true, snapshot }

  const [players, leaders, runs, allRuns] = await Promise.all([
    listPlayers(event.id),
    loadAllLeaders(event.id),
    listRuns(event.id, 200),
    listAllRuns(event.id),
  ])
  const handles = new Map(players.map((player) => [player.id, player.handle]))
  const used = new Map<string, number>()
  for (const run of allRuns) used.set(run.playerId, (used.get(run.playerId) ?? 0) + 1)

  const ranks = new Map<string, number>()
  leaders.filter((row) => !row.disqualified).forEach((row, index) => ranks.set(row.playerId, index + 1))
  const bests = new Map(leaders.map((row) => [row.playerId, row]))

  const winner = leaders.find((row) => row.playerId === event.winnerPlayerId) ?? null
  snapshot.event = publicEvent(event, winner)
  snapshot.players = players
    .map((player): AdminPlayerRow => {
      const usedCount = used.get(player.id) ?? 0
      const best = bests.get(player.id)
      return {
        id: player.id,
        handle: player.handle,
        displayName: player.displayName,
        followCheck: player.followCheck,
        disqualified: player.disqualified,
        bonusAttempts: player.bonusAttempts,
        attemptsUsed: usedCount,
        attemptsLeft: attemptsLeft({ allowed: event.attemptsPerPlayer, bonus: player.bonusAttempts, used: usedCount }),
        bestScore: best?.score ?? null,
        bestLayers: best?.layers ?? null,
        bestSuspicious: best ? isSuspiciousRun(best) : false,
        rank: ranks.get(player.id) ?? null,
        createdAt: Date.parse(player.createdAt),
      }
    })
    .sort((left, right) => (left.rank ?? Infinity) - (right.rank ?? Infinity) || right.createdAt - left.createdAt)
  snapshot.runs = runs.map(
    (run): AdminRunRow => ({
      id: run.id,
      handle: handles.get(run.playerId) ?? '?',
      attempt: run.attempt,
      status: run.status,
      score: run.score,
      layers: run.layers,
      perfects: run.perfects,
      startedAt: Date.parse(run.startedAt),
      finishedAt: run.finishedAt ? Date.parse(run.finishedAt) : null,
      rejectReason: run.rejectReason,
      suspicious: run.status === 'finished' && isSuspiciousRun(run),
    })
  )
  return { ok: true, snapshot }
}

export type AdminAction =
  | { action: 'create-event'; name: string; attemptsPerPlayer: number }
  | { action: 'set-status'; status: 'open' | 'closed' }
  | { action: 'set-attempts'; attemptsPerPlayer: number }
  | { action: 'announce'; expectedPlayerId?: string }
  | { action: 'unannounce' }
  | { action: 'disqualify'; playerId: string; disqualified: boolean }
  | { action: 'grant-attempt'; playerId: string }
  | { action: 'reset-device'; playerId: string }

export async function runAdminAction(input: AdminAction): Promise<ApiResult<{ message: string }>> {
  if (input.action === 'create-event') {
    const created = await insertEvent({
      name: input.name.trim() || 'Exhibition',
      attemptsPerPlayer: input.attemptsPerPlayer || DEFAULT_ATTEMPTS,
    })
    invalidateBoard()
    return created.ok ? { ok: true, message: `"${created.event.name}" is live.` } : { ok: false, error: created.error }
  }

  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  const event = latest.event
  if (!event) return { ok: false, error: 'Start an event first.', status: 409 }

  let outcome: { ok: true } | { ok: false; error: string }
  let message = 'Saved.'
  switch (input.action) {
    case 'set-status':
      outcome = await updateEvent(event.id, { status: input.status })
      message = input.status === 'open' ? 'Entries are open.' : 'Entries closed. Games already running can still finish.'
      break
    case 'set-attempts':
      outcome = await updateEvent(event.id, { attemptsPerPlayer: input.attemptsPerPlayer })
      message = `Everyone now gets ${input.attemptsPerPlayer} tries.`
      break
    case 'announce': {
      const [leader] = await loadLeaders(event.id, 1)
      if (!leader) return { ok: false, error: 'Nobody has a score yet.', status: 409 }
      if (input.expectedPlayerId && leader.playerId !== input.expectedPlayerId) {
        return {
          ok: false,
          error: `The leaderboard just changed — @${leader.handle} now leads with ${leader.score}. Check and announce again.`,
          status: 409,
        }
      }
      outcome = await updateEvent(event.id, {
        status: 'closed',
        winnerPlayerId: leader.playerId,
        winnerHandle: leader.handle,
        winnerScore: leader.score,
        announcedAt: new Date().toISOString(),
      })
      message = `Winner: @${leader.handle} with ${leader.score}. The stall screen is celebrating.`
      break
    }
    case 'unannounce':
      outcome = await updateEvent(event.id, {
        winnerPlayerId: null,
        winnerHandle: null,
        winnerScore: null,
        announcedAt: null,
      })
      message = 'Winner hidden. The screen is back on the leaderboard.'
      break
    case 'disqualify': {
      const player = await loadPlayer(input.playerId)
      if (!player || player.eventId !== event.id) return { ok: false, error: 'Player not found.', status: 404 }
      outcome = await updatePlayer(player.id, { disqualified: input.disqualified })
      message = input.disqualified
        ? `@${player.handle} removed from the leaderboard.`
        : `@${player.handle} is back on the leaderboard.`
      break
    }
    case 'grant-attempt': {
      const player = await loadPlayer(input.playerId)
      if (!player || player.eventId !== event.id) return { ok: false, error: 'Player not found.', status: 404 }
      outcome = await updatePlayer(player.id, { bonusAttempts: player.bonusAttempts + 1 })
      message = `@${player.handle} has one more try.`
      break
    }
    case 'reset-device': {
      const player = await loadPlayer(input.playerId)
      if (!player || player.eventId !== event.id) return { ok: false, error: 'Player not found.', status: 404 }
      outcome = await updatePlayer(player.id, { clearToken: true })
      message = `@${player.handle} can now sign in on a new phone (the old phone is signed out).`
      break
    }
  }
  invalidateBoard()
  return outcome.ok ? { ok: true, message } : { ok: false, error: outcome.error }
}

export async function exportEventCsv(eventId?: number): Promise<ApiResult<{ filename: string; csv: string }>> {
  let event: EventRow | null = null
  if (eventId) {
    event = (await loadEvents(200)).find((row) => row.id === eventId) ?? null
  } else {
    const latest = await loadLatestEvent()
    if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
    event = latest.event
  }
  if (!event) return { ok: false, error: 'No event to export.', status: 404 }

  const [players, runs] = await Promise.all([listPlayers(event.id), listAllRuns(event.id)])
  const byId = new Map(players.map((player) => [player.id, player]))
  const header = [
    'instagram',
    'name',
    'follow_check',
    'disqualified',
    'attempt',
    'status',
    'score',
    'layers',
    'perfects',
    'best_combo',
    'started_at',
    'finished_at',
    'reject_reason',
  ]
  const lines = [header.join(',')]
  for (const run of runs) {
    const player = byId.get(run.playerId)
    lines.push(
      [
        player ? `@${player.handle}` : '',
        player?.displayName ?? '',
        player?.followCheck ?? '',
        player?.disqualified ? 'yes' : 'no',
        run.attempt,
        run.status,
        run.score ?? '',
        run.layers ?? '',
        run.perfects ?? '',
        run.bestCombo ?? '',
        run.startedAt,
        run.finishedAt ?? '',
        run.rejectReason ?? '',
      ]
        .map(csvCell)
        .join(',')
    )
  }
  const played = new Set(runs.map((run) => run.playerId))
  for (const player of players) {
    if (played.has(player.id)) continue
    lines.push(
      [`@${player.handle}`, player.displayName ?? '', player.followCheck, player.disqualified ? 'yes' : 'no', '', 'not played']
        .map(csvCell)
        .join(',')
    )
  }
  const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'
  return { ok: true, filename: `tathastu-tower-${slug}-${event.id}.csv`, csv: lines.join('\n') + '\n' }
}

// ---------------------------------------------------------------- internals

async function openEvent(): Promise<{ ok: true; event: EventRow } | { ok: false; error: string; status: number }> {
  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  if (!latest.event) return { ok: false, error: 'The game opens soon — ask at the stall.', status: 409 }
  if (latest.event.status !== 'open') return { ok: false, error: 'Entries are closed for this event.', status: 409 }
  return { ok: true, event: latest.event }
}

async function playerForToken(
  token: string,
  options: { anyEvent?: boolean } = {}
): Promise<{ ok: true; player: PlayerRow; event: EventRow } | { ok: false; error: string; status: number }> {
  if (!token || token.length < 20 || token.length > 100) return { ok: false, error: 'Please sign in again.', status: 401 }
  const player = await loadPlayerByToken(hashToken(token))
  if (!player) return { ok: false, error: 'Please sign in again.', status: 401 }
  if (options.anyEvent) {
    const own = await loadEventById(player.eventId)
    if (!own) return { ok: false, error: 'Please sign in again.', status: 401 }
    return { ok: true, player, event: own }
  }
  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  if (!latest.event || latest.event.id !== player.eventId) {
    return { ok: false, error: 'A new event has started. Please sign in again.', status: 401 }
  }
  return { ok: true, player, event: latest.event }
}

async function viewPlayer(player: PlayerRow, event: EventRow, knownRuns?: RunRow[]): Promise<PlayerView> {
  const runs = knownRuns ?? (await listPlayerRuns(player.id))
  const finished = runs.filter((run) => run.status === 'finished' && run.score !== null)
  const best = finished.reduce<RunRow | null>((top, run) => {
    if (!top) return run
    if ((run.score ?? 0) !== (top.score ?? 0)) return (run.score ?? 0) > (top.score ?? 0) ? run : top
    return (run.perfects ?? 0) > (top.perfects ?? 0) ? run : top
  }, null)
  const rank = best && !player.disqualified ? (await countLeadersAbove(event.id, best.score ?? 0, best.perfects ?? 0)) + 1 : null
  return {
    handle: player.handle,
    displayName: player.displayName,
    attemptsAllowed: event.attemptsPerPlayer + player.bonusAttempts,
    attemptsLeft: attemptsLeft({ allowed: event.attemptsPerPlayer, bonus: player.bonusAttempts, used: runs.length }),
    best: best ? { score: best.score ?? 0, layers: best.layers ?? 0, perfects: best.perfects ?? 0 } : null,
    rank,
    disqualified: player.disqualified,
    event: publicEvent(event, null),
  }
}

function publicEvent(
  event: EventRow,
  winner: { displayName: string | null; layers: number; perfects: number } | null
): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    status: event.status,
    attemptsPerPlayer: event.attemptsPerPlayer,
    winner:
      event.winnerHandle && event.announcedAt
        ? {
            handle: event.winnerHandle,
            displayName: winner?.displayName ?? null,
            score: event.winnerScore ?? 0,
            layers: winner?.layers ?? 0,
            perfects: winner?.perfects ?? 0,
          }
        : null,
    announcedAt: event.announcedAt ? Date.parse(event.announcedAt) : null,
  }
}

function ticketFor(run: RunRow): RunTicket {
  return { runId: run.id, seed: run.seed, attempt: run.attempt }
}

function resultOf(run: RunRow): RunResult {
  return { score: run.score ?? 0, layers: run.layers ?? 0, perfects: run.perfects ?? 0, bestCombo: run.bestCombo ?? 0 }
}

function cleanName(value: string | undefined): string | null {
  const name = (value ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40)
  return name || null
}

function csvCell(value: string | number): string {
  let text = String(value)
  if (/^[=+\-@]/.test(text) && !/^@[a-z0-9._]+$/.test(text)) text = `'${text}`
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

