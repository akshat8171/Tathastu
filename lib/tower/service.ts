import 'server-only'

import { createHash, randomBytes, randomInt } from 'crypto'
import { DEFAULT_ATTEMPTS, ROUND_COUNTDOWN_MS } from '@/lib/tower/constants'
import { replayRun } from '@/lib/tower/engine'
import {
  cancelRoundRuns,
  countLeadersAbove,
  countPlayers,
  countRuns,
  finishRun,
  insertEvent,
  insertRound,
  insertRun,
  listAllRuns,
  listPlayerRuns,
  listPlayers,
  listRoundRuns,
  listRounds,
  listRuns,
  loadAllLeaders,
  loadEventById,
  loadEvents,
  loadLatestEvent,
  loadLatestRound,
  loadLeaders,
  loadPlayer,
  loadPlayerByToken,
  loadRound,
  loadRun,
  saveProgress,
  updateEvent,
  updatePlayer,
  updateRound,
  upsertPlayer,
  type EventRow,
  type LeaderRow,
  type PlayerRow,
  type RoundRow,
  type RoundRunRow,
  type RunRow,
} from '@/lib/tower/repository'
import {
  attemptsLeft,
  checkRunTiming,
  clampIntervals,
  cleanPlayerName,
  isSuspiciousRun,
  maskPhone,
  newRoundCode,
  normalizePhone,
  normalizeRoundCode,
  plausibleProgress,
  roundPhase,
  screenNames,
  whatsappDigits,
} from '@/lib/tower/rules'
import type {
  AdminPlayerRow,
  AdminRound,
  AdminRunRow,
  AdminSnapshot,
  ApiResult,
  BoardRow,
  PlayerRoundState,
  PlayerView,
  PublicBoard,
  PublicEvent,
  PublicRound,
  RoundRow as PublicRoundRow,
  RunResult,
} from '@/lib/tower/types'

const BOARD_CACHE_MS = 1_000
const BOARD_SIZE = 10
const ROUND_ROWS = 40
/** Games in a round the host cancelled before it started. They do not use up a turn. */
const ROUND_CANCELLED = 'Round closed before it started.'
/** Wrong-code guesses allowed per phone per minute, so the code cannot be brute-forced. */
const CODE_GUESSES_PER_MINUTE = 6

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ---------------------------------------------------------------- players

export async function registerPlayer(input: {
  name: string
  phone: string
  marketingOptIn?: boolean
}): Promise<ApiResult<{ token: string; player: PlayerView; serverNow: number }>> {
  const live = await openEvent()
  if (!live.ok) return live

  const name = cleanPlayerName(input.name)
  if (!name.ok) return { ok: false, error: name.error, status: 400 }
  const phone = normalizePhone(input.phone)
  if (!phone) return { ok: false, error: 'Enter your 10-digit WhatsApp number.', status: 400 }

  const token = randomBytes(24).toString('base64url')
  const saved = await upsertPlayer({
    eventId: live.event.id,
    phone,
    name: name.name,
    marketingOptIn: input.marketingOptIn === true,
    tokenHash: hashToken(token),
  })
  if (!saved.ok && saved.code === 'phone-taken') {
    return {
      ok: false,
      error: 'This number is already playing on another phone. If that is you, ask the stall team to reset it.',
      status: 409,
    }
  }
  if (!saved.ok) return { ok: false, error: saved.error, status: 500 }
  invalidateBoard()
  const player = await viewPlayer(saved.player, live.event)
  return { ok: true, token, player, serverNow: Date.now() }
}

export async function getPlayer(token: string): Promise<ApiResult<{ player: PlayerView; serverNow: number }>> {
  const found = await playerForToken(token)
  if (!found.ok) return found
  return { ok: true, player: await viewPlayer(found.player, found.event), serverNow: Date.now() }
}

/** "Next player": drop this phone's token so the number can be signed into again later. */
export async function releasePlayer(token: string): Promise<ApiResult<{ released: boolean }>> {
  if (!validTokenShape(token)) return { ok: true, released: false }
  const player = await loadPlayerByToken(hashToken(token))
  if (!player) return { ok: true, released: false }
  const cleared = await updatePlayer(player.id, { clearToken: true })
  return cleared.ok ? { ok: true, released: true } : { ok: false, error: cleared.error, status: 500 }
}

// ---------------------------------------------------------------- rounds

const guesses = new Map<string, number[]>()

