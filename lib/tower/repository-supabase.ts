import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { EventStatus, RoundStatus } from '@/lib/tower/types'

/** Thin Supabase layer for Tathastu Tower. No game rules live here. */

export interface EventRow {
  id: number
  name: string
  status: EventStatus
  attemptsPerPlayer: number
  showCode: boolean
  winnerPlayerId: string | null
  winnerName: string | null
  winnerScore: number | null
  announcedAt: string | null
  createdAt: string
}

export interface RoundRow {
  id: number
  eventId: number
  number: number
  code: string
  status: RoundStatus
  seed: number
  goAt: string | null
  endedAt: string | null
  createdAt: string
}

export interface PlayerRow {
  id: string
  eventId: number
  phone: string
  name: string
  marketingOptIn: boolean
  bonusAttempts: number
  disqualified: boolean
  createdAt: string
}

export interface RunRow {
  id: string
  eventId: number
  playerId: string
  roundId: number | null
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
  progressScore: number | null
  progressLayers: number | null
}

/** A run in a round, with who played it. */
export interface RoundRunRow extends RunRow {
  name: string
  phone: string
  disqualified: boolean
}

export interface LeaderRow {
  playerId: string
  name: string
  phone: string
  disqualified: boolean
  runId: string
  score: number
  layers: number
  perfects: number
  finishedAt: string
}

export type Outcome<T = object> = ({ ok: true } & T) | { ok: false; error: string; code?: string }

export const MIGRATION_HINT = 'The game database is not set up yet. Run supabase/migration-017-tower.sql in the Supabase SQL editor.'
const PAGE = 1000

const EVENT_COLUMNS =
  'id, name, status, attempts_per_player, show_code, winner_player_id, winner_name, winner_score, announced_at, created_at'
const ROUND_COLUMNS = 'id, event_id, number, code, status, seed, go_at, ended_at, created_at'
const PLAYER_COLUMNS =
  'id, event_id, phone, display_name, marketing_opt_in, bonus_attempts, disqualified, created_at'
const RUN_COLUMNS =
  'id, event_id, player_id, round_id, attempt, seed, status, started_at, finished_at, score, layers, perfects, best_combo, reject_reason, progress_score, progress_layers'
const LEADER_COLUMNS = 'player_id, display_name, phone, disqualified, run_id, score, layers, perfects, finished_at'

type DbError = { message?: string; code?: string } | null

function failure(error: DbError, fallback: string): { ok: false; error: string; code?: string } {
  const message = (error?.message || '').toLowerCase()
  const missing =
    error?.code === '42P01' ||
    error?.code === '42703' ||
    error?.code === 'PGRST205' ||
    error?.code === 'PGRST204' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  return { ok: false, error: missing ? MIGRATION_HINT : fallback, code: error?.code }
}

/**
 * Reads that decide "who is this / does this exist" must not turn a database blip into
 * "not found" — that would sign a player out or drop their score. Throw instead; the
 * route's guard() answers 503 and the phone retries.
 */
export class TowerReadError extends Error {}
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
    showCode: boolean
    winnerPlayerId: string | null
    winnerName: string | null
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
  if (patch.showCode !== undefined) row.show_code = patch.showCode
  if (patch.winnerPlayerId !== undefined) row.winner_player_id = patch.winnerPlayerId
  if (patch.winnerName !== undefined) row.winner_name = patch.winnerName
  if (patch.winnerScore !== undefined) row.winner_score = patch.winnerScore
  if (patch.announcedAt !== undefined) row.announced_at = patch.announcedAt
  const { error } = await supabaseAdmin.from('tower_events').update(row).eq('id', id)
  if (error) return failure(error, 'Could not update the event.')
  return { ok: true }
}

// ---------------------------------------------------------------- rounds

export async function loadLatestRound(eventId: number): Promise<RoundRow | null> {
  const { data, error } = await supabaseAdmin
    .from('tower_rounds')
    .select(ROUND_COLUMNS)
    .eq('event_id', eventId)
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) readFailed(error, 'the round')
  return data ? mapRound(data) : null
}

export async function loadRound(id: number): Promise<RoundRow | null> {
  const { data, error } = await supabaseAdmin.from('tower_rounds').select(ROUND_COLUMNS).eq('id', id).maybeSingle()
  if (error) readFailed(error, 'the round')
  return data ? mapRound(data) : null
}

