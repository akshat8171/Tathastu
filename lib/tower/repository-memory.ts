import 'server-only'

import { randomUUID } from 'crypto'
import type * as Db from '@/lib/tower/repository-supabase'
import type { EventRow, LeaderRow, PlayerRow, RoundRow, RunRow } from '@/lib/tower/repository-supabase'

/**
 * In-memory stand-in for the Supabase tables, used ONLY by `npm run dev` when no
 * Supabase project is configured — so the whole game can be tried on a laptop.
 * Data lives on globalThis (survives hot reloads) and is gone when the server stops.
 * Mirrors repository-supabase.ts exactly; the selector in repository.ts picks one.
 */

interface StoredPlayer extends PlayerRow {
  tokenHash: string | null
}
interface StoredRun extends RunRow {
  intervalsMs: number[] | null
}
interface Store {
  events: EventRow[]
  rounds: RoundRow[]
  players: StoredPlayer[]
  runs: StoredRun[]
  nextEventId: number
  nextRoundId: number
}

const globalStore = globalThis as typeof globalThis & { __towerMemoryStoreV2?: Store }
const store: Store = (globalStore.__towerMemoryStoreV2 ??= {
  events: [],
  rounds: [],
  players: [],
  runs: [],
  nextEventId: 1,
  nextRoundId: 1,
})

const nowIso = () => new Date().toISOString()
const copy = <T extends object>(row: T): T => ({ ...row })
const publicPlayer = ({ tokenHash: _tokenHash, ...player }: StoredPlayer): PlayerRow => ({ ...player })
const publicRun = ({ intervalsMs: _intervals, ...run }: StoredRun): RunRow => ({ ...run })

// ---------------------------------------------------------------- events

export const loadLatestEvent: typeof Db.loadLatestEvent = async () => {
  const latest = store.events.reduce<EventRow | null>((top, event) => (!top || event.id > top.id ? event : top), null)
  return { ok: true, event: latest ? copy(latest) : null }
}

export const loadEvents: typeof Db.loadEvents = async (limit = 20) =>
  [...store.events].sort((a, b) => b.id - a.id).slice(0, limit).map(copy)

export const loadEventById: typeof Db.loadEventById = async (id) => {
  const event = store.events.find((row) => row.id === id)
  return event ? copy(event) : null
}

export const insertEvent: typeof Db.insertEvent = async (input) => {
  for (const event of store.events) if (event.status === 'open') event.status = 'closed'
  const event: EventRow = {
    id: store.nextEventId++,
    name: input.name,
    status: 'open',
    attemptsPerPlayer: input.attemptsPerPlayer,
    showCode: false,
    winnerPlayerId: null,
    winnerName: null,
    winnerScore: null,
    announcedAt: null,
    createdAt: nowIso(),
  }
  store.events.push(event)
  return { ok: true, event: copy(event) }
}

export const updateEvent: typeof Db.updateEvent = async (id, patch) => {
  const event = store.events.find((row) => row.id === id)
  if (!event) return { ok: false, error: 'Could not update the event.' }
  if (patch.status !== undefined) event.status = patch.status
  if (patch.attemptsPerPlayer !== undefined) event.attemptsPerPlayer = patch.attemptsPerPlayer
  if (patch.showCode !== undefined) event.showCode = patch.showCode
  if (patch.winnerPlayerId !== undefined) event.winnerPlayerId = patch.winnerPlayerId
  if (patch.winnerName !== undefined) event.winnerName = patch.winnerName
  if (patch.winnerScore !== undefined) event.winnerScore = patch.winnerScore
  if (patch.announcedAt !== undefined) event.announcedAt = patch.announcedAt
  return { ok: true }
}

// ---------------------------------------------------------------- rounds

export const loadLatestRound: typeof Db.loadLatestRound = async (eventId) => {
  const latest = store.rounds
    .filter((row) => row.eventId === eventId)
    .reduce<RoundRow | null>((top, round) => (!top || round.number > top.number ? round : top), null)
  return latest ? copy(latest) : null
}

export const loadRound: typeof Db.loadRound = async (id) => {
  const round = store.rounds.find((row) => row.id === id)
  return round ? copy(round) : null
}

