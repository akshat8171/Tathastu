import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { RunFactors } from '@/lib/play/scoring'

export interface PassRow {
  id: string
  status: 'pending' | 'verified' | 'rejected'
  igScopedId: string | null
  igUsername: string | null
  rejectionReason: string | null
}

export interface RoundRow {
  roundNumber: number
  code: string
  seed: number
  status: 'open' | 'closed'
  openedAt: string
  entryClosesAt: string
  startsAt: string
  endsAt: string
  winnerPassId: string | null
  winnerUsername: string | null
  winnerComposite: number | null
  winnerFactors: RunFactors | null
  winnerTaps: number[] | null
}

export interface EntryRow {
  roundNumber: number
  passId: string
  igUsername: string | null
  taps: number[] | null
  factors: RunFactors | null
  composite: number | null
  submittedAt: string | null
}

function missingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  return error.code === '42P01' || message.includes('does not exist') || message.includes('schema cache')
}

export async function insertPass(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin.from('play_passes').insert({ id, status: 'pending' })
  if (error) return { ok: false, error: tableError(error, 'Could not open a play pass.') }
  return { ok: true }
}

export async function loadPass(id: string): Promise<PassRow | null> {
  const { data, error } = await supabaseAdmin
    .from('play_passes')
    .select('id, status, ig_scoped_id, ig_username, rejection_reason')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return mapPass(data)
}

export async function markPassVerified(input: {
  ticket: string
  igScopedId: string
  username: string | null
}): Promise<'verified' | 'missing'> {
  await clearScopedId(input.igScopedId, input.ticket)
  const { data, error } = await supabaseAdmin
    .from('play_passes')
    .update({
      status: 'verified',
      ig_scoped_id: input.igScopedId,
      ig_username: input.username,
      rejection_reason: null,
      verified_at: new Date().toISOString(),
    })
    .eq('id', input.ticket)
    .select('id')
    .maybeSingle()
  if (error || !data) return 'missing'
  return 'verified'
}

export async function markPassRejected(input: {
  ticket: string
  igScopedId: string
  username: string | null
  reason: string
}): Promise<void> {
  await supabaseAdmin
    .from('play_passes')
    .update({
      status: 'rejected',
      ig_scoped_id: input.igScopedId,
      ig_username: input.username,
      rejection_reason: input.reason,
      verified_at: null,
    })
    .eq('id', input.ticket)
  const openRounds = await loadRounds()
  const openIds = openRounds.filter((round) => round.status === 'open').map((round) => round.roundNumber)
  if (openIds.length === 0) return
  await supabaseAdmin.from('play_entries').delete().eq('pass_id', input.ticket).in('round_number', openIds)
}