function tooManyGuesses(key: string, now: number): boolean {
  const recent = (guesses.get(key) ?? []).filter((at) => now - at < 60_000)
  guesses.set(key, recent)
  if (guesses.size > 5_000) guesses.clear()
  return recent.length >= CODE_GUESSES_PER_MINUTE
}

/** The player types the code the host read out. Entering it again returns the same game. */
export async function joinRound(
  token: string,
  rawCode: string
): Promise<ApiResult<{ player: PlayerView; serverNow: number }>> {
  const found = await playerForToken(token)
  if (!found.ok) return found
  const { player, event } = found
  if (player.disqualified) return { ok: false, error: 'Please speak to the stall team.', status: 403 }

  const now = Date.now()
  if (tooManyGuesses(player.id, now)) {
    return { ok: false, error: 'Too many wrong codes. Wait a minute and listen for the host.', status: 429 }
  }
  const code = normalizeRoundCode(rawCode)
  const round = await loadLatestRound(event.id)
  if (!code || !round || round.status === 'ended' || round.code !== code) {
    guesses.get(player.id)?.push(now)
    if (!round || round.status === 'ended') {
      return { ok: false, error: 'No round is open right now. Wait for the host to call the next one.', status: 409 }
    }
    return { ok: false, error: 'That code is not right. Listen for the host and try again.', status: 400 }
  }

  const runs = await listPlayerRuns(player.id)
  const already = runs.find((run) => run.roundId === round.id)
  if (already) return { ok: true, player: await viewPlayer(player, event, runs, round), serverNow: Date.now() }
  if (event.status !== 'open') return { ok: false, error: 'Entries are closed for today.', status: 409 }

  const left = attemptsLeft({ allowed: event.attemptsPerPlayer, bonus: player.bonusAttempts, used: usedTurns(runs) })
  if (left <= 0) {
    return { ok: false, error: 'You have played all your rounds. Your best score is on the board!', status: 409 }
  }

  const attempt = runs.reduce((max, run) => Math.max(max, run.attempt), 0) + 1
  const saved = await insertRun({ eventId: event.id, playerId: player.id, roundId: round.id, attempt, seed: round.seed })
  if (!saved.ok && saved.code === '23505') {
    // Two taps raced in at once — the other request already joined this round.
    const again = await listPlayerRuns(player.id)
    if (again.some((run) => run.roundId === round.id)) {
      return { ok: true, player: await viewPlayer(player, event, again, round), serverNow: Date.now() }
    }
  }
  if (!saved.ok) return { ok: false, error: saved.error, status: 500 }
  invalidateBoard()
  return { ok: true, player: await viewPlayer(player, event, [...runs, saved.run], round), serverNow: Date.now() }
}

// ---------------------------------------------------------------- runs

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

  // The clock starts at the round's first drop (or when a latecomer joined) — nobody can
  // start stacking during the countdown.
  const round = run.roundId ? await loadRound(run.roundId) : null
  const goAtMs = round?.goAt ? Date.parse(round.goAt) : null
  if (round && goAtMs === null) {
    return { ok: false, error: 'The round has not started yet.', status: 409 }
  }
  const startedAtMs = Math.max(Date.parse(run.startedAt), goAtMs ?? 0)
  const timingError = checkRunTiming({ intervalsMs, startedAtMs, nowMs: Date.now() })
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