export const insertRound: typeof Db.insertRound = async (input) => {
  if (store.rounds.some((row) => row.eventId === input.eventId && row.number === input.number)) {
    return { ok: false, error: 'Could not open a new round.', code: '23505' }
  }
  const round: RoundRow = {
    id: store.nextRoundId++,
    eventId: input.eventId,
    number: input.number,
    code: input.code,
    status: 'lobby',
    seed: input.seed,
    goAt: null,
    endedAt: null,
    createdAt: nowIso(),
  }
  store.rounds.push(round)
  return { ok: true, round: copy(round) }
}

export const updateRound: typeof Db.updateRound = async (id, from, patch) => {
  const round = store.rounds.find((row) => row.id === id)
  if (!round || !from.includes(round.status)) return { ok: true, updated: false }
  if (patch.status !== undefined) round.status = patch.status
  if (patch.goAt !== undefined) round.goAt = patch.goAt
  if (patch.endedAt !== undefined) round.endedAt = patch.endedAt
  return { ok: true, updated: true }
}

export const listRounds: typeof Db.listRounds = async (eventId) =>
  store.rounds
    .filter((row) => row.eventId === eventId)
    .sort((a, b) => a.number - b.number)
    .map(copy)

export const cancelRoundRuns: typeof Db.cancelRoundRuns = async (roundId, reason) => {
  for (const run of store.runs) {
    if (run.roundId !== roundId || run.status !== 'playing') continue
    run.status = 'rejected'
    run.rejectReason = reason
    run.finishedAt = nowIso()
  }
  return { ok: true }
}

// ---------------------------------------------------------------- players

export const loadPlayerByToken: typeof Db.loadPlayerByToken = async (tokenHash) => {
  const player = store.players.find((row) => row.tokenHash === tokenHash)
  return player ? publicPlayer(player) : null
}

export const loadPlayer: typeof Db.loadPlayer = async (id) => {
  const player = store.players.find((row) => row.id === id)
  return player ? publicPlayer(player) : null
}

export const upsertPlayer: typeof Db.upsertPlayer = async (input) => {
  const existing = store.players.find((row) => row.eventId === input.eventId && row.phone === input.phone)
  if (existing) {
    if (existing.tokenHash) return { ok: false, error: 'phone-taken', code: 'phone-taken' }
    existing.tokenHash = input.tokenHash
    existing.name = input.name
    existing.marketingOptIn = existing.marketingOptIn || input.marketingOptIn
    return { ok: true, player: publicPlayer(existing) }
  }
  const player: StoredPlayer = {
    id: randomUUID(),
    eventId: input.eventId,
    phone: input.phone,
    name: input.name,
    marketingOptIn: input.marketingOptIn,
    bonusAttempts: 0,
    disqualified: false,
    createdAt: nowIso(),
    tokenHash: input.tokenHash,
  }
  store.players.push(player)
  return { ok: true, player: publicPlayer(player) }
}

export const updatePlayer: typeof Db.updatePlayer = async (id, patch) => {
  const player = store.players.find((row) => row.id === id)
  if (!player) return { ok: false, error: 'Could not update the player.' }
  if (patch.clearToken) player.tokenHash = null
  if (patch.disqualified !== undefined) player.disqualified = patch.disqualified
  if (patch.bonusAttempts !== undefined) player.bonusAttempts = patch.bonusAttempts
  return { ok: true }
}

export const listPlayers: typeof Db.listPlayers = async (eventId) =>
  store.players.filter((row) => row.eventId === eventId).map(publicPlayer)

export const countPlayers: typeof Db.countPlayers = async (eventId) =>
  store.players.filter((row) => row.eventId === eventId).length

// ---------------------------------------------------------------- runs

export const loadRun: typeof Db.loadRun = async (id) => {
  const run = store.runs.find((row) => row.id === id)
  return run ? publicRun(run) : null
}

export const listPlayerRuns: typeof Db.listPlayerRuns = async (playerId) =>
  store.runs
    .filter((row) => row.playerId === playerId)
    .sort((a, b) => a.attempt - b.attempt)
    .map(publicRun)

