import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { EventStatus, FollowCheckMode } from '@/lib/tower/types'

/** Thin Supabase layer for Tathastu Tower. No game rules live here. */

export interface EventRow {
  id: number
  name: string
  status: EventStatus
  attemptsPerPlayer: number
  winnerPlayerId: string | null
  winnerHandle: string | null
  winnerScore: number | null
  announcedAt: string | null
  createdAt: string
}

export interface PlayerRow {
  id: string
  eventId: number
  handle: string
  displayName: string | null
  followCheck: FollowCheckMode
  bonusAttempts: number
  disqualified: boolean
  createdAt: string
}

export interface RunRow {
  id: string
  eventId: number
  playerId: string
  attempt: number
  seed: number
  status: 'playing' | 'finished' | 'rejected'
  startedAt: string
  finishedAt: string | null
  score: number | null
  layers: number | null
  perfects: number | null
  bestCombo: number | null
  rejectReason: string | null
  startKey: string | null
}

export interface LeaderRow {
  playerId: string
  handle: string
  displayName: string | null
  disqualified: boolean
  runId: string
  score: number
  layers: number
  perfects: number
  finishedAt: string
}

export type Outcome<T = object> = ({ ok: true } & T) | { ok: false; error: string; code?: string }

const MIGRATION_HINT = 'Run supabase/migration-017-tower.sql in the Supabase SQL editor.'
const PAGE = 1000

const EVENT_COLUMNS =
  'id, name, status, attempts_per_player, winner_player_id, winner_handle, winner_score, announced_at, created_at'
const PLAYER_COLUMNS = 'id, event_id, ig_handle, display_name, follow_check, bonus_attempts, disqualified, created_at'
const RUN_COLUMNS =
  'id, event_id, player_id, attempt, seed, status, started_at, finished_at, score, layers, perfects, best_combo, reject_reason, start_key'
const LEADER_COLUMNS = 'player_id, ig_handle, display_name, disqualified, run_id, score, layers, perfects, finished_at'

type DbError = { message?: string; code?: string } | null

function failure(error: DbError, fallback: string): { ok: false; error: string; code?: string } {
  const message = (error?.message || '').toLowerCase()
  const missing = error?.code === '42P01' || message.includes('does not exist') || message.includes('schema cache')
  return { ok: false, error: missing ? MIGRATION_HINT : fallback, code: error?.code }
}

/**
 * Reads that decide "who is this / does this exist" must not turn a database blip into
 * "not found" — that would sign a player out or drop their score. Throw instead; the
 * route's guard() answers 503 and the phone retries.
 */
class TowerReadError extends Error {}
function readFailed(error: DbError, what: string): never {
  const outcome = failure(error, `Could not load ${what}.`)
  throw new TowerReadError(outcome.error)
}

// ---------------------------------------------------------------- events

export async function loadLatestEvent(): Promise<Outcome<{ event: EventRow | null }>> {
  const { data, error } = await supabaseAdmin
    .from('tower_events')
    .select(EVENT_COLUMNS)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return failure(error, 'Could not load the game.')
  return { ok: true, event: data ? mapEvent(data) : null }
}

export async function loadEvents(limit = 20): Promise<EventRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_events')
    .select(EVENT_COLUMNS)
    .order('id', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map(mapEvent)
}

export async function loadEventById(id: number): Promise<EventRow | null> {
  const { data, error } = await supabaseAdmin.from('tower_events').select(EVENT_COLUMNS).eq('id', id).maybeSingle()
  if (error) readFailed(error, 'the event')
  return data ? mapEvent(data) : null
}

export async function insertEvent(input: { name: string; attemptsPerPlayer: number }): Promise<Outcome<{ event: EventRow }>> {
  const closedAt = new Date().toISOString()
  const { error: closeError } = await supabaseAdmin
    .from('tower_events')
    .update({ status: 'closed', closed_at: closedAt })
    .eq('status', 'open')
  if (closeError) return failure(closeError, 'Could not close the previous event.')
  const { data, error } = await supabaseAdmin
    .from('tower_events')
    .insert({ name: input.name, attempts_per_player: input.attemptsPerPlayer, status: 'open' })
    .select(EVENT_COLUMNS)
    .single()
  if (error || !data) return failure(error, 'Could not start a new event.')
  return { ok: true, event: mapEvent(data) }
}