/** Live score from a phone mid-game, for the race on the big screen. Display only. */
export async function reportProgress(input: {
  token: string
  runId: string
  score: number
  layers: number
}): Promise<ApiResult<{ saved: boolean }>> {
  if (!validTokenShape(input.token)) return { ok: false, error: 'Please sign in again.', status: 401 }
  const player = await loadPlayerByToken(hashToken(input.token))
  if (!player) return { ok: false, error: 'Please sign in again.', status: 401 }
  const run = await loadRun(input.runId)
  if (!run || run.playerId !== player.id || run.status !== 'playing') return { ok: true, saved: false }
  const round = run.roundId ? await loadRound(run.roundId) : null
  const startMs = Math.max(Date.parse(run.startedAt), round?.goAt ? Date.parse(round.goAt) : 0)
  const progress = plausibleProgress({ score: input.score, layers: input.layers, elapsedMs: Date.now() - startMs })
  const saved = await saveProgress(run.id, player.id, progress)
  return saved.ok ? { ok: true, saved: saved.updated } : { ok: false, error: saved.error, status: 500 }
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
    const board: PublicBoard = { serverNow: now, event: null, round: null, roundRows: [], top: [], players: 0, games: 0 }
    return { ok: true, board }
  }

  const round = await loadLatestRound(event.id)
  const [leaders, players, games, roundRuns] = await Promise.all([
    loadLeaders(event.id, BOARD_SIZE),
    countPlayers(event.id),
    countRuns(event.id, 'finished'),
    round ? listRoundRuns(round.id) : Promise.resolve([] as RoundRunRow[]),
  ])

  const visible = roundRuns.filter((run) => !run.disqualified && run.rejectReason !== ROUND_CANCELLED)
  const labels = screenNames([
    ...leaders.map((row) => ({ id: row.playerId, name: row.name, phone: row.phone })),
    ...visible.map((run) => ({ id: run.playerId, name: run.name, phone: run.phone })),
  ].filter((row, index, all) => all.findIndex((other) => other.id === row.id) === index))
  const publicRound = round ? toPublicRound(round, event, visible, now) : null

  const board: PublicBoard = {
    serverNow: now,
    event: publicEvent(event, leaders.find((row) => row.playerId === event.winnerPlayerId) ?? null),
    round: publicRound,
    roundRows: roundRowsFor(visible, publicRound?.phase ?? 'lobby', labels).slice(0, ROUND_ROWS),
    top: leaders.map(
      (row, index): BoardRow => ({
        rank: index + 1,
        name: labels.get(row.playerId) ?? row.name,
        score: row.score,
        layers: row.layers,
        perfects: row.perfects,
      })
    ),
    players,
    games,
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
  const now = Date.now()
  const snapshot: AdminSnapshot = {
    serverNow: now,
    event: event ? publicEvent(event, null) : null,
    round: null,
    pastEvents: events.filter((row) => row.id !== event?.id).map((row) => publicEvent(row, null)),
    players: [],
    runs: [],
  }
  if (!event) return { ok: true, snapshot }

  const [players, leaders, runs, allRuns, rounds] = await Promise.all([
    listPlayers(event.id),
    loadAllLeaders(event.id),
    listRuns(event.id, 300),
    listAllRuns(event.id),
    listRounds(event.id),
  ])
  const round = rounds[rounds.length - 1] ?? null
  if (round) {
    const roundRuns = allRuns.filter((run) => run.roundId === round.id)
    const hidden = new Set(players.filter((player) => player.disqualified).map((player) => player.id))
    const visible = roundRuns.filter((run) => !hidden.has(run.playerId) && run.rejectReason !== ROUND_CANCELLED)
    snapshot.round = {
      ...toPublicRound(round, event, visible, now),
      code: round.code,
      secretCode: round.code,
      showCode: event.showCode,
    } satisfies AdminRound
  }

  const names = new Map(players.map((player) => [player.id, player.name]))
  const roundNumbers = new Map(rounds.map((row) => [row.id, row.number]))
  const used = new Map<string, number>()
  for (const run of allRuns) {
    if (run.rejectReason === ROUND_CANCELLED) continue
    used.set(run.playerId, (used.get(run.playerId) ?? 0) + 1)
  }
  const ranks = new Map<string, number>()
  leaders.filter((row) => !row.disqualified).forEach((row, index) => ranks.set(row.playerId, index + 1))
  const bests = new Map(leaders.map((row) => [row.playerId, row]))

  snapshot.event = publicEvent(event, leaders.find((row) => row.playerId === event.winnerPlayerId) ?? null)
  snapshot.players = players
    .map((player): AdminPlayerRow => {
      const usedCount = used.get(player.id) ?? 0
      const best = bests.get(player.id)
      return {
        id: player.id,
        name: player.name,
        phone: player.phone,
        marketingOptIn: player.marketingOptIn,
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
  snapshot.runs = runs
    .filter((run) => run.rejectReason !== ROUND_CANCELLED)
    .map(
      (run): AdminRunRow => ({
        id: run.id,
        playerId: run.playerId,
        name: names.get(run.playerId) ?? '?',
        round: run.roundId ? (roundNumbers.get(run.roundId) ?? null) : null,
        status: run.status,
        score: run.score ?? (run.status === 'playing' ? run.progressScore : null),
        layers: run.layers ?? (run.status === 'playing' ? run.progressLayers : null),
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
  | { action: 'new-round' }
  | { action: 'start-round' }
  | { action: 'end-round' }
  | { action: 'show-code'; show: boolean }
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
    return created.ok
      ? { ok: true, message: `"${created.event.name}" is live. Open a round to get a code.` }
      : { ok: false, error: created.error }
  }

  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  const event = latest.event
  if (!event) return { ok: false, error: 'Go live first.', status: 409 }

  let outcome: { ok: true } | { ok: false; error: string }
  let message = 'Saved.'
  switch (input.action) {
    case 'set-status':
      outcome = await updateEvent(event.id, { status: input.status })
      message =
        input.status === 'open' ? 'Entries are open.' : 'Entries closed. Nobody new can join; games running can finish.'
      break
    case 'set-attempts':
      outcome = await updateEvent(event.id, { attemptsPerPlayer: input.attemptsPerPlayer })
      message = `Everyone can now play ${input.attemptsPerPlayer} round${input.attemptsPerPlayer === 1 ? '' : 's'}.`
      break
    case 'show-code':
      outcome = await updateEvent(event.id, { showCode: input.show })
      message = input.show ? 'The code is now on the big screen.' : 'The code is hidden — read it out loud.'
      break
    case 'new-round': {
      if (event.status !== 'open') return { ok: false, error: 'Open entries first.', status: 409 }
      const previous = await loadLatestRound(event.id)
      if (previous && previous.status !== 'ended') {
        const closed = await closeRound(previous)
        if (!closed.ok) return { ok: false, error: closed.error }
      }
      const created = await insertRound({
        eventId: event.id,
        number: (previous?.number ?? 0) + 1,
        code: newRoundCode(previous?.code ?? null),
        seed: randomInt(1, 2_147_483_647),
      })
      if (!created.ok) return { ok: false, error: created.code === '23505' ? 'A round was just opened — refresh.' : created.error }
      outcome = { ok: true }
      message = `Round ${created.round.number} is open. Code: ${created.round.code}`
      break
    }
    case 'start-round': {
      const round = await loadLatestRound(event.id)
      if (!round || round.status !== 'lobby') return { ok: false, error: 'Open a new round first.', status: 409 }
      const goAt = new Date(Date.now() + ROUND_COUNTDOWN_MS).toISOString()
      const moved = await updateRound(round.id, ['lobby'], { status: 'playing', goAt })
      if (!moved.ok) return { ok: false, error: moved.error }
      if (!moved.updated) return { ok: false, error: 'This round has already started.', status: 409 }
      outcome = { ok: true }
      message = `Round ${round.number} starts in ${Math.round(ROUND_COUNTDOWN_MS / 1000)} seconds!`
      break
    }
    case 'end-round': {
      const round = await loadLatestRound(event.id)
      if (!round || round.status === 'ended') return { ok: false, error: 'No round is running.', status: 409 }
      const closed = await closeRound(round)
      if (!closed.ok) return { ok: false, error: closed.error }
      outcome = { ok: true }
      message =
        round.status === 'lobby'
          ? `Round ${round.number} closed before it started — nobody used up a turn.`
          : `Round ${round.number} is over. The podium is on the big screen.`
      break
    }
    case 'announce': {
      const [leader] = await loadLeaders(event.id, 1)
      if (!leader) return { ok: false, error: 'Nobody has a score yet.', status: 409 }
      if (input.expectedPlayerId && leader.playerId !== input.expectedPlayerId) {
        return {
          ok: false,
          error: `The leaderboard just changed — ${leader.name} now leads with ${leader.score}. Check and announce again.`,
          status: 409,
        }
      }
      outcome = await updateEvent(event.id, {
        status: 'closed',
        winnerPlayerId: leader.playerId,
        winnerName: leader.name,
        winnerScore: leader.score,
        announcedAt: new Date().toISOString(),
      })
      message = `Winner: ${leader.name} with ${leader.score}. The big screen is celebrating.`
      break
    }
    case 'unannounce':
      outcome = await updateEvent(event.id, {
        winnerPlayerId: null,
        winnerName: null,
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
        ? `${player.name} is hidden from the screen and the leaderboard.`
        : `${player.name} is back on the leaderboard.`
      break
    }
    case 'grant-attempt': {
      const player = await loadPlayer(input.playerId)
      if (!player || player.eventId !== event.id) return { ok: false, error: 'Player not found.', status: 404 }
      outcome = await updatePlayer(player.id, { bonusAttempts: player.bonusAttempts + 1 })
      message = `${player.name} can play one more round.`
      break
    }
    case 'reset-device': {
      const player = await loadPlayer(input.playerId)
      if (!player || player.eventId !== event.id) return { ok: false, error: 'Player not found.', status: 404 }
      outcome = await updatePlayer(player.id, { clearToken: true })
      message = `${player.name} can now sign in on a new phone (the old phone is signed out).`
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

  const [players, runs, rounds] = await Promise.all([listPlayers(event.id), listAllRuns(event.id), listRounds(event.id)])
  const byId = new Map(players.map((player) => [player.id, player]))
  const roundNumbers = new Map(rounds.map((row) => [row.id, row.number]))
  const header = [
    'name',
    'whatsapp',
    'whatsapp_link',
    'offers_opt_in',
    'hidden',
    'round',
    'status',
    'score',
    'layers',
    'perfects',
    'best_combo',
    'joined_at',
    'finished_at',
    'note',
  ]
  const lines = [header.join(',')]
  for (const run of runs) {
    const player = byId.get(run.playerId)
    lines.push(
      [
        player?.name ?? '',
        player ? sheetPhone(player.phone) : '',
        player ? `https://wa.me/${whatsappDigits(player.phone)}` : '',
        player?.marketingOptIn ? 'yes' : 'no',
        player?.disqualified ? 'yes' : 'no',
        run.roundId ? (roundNumbers.get(run.roundId) ?? '') : '',
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
      [
        player.name,
        sheetPhone(player.phone),
        `https://wa.me/${whatsappDigits(player.phone)}`,
        player.marketingOptIn ? 'yes' : 'no', player.disqualified ? 'yes' : 'no',
        '',
        'not played',
      ]
        .map(csvCell)
        .join(',')
    )
  }
  const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'
  return { ok: true, filename: `tathastu-tower-${slug}-${event.id}.csv`, csv: lines.join('\n') + '\n' }
}

// ---------------------------------------------------------------- internals

async function closeRound(round: RoundRow): Promise<{ ok: true } | { ok: false; error: string }> {
  const moved = await updateRound(round.id, ['lobby', 'playing'], {
    status: 'ended',
    endedAt: new Date().toISOString(),
  })
  if (!moved.ok) return moved
  // Nobody got to play a round that never started — give everyone their turn back.
  if (round.status === 'lobby') {
    const cancelled = await cancelRoundRuns(round.id, ROUND_CANCELLED)
    if (!cancelled.ok) return cancelled
  }
  return { ok: true }
}

function usedTurns(runs: RunRow[]): number {
  return runs.filter((run) => run.rejectReason !== ROUND_CANCELLED).length
}

function toPublicRound(
  round: RoundRow,
  event: EventRow,
  runs: { status: RunRow['status'] }[],
  now: number
): PublicRound {
  const goAt = round.goAt ? Date.parse(round.goAt) : null
  const joined = runs.length
  const finished = runs.filter((run) => run.status !== 'playing').length
  return {
    id: round.id,
    number: round.number,
    status: round.status,
    phase: roundPhase({ status: round.status, goAtMs: goAt, nowMs: now, joined, finished }),
    goAt,
    code: event.showCode && round.status !== 'ended' ? round.code : null,
    joined,
    finished,
  }
}

function roundRowsFor(
  runs: RoundRunRow[],
  phase: PublicRound['phase'],
  labels: Map<string, string>
): PublicRoundRow[] {
  const rows = runs.map((run) => {
    const done = run.status !== 'playing'
    return {
      name: labels.get(run.playerId) ?? run.name,
      score: done ? (run.score ?? 0) : (run.progressScore ?? 0),
      layers: done ? (run.layers ?? 0) : (run.progressLayers ?? 0),
      done,
      perfects: run.perfects ?? 0,
    }
  })
  if (phase !== 'lobby') {
    rows.sort((left, right) => right.score - left.score || right.perfects - left.perfects)
  }
  return rows.map(({ perfects: _perfects, ...row }) => row)
}

async function openEvent(): Promise<{ ok: true; event: EventRow } | { ok: false; error: string; status: number }> {
  const latest = await loadLatestEvent()
  if (!latest.ok) return { ok: false, error: latest.error, status: 503 }
  if (!latest.event) return { ok: false, error: 'The game opens soon — ask at the stall.', status: 409 }
  if (latest.event.status !== 'open') return { ok: false, error: 'Entries are closed for today.', status: 409 }
  return { ok: true, event: latest.event }
}

function validTokenShape(token: string): boolean {
  return Boolean(token) && token.length >= 20 && token.length <= 100
}

async function playerForToken(
  token: string,
  options: { anyEvent?: boolean } = {}
): Promise<{ ok: true; player: PlayerRow; event: EventRow } | { ok: false; error: string; status: number }> {
  if (!validTokenShape(token)) return { ok: false, error: 'Please sign in again.', status: 401 }
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

async function viewPlayer(
  player: PlayerRow,
  event: EventRow,
  knownRuns?: RunRow[],
  knownRound?: RoundRow | null
): Promise<PlayerView> {
  const [runs, round] = await Promise.all([
    knownRuns ? Promise.resolve(knownRuns) : listPlayerRuns(player.id),
    knownRound !== undefined ? Promise.resolve(knownRound) : loadLatestRound(event.id),
  ])
  const finished = runs.filter((run) => run.status === 'finished' && run.score !== null)
  const best = finished.reduce<RunRow | null>((top, run) => {
    if (!top) return run
    if ((run.score ?? 0) !== (top.score ?? 0)) return (run.score ?? 0) > (top.score ?? 0) ? run : top
    return (run.perfects ?? 0) > (top.perfects ?? 0) ? run : top
  }, null)
  const rank = best && !player.disqualified ? (await countLeadersAbove(event.id, best.score ?? 0, best.perfects ?? 0)) + 1 : null

  let current: PlayerRoundState | null = null
  let publicRound: PublicRound | null = null
  const mine = round ? runs.find((run) => run.roundId === round.id && run.rejectReason !== ROUND_CANCELLED) : undefined
  if (round) {
    const roundRuns = await listRoundRuns(round.id)
    const visible = roundRuns.filter((run) => !run.disqualified && run.rejectReason !== ROUND_CANCELLED)
    publicRound = toPublicRound(round, event, visible, Date.now())
    if (mine) {
      const roundRank =
        mine.status === 'finished'
          ? visible.filter(
              (run) =>
                run.status === 'finished' &&
                ((run.score ?? 0) > (mine.score ?? 0) ||
                  ((run.score ?? 0) === (mine.score ?? 0) && (run.perfects ?? 0) > (mine.perfects ?? 0)))
            ).length + 1
          : null
      current = {
        roundId: round.id,
        number: round.number,
        runId: mine.id,
        seed: mine.seed,
        status: mine.status,
        score: mine.score,
        rank: player.disqualified ? null : roundRank,
      }
    }
  }

  return {
    name: player.name,
    phoneHint: maskPhone(player.phone),
    attemptsAllowed: event.attemptsPerPlayer + player.bonusAttempts,
    attemptsLeft: attemptsLeft({ allowed: event.attemptsPerPlayer, bonus: player.bonusAttempts, used: usedTurns(runs) }),
    best: best ? { score: best.score ?? 0, layers: best.layers ?? 0, perfects: best.perfects ?? 0 } : null,
    rank,
    disqualified: player.disqualified,
    event: publicEvent(event, null),
    round: publicRound,
    current,
  }
}

function publicEvent(event: EventRow, winner: Pick<LeaderRow, 'layers' | 'perfects'> | null): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    status: event.status,
    attemptsPerPlayer: event.attemptsPerPlayer,
    winner:
      event.winnerName && event.announcedAt
        ? {
            name: event.winnerName,
            score: event.winnerScore ?? 0,
            layers: winner?.layers ?? 0,
            perfects: winner?.perfects ?? 0,
          }
        : null,
    announcedAt: event.announcedAt ? Date.parse(event.announcedAt) : null,
  }
}

function resultOf(run: RunRow): RunResult {
  return { score: run.score ?? 0, layers: run.layers ?? 0, perfects: run.perfects ?? 0, bestCombo: run.bestCombo ?? 0 }
}

/** "+919876543210" -> "+91 98765 43210": spreadsheets keep it as text instead of 9.19877E+11. */
function sheetPhone(phone: string): string {
  const digits = whatsappDigits(phone)
  if (digits.length <= 10) return phone
  const local = digits.slice(-10)
  return `+${digits.slice(0, -10)} ${local.slice(0, 5)} ${local.slice(5)}`
}

function csvCell(value: string | number): string {
  let text = String(value)
  // Keep "+91 …" numbers as they are, but neutralise anything a spreadsheet would run as a formula.
  if (/^[=+\-@]/.test(text) && !/^\+[\d ]{8,20}$/.test(text)) text = `'${text}`
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