export const insertRun: typeof Db.insertRun = async (input) => {
  const clash = store.runs.some(
    (row) => row.playerId === input.playerId && (row.attempt === input.attempt || row.roundId === input.roundId)
  )
  if (clash) return { ok: false, error: 'Could not join the round.', code: '23505' }
  const run: StoredRun = {
    id: randomUUID(),
    eventId: input.eventId,
    playerId: input.playerId,
    roundId: input.roundId,
    attempt: input.attempt,
    seed: input.seed,
    status: 'playing',
    startedAt: nowIso(),
    finishedAt: null,
    score: null,
    layers: null,
    perfects: null,
    bestCombo: null,
    rejectReason: null,
    progressScore: null,
    progressLayers: null,
    intervalsMs: null,
  }
  store.runs.push(run)
  return { ok: true, run: publicRun(run) }
}

export const finishRun: typeof Db.finishRun = async (id, result) => {
  const run = store.runs.find((row) => row.id === id)
  if (!run || run.status !== 'playing') return { ok: true, updated: false }
  run.status = result.status
  run.finishedAt = nowIso()
  run.intervalsMs = result.intervalsMs
  if (result.status === 'rejected') run.rejectReason = result.reason
  if (result.score !== undefined) {
    run.score = result.score
    run.layers = result.layers ?? null
    run.perfects = result.perfects ?? null
    run.bestCombo = result.bestCombo ?? null
  }
  return { ok: true, updated: true }
}

export const saveProgress: typeof Db.saveProgress = async (runId, playerId, progress) => {
  const run = store.runs.find((row) => row.id === runId && row.playerId === playerId)
  if (!run || run.status !== 'playing') return { ok: true, updated: false }
  run.progressScore = progress.score
  run.progressLayers = progress.layers
  return { ok: true, updated: true }
}

export const listRuns: typeof Db.listRuns = async (eventId, limit) =>
  store.runs
    .filter((row) => row.eventId === eventId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit)
    .map(publicRun)

export const listAllRuns: typeof Db.listAllRuns = async (eventId) =>
  store.runs
    .filter((row) => row.eventId === eventId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((row) => ({ ...publicRun(row), intervalsMs: row.intervalsMs }))

export const countRuns: typeof Db.countRuns = async (eventId, status) =>
  store.runs.filter((row) => row.eventId === eventId && row.status === status).length

export const listRoundRuns: typeof Db.listRoundRuns = async (roundId) => {
  const players = new Map(store.players.map((player) => [player.id, player]))
  return store.runs
    .filter((row) => row.roundId === roundId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((row) => {
      const player = players.get(row.playerId)
      return {
        ...publicRun(row),
        name: player?.name ?? 'Player',
        phone: player?.phone ?? '',
        disqualified: player?.disqualified ?? false,
      }
    })
}

// ---------------------------------------------------------------- leaderboard (mirrors the tower_leaderboard view)

function leaders(eventId: number): LeaderRow[] {
  const players = new Map(store.players.map((player) => [player.id, player]))
  const best = new Map<string, StoredRun>()
  const better = (a: StoredRun, b: StoredRun) =>
    (a.score ?? 0) - (b.score ?? 0) ||
    (a.perfects ?? 0) - (b.perfects ?? 0) ||
    (b.finishedAt ?? '').localeCompare(a.finishedAt ?? '')
  for (const run of store.runs) {
    if (run.eventId !== eventId || run.status !== 'finished' || run.score === null) continue
    const current = best.get(run.playerId)
    if (!current || better(run, current) > 0) best.set(run.playerId, run)
  }
  return [...best.values()]
    .sort((a, b) => better(b, a))
    .map((run) => {
      const player = players.get(run.playerId)
      return {
        playerId: run.playerId,
        name: player?.name ?? 'Player',
        phone: player?.phone ?? '',
        disqualified: player?.disqualified ?? false,
        runId: run.id,
        score: run.score ?? 0,
        layers: run.layers ?? 0,
        perfects: run.perfects ?? 0,
        finishedAt: run.finishedAt ?? '',
      }
    })
}

export const loadLeaders: typeof Db.loadLeaders = async (eventId, limit) =>
  leaders(eventId)
    .filter((row) => !row.disqualified)
    .slice(0, limit)

export const loadAllLeaders: typeof Db.loadAllLeaders = async (eventId) => leaders(eventId)

export const countLeadersAbove: typeof Db.countLeadersAbove = async (eventId, score, perfects) =>
  leaders(eventId).filter(
    (row) => !row.disqualified && (row.score > score || (row.score === score && row.perfects > perfects))
  ).length