export async function updateEvent(
  id: number,
  patch: Partial<{
    status: EventStatus
    attemptsPerPlayer: number
    winnerPlayerId: string | null
    winnerHandle: string | null
    winnerScore: number | null
    announcedAt: string | null
  }>
): Promise<Outcome> {
  const row: Record<string, unknown> = {}
  if (patch.status !== undefined) {
    row.status = patch.status
    row.closed_at = patch.status === 'closed' ? new Date().toISOString() : null
  }
  if (patch.attemptsPerPlayer !== undefined) row.attempts_per_player = patch.attemptsPerPlayer
  if (patch.winnerPlayerId !== undefined) row.winner_player_id = patch.winnerPlayerId
  if (patch.winnerHandle !== undefined) row.winner_handle = patch.winnerHandle
  if (patch.winnerScore !== undefined) row.winner_score = patch.winnerScore
  if (patch.announcedAt !== undefined) row.announced_at = patch.announcedAt
  const { error } = await supabaseAdmin.from('tower_events').update(row).eq('id', id)
  if (error) return failure(error, 'Could not update the event.')
  return { ok: true }
}

// ---------------------------------------------------------------- players

export async function loadPlayerByToken(tokenHash: string): Promise<PlayerRow | null> {
  const { data, error } = await supabaseAdmin
    .from('tower_players')
    .select(PLAYER_COLUMNS)
    .eq('token_hash', tokenHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) readFailed(error, 'the player')
  return data ? mapPlayer(data) : null
}

export async function loadPlayer(id: string): Promise<PlayerRow | null> {
  const { data, error } = await supabaseAdmin.from('tower_players').select(PLAYER_COLUMNS).eq('id', id).maybeSingle()
  if (error) readFailed(error, 'the player')
  return data ? mapPlayer(data) : null
}

/**
 * Creates the player, or signs an existing one in on a new phone. An existing handle is only
 * re-linked when `allowRelink` is set (Instagram-verified pass) or the host has reset the
 * player's phone — otherwise anyone could type a rival's handle and burn their tries.
 */
export async function upsertPlayer(input: {
  eventId: number
  handle: string
  displayName: string | null
  followCheck: FollowCheckMode
  playPassId: string | null
  tokenHash: string
  allowRelink: boolean
}): Promise<Outcome<{ player: PlayerRow }>> {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('tower_players')
    .select(`${PLAYER_COLUMNS}, token_hash`)
    .eq('event_id', input.eventId)
    .eq('ig_handle', input.handle)
    .maybeSingle()
  if (findError) return failure(findError, 'Could not sign you in.')

  if (existing) {
    if (!input.allowRelink && existing.token_hash) {
      return { ok: false, error: 'handle-taken', code: 'handle-taken' }
    }
    const patch: Record<string, unknown> = { token_hash: input.tokenHash }
    if (input.displayName) patch.display_name = input.displayName
    if (input.playPassId) {
      patch.play_pass_id = input.playPassId
      patch.follow_check = input.followCheck
    }
    const { data, error } = await supabaseAdmin
      .from('tower_players')
      .update(patch)
      .eq('id', existing.id as string)
      .select(PLAYER_COLUMNS)
      .single()
    if (error || !data) return failure(error, 'Could not sign you in.')
    return { ok: true, player: mapPlayer(data) }
  }

  const { data, error } = await supabaseAdmin
    .from('tower_players')
    .insert({
      event_id: input.eventId,
      ig_handle: input.handle,
      display_name: input.displayName,
      follow_check: input.followCheck,
      play_pass_id: input.playPassId,
      token_hash: input.tokenHash,
    })
    .select(PLAYER_COLUMNS)
    .single()
  if (error?.code === '23505') {
    // Two phones registered the same handle at the same instant — retry as an update.
    return upsertPlayer(input)
  }
  if (error || !data) return failure(error, 'Could not sign you in.')
  return { ok: true, player: mapPlayer(data) }
}