export async function insertRound(input: {
  eventId: number
  number: number
  code: string
  seed: number
}): Promise<Outcome<{ round: RoundRow }>> {
  const { data, error } = await supabaseAdmin
    .from('tower_rounds')
    .insert({ event_id: input.eventId, number: input.number, code: input.code, seed: input.seed, status: 'lobby' })
    .select(ROUND_COLUMNS)
    .single()
  if (error || !data) return failure(error, 'Could not open a new round.')
  return { ok: true, round: mapRound(data) }
}

/** Moves a round on only if it is still in `from` — two host clicks can never skip a state. */
export async function updateRound(
  id: number,
  from: RoundStatus[],
  patch: Partial<{ status: RoundStatus; goAt: string | null; endedAt: string | null }>
): Promise<Outcome<{ updated: boolean }>> {
  const row: Record<string, unknown> = {}
  if (patch.status !== undefined) row.status = patch.status
  if (patch.goAt !== undefined) row.go_at = patch.goAt
  if (patch.endedAt !== undefined) row.ended_at = patch.endedAt
  const { data, error } = await supabaseAdmin
    .from('tower_rounds')
    .update(row)
    .eq('id', id)
    .in('status', from)
    .select('id')
    .maybeSingle()
  if (error) return failure(error, 'Could not update the round.')
  return { ok: true, updated: Boolean(data) }
}

export async function listRounds(eventId: number): Promise<RoundRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_rounds')
    .select(ROUND_COLUMNS)
    .eq('event_id', eventId)
    .order('number', { ascending: true })
  if (error || !data) return []
  return data.map(mapRound)
}

/** Closes every unfinished game in a round that never started, so nobody loses a turn. */
export async function cancelRoundRuns(roundId: number, reason: string): Promise<Outcome> {
  const { error } = await supabaseAdmin
    .from('tower_runs')
    .update({ status: 'rejected', reject_reason: reason, finished_at: new Date().toISOString() })
    .eq('round_id', roundId)
    .eq('status', 'playing')
  if (error) return failure(error, 'Could not close the round.')
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
 * Creates the player, or signs an existing number in again after "Next player" or a host
 * "Reset phone". A number that is still signed in on another phone is refused — otherwise
 * anyone could type a rival's number and use up their rounds.
 */
export async function upsertPlayer(input: {
  eventId: number
  phone: string
  name: string
  marketingOptIn: boolean
  tokenHash: string
}): Promise<Outcome<{ player: PlayerRow }>> {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('tower_players')
    .select(`${PLAYER_COLUMNS}, token_hash`)
    .eq('event_id', input.eventId)
    .eq('phone', input.phone)
    .maybeSingle()
  if (findError) return failure(findError, 'Could not sign you in.')

  if (existing) {
    if (existing.token_hash) return { ok: false, error: 'phone-taken', code: 'phone-taken' }
    const { data, error } = await supabaseAdmin
      .from('tower_players')
      .update({
        token_hash: input.tokenHash,
        display_name: input.name,
        marketing_opt_in: input.marketingOptIn || existing.marketing_opt_in === true,
      })
      .eq('id', existing.id as string)
      .is('token_hash', null)
      .select(PLAYER_COLUMNS)
      .maybeSingle()
    if (error) return failure(error, 'Could not sign you in.')
    if (!data) return { ok: false, error: 'phone-taken', code: 'phone-taken' }
    return { ok: true, player: mapPlayer(data) }
  }

  const { data, error } = await supabaseAdmin
    .from('tower_players')
    .insert({
      event_id: input.eventId,
      phone: input.phone,
      display_name: input.name,
      marketing_opt_in: input.marketingOptIn,
      token_hash: input.tokenHash,
    })
    .select(PLAYER_COLUMNS)
    .single()
  // Two phones registered the same number at the same instant — the other one won.
  if (error?.code === '23505') return { ok: false, error: 'phone-taken', code: 'phone-taken' }
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

/** code '23505' when this player already has a game in the round (or that attempt number). */
export async function insertRun(input: {
  eventId: number
  playerId: string
  roundId: number
  attempt: number
  seed: number
}): Promise<Outcome<{ run: RunRow }>> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .insert({
      event_id: input.eventId,
      player_id: input.playerId,
      round_id: input.roundId,
      attempt: input.attempt,
      seed: input.seed,
      status: 'playing',
    })
    .select(RUN_COLUMNS)
    .single()
  if (error || !data) return failure(error, 'Could not join the round.')
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

/** Live score for the big screen. Best effort: a lost update just means a slightly stale bar. */
export async function saveProgress(
  runId: string,
  playerId: string,
  progress: { score: number; layers: number }
): Promise<Outcome<{ updated: boolean }>> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .update({ progress_score: progress.score, progress_layers: progress.layers, progress_at: new Date().toISOString() })
    .eq('id', runId)
    .eq('player_id', playerId)
    .eq('status', 'playing')
    .select('id')
    .maybeSingle()
  if (error) return failure(error, 'Could not save progress.')
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

export async function countRuns(eventId: number, status: RunRow['status']): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('tower_runs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', status)
  return error || count === null ? 0 : count
}

/** Every game in one round, in join order, with the player's name. */
export async function listRoundRuns(roundId: number): Promise<RoundRunRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tower_runs')
    .select(`${RUN_COLUMNS}, tower_players!inner(display_name, phone, disqualified)`)
    .eq('round_id', roundId)
    .order('started_at', { ascending: true })
    .limit(500)
  if (error) readFailed(error, 'the round')
  return ((data ?? []) as Row[]).map(withPlayer)
}