export async function countVerifiedSince(iso: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('play_passes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'verified')
    .gte('verified_at', iso)
  if (error || count === null) return 0
  return count
}

export async function loadRounds(): Promise<RoundRow[]> {
  const { data, error } = await supabaseAdmin
    .from('play_rounds')
    .select(
      'round_number, code, seed, status, opened_at, entry_closes_at, starts_at, ends_at, winner_pass_id, winner_username, winner_composite, winner_factors, winner_taps'
    )
    .order('round_number', { ascending: true })
  if (error || !data) return []
  return data.map(mapRound)
}

export async function insertRound(row: {
  roundNumber: number
  code: string
  seed: number
  openedAt: string
  entryClosesAt: string
  startsAt: string
  endsAt: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin.from('play_rounds').insert({
    round_number: row.roundNumber,
    code: row.code,
    seed: row.seed,
    status: 'open',
    opened_at: row.openedAt,
    entry_closes_at: row.entryClosesAt,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
  })
  if (error) return { ok: false, error: tableError(error, 'Could not open the draw.') }
  return { ok: true }
}

export async function loadEntries(roundNumber: number): Promise<EntryRow[]> {
  const { data, error } = await supabaseAdmin
    .from('play_entries')
    .select('round_number, pass_id, ig_username, taps, factors, composite, submitted_at')
    .eq('round_number', roundNumber)
  if (error || !data) return []
  return data.map(mapEntry)
}

export async function insertEntry(input: {
  roundNumber: number
  passId: string
  username: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin.from('play_entries').insert({
    round_number: input.roundNumber,
    pass_id: input.passId,
    ig_username: input.username,
  })
  if (error) {
    if (error.code === '23505') return { ok: true }
    return { ok: false, error: tableError(error, 'Could not join this draw.') }
  }
  return { ok: true }
}

export async function saveTaps(input: {
  roundNumber: number
  passId: string
  taps: number[]
  factors: RunFactors
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin
    .from('play_entries')
    .update({
      taps: input.taps,
      factors: input.factors,
      composite: input.factors.composite,
      submitted_at: new Date().toISOString(),
    })
    .eq('round_number', input.roundNumber)
    .eq('pass_id', input.passId)
    .is('submitted_at', null)
  if (error) return { ok: false, error: 'Could not record this run.' }
  return { ok: true }
}

export async function closeRound(input: {
  roundNumber: number
  winnerPassId: string | null
  winnerUsername: string | null
  winnerComposite: number | null
  winnerFactors: RunFactors | null
  winnerTaps: number[] | null
}): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('play_rounds')
    .update({
      status: 'closed',
      winner_pass_id: input.winnerPassId,
      winner_username: input.winnerUsername,
      winner_composite: input.winnerComposite,
      winner_factors: input.winnerFactors,
      winner_taps: input.winnerTaps,
      closed_at: new Date().toISOString(),
    })
    .eq('round_number', input.roundNumber)
    .eq('status', 'open')
    .select('round_number')
    .maybeSingle()
  return !error && Boolean(data)
}

export async function resetDraws(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: entryError } = await supabaseAdmin.from('play_entries').delete().gte('round_number', 1)
  if (entryError) return { ok: false, error: tableError(entryError, 'Could not reset entries.') }
  const { error } = await supabaseAdmin.from('play_rounds').delete().gte('round_number', 1)
  if (error) return { ok: false, error: tableError(error, 'Could not reset draws.') }
  return { ok: true }
}

export async function listWinnerPassIds(): Promise<string[]> {
  const rounds = await loadRounds()
  return rounds.map((round) => round.winnerPassId).filter((id): id is string => Boolean(id))
}

async function clearScopedId(igScopedId: string, keepTicket: string): Promise<void> {
  await supabaseAdmin
    .from('play_passes')
    .update({
      ig_scoped_id: null,
      status: 'rejected',
      rejection_reason: 'This Instagram account opened a newer play pass.',
    })
    .eq('ig_scoped_id', igScopedId)
    .neq('id', keepTicket)
}

function tableError(error: { message?: string; code?: string }, fallback: string): string {
  if (missingTable(error)) return 'Run supabase/migration-016-play-rounds.sql in the SQL editor.'
  return fallback
}

function mapPass(row: {
  id: string
  status: PassRow['status']
  ig_scoped_id: string | null
  ig_username: string | null
  rejection_reason: string | null
}): PassRow {
  return {
    id: row.id,
    status: row.status,
    igScopedId: row.ig_scoped_id,
    igUsername: row.ig_username,
    rejectionReason: row.rejection_reason,
  }
}

function mapRound(row: {
  round_number: number
  code: string
  seed: number
  status: 'open' | 'closed'
  opened_at: string
  entry_closes_at: string
  starts_at: string
  ends_at: string
  winner_pass_id: string | null
  winner_username: string | null
  winner_composite: number | null
  winner_factors: RunFactors | null
  winner_taps: number[] | null
}): RoundRow {
  return {
    roundNumber: row.round_number,
    code: row.code,
    seed: row.seed,
    status: row.status,
    openedAt: row.opened_at,
    entryClosesAt: row.entry_closes_at,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    winnerPassId: row.winner_pass_id,
    winnerUsername: row.winner_username,
    winnerComposite: row.winner_composite,
    winnerFactors: row.winner_factors,
    winnerTaps: row.winner_taps,
  }
}

function mapEntry(row: {
  round_number: number
  pass_id: string
  ig_username: string | null
  taps: number[] | null
  factors: RunFactors | null
  composite: number | null
  submitted_at: string | null
}): EntryRow {
  return {
    roundNumber: row.round_number,
    passId: row.pass_id,
    igUsername: row.ig_username,
    taps: row.taps,
    factors: row.factors,
    composite: row.composite,
    submittedAt: row.submitted_at,
  }
}