export async function updatePlayer(
  id: string,
  patch: Partial<{ disqualified: boolean; bonusAttempts: number; clearToken: boolean }>
): Promise<Outcome> {
  const row: Record<string, unknown> = {}
  if (patch.clearToken) row.token_hash = null
  if (patch.disqualified !== undefined) row.disqualified = patch.disqualified
  if (patch.bonusAttempts !== undefined) row.bonus_attempts = patch.bonusAttempts
  const { error } = await supabaseAdmin.from('tower_players').update(row).eq('id', id)
  if (error) return failure(error, 'Could not update the player.')
  return { ok: true }
}

export async function listPlayers(eventId: number): Promise<PlayerRow[]> {
  return fetchAll(async (from, to) =>
    supabaseAdmin
      .from('tower_players')
      .select(PLAYER_COLUMNS)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .range(from, to)
  ).then((rows) => rows.map(mapPlayer))
}

export async function countPlayers(eventId: number): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('tower_players')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
  return error || count === null ? 0 : count
}

// ---------------------------------------------------------------- runs

export async function loadRun(id: string): Promise<RunRow | null> {
  const { data, error } = await supabaseAdmin.from('tower_runs').select(RUN_COLUMNS).eq('id', id).maybeSingle()
  if (error) readFailed(error, 'the game')
  return data ? mapRun(data) : null
}

export async function listPlayerRuns(playerId: string): Promise<RunRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .select(RUN_COLUMNS)
    .eq('player_id', playerId)
    .order('attempt', { ascending: true })
  if (error) readFailed(error, 'your games')
  return (data ?? []).map(mapRun)
}

export async function insertRun(input: {
  eventId: number
  playerId: string
  attempt: number
  seed: number
  startKey: string | null
}): Promise<Outcome<{ run: RunRow }>> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .insert({
      event_id: input.eventId,
      player_id: input.playerId,
      attempt: input.attempt,
      seed: input.seed,
      status: 'playing',
      start_key: input.startKey,
    })
    .select(RUN_COLUMNS)
    .single()
  if (error || !data) return failure(error, 'Could not start the game.')
  return { ok: true, run: mapRun(data) }
}

/** Only the first submission for a run is kept. Returns false if the run was already closed. */
export async function finishRun(
  id: string,
  result:
    | { status: 'finished'; intervalsMs: number[]; score: number; layers: number; perfects: number; bestCombo: number }
    | {
        status: 'rejected'
        intervalsMs: number[]
        reason: string
        score?: number
        layers?: number
        perfects?: number
        bestCombo?: number
      }
): Promise<Outcome<{ updated: boolean }>> {
  const row: Record<string, unknown> = {
    status: result.status,
    finished_at: new Date().toISOString(),
    intervals_ms: result.intervalsMs,
  }
  if (result.status === 'finished') {
    row.score = result.score
    row.layers = result.layers
    row.perfects = result.perfects
    row.best_combo = result.bestCombo
  } else {
    row.reject_reason = result.reason
    if (result.score !== undefined) {
      row.score = result.score
      row.layers = result.layers
      row.perfects = result.perfects
      row.best_combo = result.bestCombo
    }
  }
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .update(row)
    .eq('id', id)
    .eq('status', 'playing')
    .select('id')
    .maybeSingle()
  if (error) return failure(error, 'Could not save the score.')
  return { ok: true, updated: Boolean(data) }
}

export async function listRuns(eventId: number, limit: number): Promise<RunRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .select(RUN_COLUMNS)
    .eq('event_id', eventId)
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map(mapRun)
}

export async function listAllRuns(eventId: number): Promise<(RunRow & { intervalsMs: number[] | null })[]> {
  const rows = await fetchAll(async (from, to) =>
    supabaseAdmin
      .from('tower_runs')
      .select(`${RUN_COLUMNS}, intervals_ms`)
      .eq('event_id', eventId)
      .order('started_at', { ascending: true })
      .range(from, to)
  )
  return rows.map((row) => ({ ...mapRun(row), intervalsMs: (row.intervals_ms as number[] | null) ?? null }))
}

export async function countRuns(eventId: number, status: RunRow['status'], startedAfter?: string): Promise<number> {
  let query = supabaseAdmin
    .from('tower_runs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', status)
  if (startedAfter) query = query.gte('started_at', startedAfter)
  const { count, error } = await query
  return error || count === null ? 0 : count
}