/**
 * Every finished game played in a round this event, with the player's name — enough to work
 * out each round's winner. No tap timings, so it stays light enough for the public board.
 */
export async function listEventResults(eventId: number): Promise<RoundRunRow[]> {
  const rows: Row[] = []
  for (let from = 0; from < 100_000; from += PAGE) {
    const { data, error } = await supabaseAdmin
      .from('tower_runs')
      .select(`${RUN_COLUMNS}, tower_players!inner(display_name, phone, disqualified)`)
      .eq('event_id', eventId)
      .eq('status', 'finished')
      .not('round_id', 'is', null)
      .order('finished_at', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) readFailed(error, 'the round results')
    rows.push(...((data ?? []) as Row[]))
    if (!data || data.length < PAGE) break
  }
  return rows.map(withPlayer)
}

function withPlayer(row: Row): RoundRunRow {
  const joined = (row as { tower_players?: PlayerJoin | PlayerJoin[] }).tower_players
  const player = Array.isArray(joined) ? joined[0] : joined
  return {
    ...mapRun(row),
    name: player?.display_name ?? 'Player',
    phone: player?.phone ?? '',
    disqualified: player?.disqualified === true,
  }
}

type PlayerJoin = { display_name?: string | null; phone?: string | null; disqualified?: boolean }

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
    showCode: row.show_code === true,
    winnerPlayerId: (row.winner_player_id as string | null) ?? null,
    winnerName: (row.winner_name as string | null) ?? null,
    winnerScore: nullableNumber(row.winner_score),
    announcedAt: (row.announced_at as string | null) ?? null,
    createdAt: String(row.created_at),
  }
}

function mapRound(row: Row): RoundRow {
  const status = row.status === 'playing' || row.status === 'ended' ? row.status : 'lobby'
  return {
    id: Number(row.id),
    eventId: Number(row.event_id),
    number: Number(row.number),
    code: String(row.code),
    status,
    seed: Number(row.seed),
    goAt: (row.go_at as string | null) ?? null,
    endedAt: (row.ended_at as string | null) ?? null,
    createdAt: String(row.created_at),
  }
}

function mapPlayer(row: Row): PlayerRow {
  return {
    id: String(row.id),
    eventId: Number(row.event_id),
    phone: String(row.phone ?? ''),
    name: String(row.display_name ?? 'Player'),
    marketingOptIn: row.marketing_opt_in === true,
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
    roundId: nullableNumber(row.round_id),
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
    progressScore: nullableNumber(row.progress_score),
    progressLayers: nullableNumber(row.progress_layers),
  }
}

function mapLeader(row: Row): LeaderRow {
  return {
    playerId: String(row.player_id),
    name: String(row.display_name ?? 'Player'),
    phone: String(row.phone ?? ''),
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