export async function listRecentFinished(eventId: number, limit: number): Promise<(RunRow & { handle: string })[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .select(`${RUN_COLUMNS}, tower_players!inner(ig_handle, disqualified)`)
    .eq('event_id', eventId)
    .eq('status', 'finished')
    .eq('tower_players.disqualified', false)
    .order('finished_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((row) => {
    const joined = (row as { tower_players?: { ig_handle?: string } | { ig_handle?: string }[] }).tower_players
    const player = Array.isArray(joined) ? joined[0] : joined
    return { ...mapRun(row), handle: player?.ig_handle ?? 'player' }
  })
}

// ---------------------------------------------------------------- leaderboard

export async function loadLeaders(eventId: number, limit: number): Promise<LeaderRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_leaderboard')
    .select(LEADER_COLUMNS)
    .eq('event_id', eventId)
    .eq('disqualified', false)
    .order('score', { ascending: false })
    .order('perfects', { ascending: false })
    .order('finished_at', { ascending: true })
    .limit(limit)
  if (error || !data) return []
  return data.map(mapLeader)
}

export async function loadAllLeaders(eventId: number): Promise<LeaderRow[]> {
  const rows = await fetchAll(async (from, to) =>
    supabaseAdmin
      .from('tower_leaderboard')
      .select(LEADER_COLUMNS)
      .eq('event_id', eventId)
      .order('score', { ascending: false })
      .order('perfects', { ascending: false })
      .order('finished_at', { ascending: true })
      .range(from, to)
  )
  return rows.map(mapLeader)
}

/** Players whose best score beats `score`. Rank = this + 1. */
/** Players ranked above this best run — same order as the board: score, then perfect drops. */
export async function countLeadersAbove(eventId: number, score: number, perfects: number): Promise<number> {
  const s = Math.trunc(score)
  const p = Math.trunc(perfects)
  const { count, error } = await supabaseAdmin
    .from('tower_leaderboard')
    .select('player_id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('disqualified', false)
    .or(`score.gt.${s},and(score.eq.${s},perfects.gt.${p})`)
  return error || count === null ? 0 : count
}

// ---------------------------------------------------------------- helpers

type Row = Record<string, unknown>

async function fetchAll(
  page: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: DbError }>
): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; from < 100_000; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error || !data) break
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

function mapEvent(row: Row): EventRow {
  return {
    id: Number(row.id),
    name: String(row.name),
    status: row.status === 'closed' ? 'closed' : 'open',
    attemptsPerPlayer: Number(row.attempts_per_player),
    winnerPlayerId: (row.winner_player_id as string | null) ?? null,
    winnerHandle: (row.winner_handle as string | null) ?? null,
    winnerScore: row.winner_score === null || row.winner_score === undefined ? null : Number(row.winner_score),
    announcedAt: (row.announced_at as string | null) ?? null,
    createdAt: String(row.created_at),
  }
}

function mapPlayer(row: Row): PlayerRow {
  return {
    id: String(row.id),
    eventId: Number(row.event_id),
    handle: String(row.ig_handle),
    displayName: (row.display_name as string | null) ?? null,
    followCheck: row.follow_check === 'instagram' ? 'instagram' : 'honor',
    bonusAttempts: Number(row.bonus_attempts ?? 0),
    disqualified: row.disqualified === true,
    createdAt: String(row.created_at),
  }
}

function mapRun(row: Row): RunRow {
  return {
    id: String(row.id),
    eventId: Number(row.event_id),
    playerId: String(row.player_id),
    attempt: Number(row.attempt),
    seed: Number(row.seed),
    status: row.status as RunRow['status'],
    startedAt: String(row.started_at),
    finishedAt: (row.finished_at as string | null) ?? null,
    score: nullableNumber(row.score),
    layers: nullableNumber(row.layers),
    perfects: nullableNumber(row.perfects),
    bestCombo: nullableNumber(row.best_combo),
    rejectReason: (row.reject_reason as string | null) ?? null,
    startKey: (row.start_key as string | null) ?? null,
  }
}

function mapLeader(row: Row): LeaderRow {
  return {
    playerId: String(row.player_id),
    handle: String(row.ig_handle),
    displayName: (row.display_name as string | null) ?? null,
    disqualified: row.disqualified === true,
    runId: String(row.run_id),
    score: Number(row.score),
    layers: Number(row.layers),
    perfects: Number(row.perfects),
    finishedAt: String(row.finished_at),
  }
}

function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value)
}
