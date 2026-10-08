import 'server-only'

import { randomBytes, randomInt } from 'crypto'
import {
  COUNTDOWN_MS,
  DRAW_LIMIT,
  ENTRY_MS,
  GAME_MS,
  MAX_PLAYERS,
  PLAY_HANDLE,
  ROUND_WORDS,
  TICKET_ALPHABET,
} from '@/lib/play/constants'
import { derivePhase } from '@/lib/play/phase'
import {
  countVerifiedSince,
  insertEntry,
  insertPass,
  insertRound,
  listWinnerPassIds,
  loadEntries,
  loadPass,
  loadRounds,
  closeRound,
  resetDraws,
  saveTaps,
  type RoundRow,
} from '@/lib/play/repository'
import { scoreTaps, validateTaps, type RunFactors } from '@/lib/play/scoring'
import { pickWinner } from '@/lib/play/winner'
import type { PublicRound, PublicWinner, Standing } from '@/lib/play/types'

export type { PublicRound, PublicWinner, Standing } from '@/lib/play/types'

export function createTicketId(): string {
  const bytes = randomBytes(6)
  return Array.from(bytes, (byte) => TICKET_ALPHABET[byte % TICKET_ALPHABET.length]).join('')
}

export async function openPlayPass(): Promise<{ ok: true; ticket: string; dmUrl: string } | { ok: false; error: string }> {
  const ticket = createTicketId()
  const saved = await insertPass(ticket)
  if (!saved.ok) return saved
  return {
    ok: true,
    ticket,
    dmUrl: `https://ig.me/m/${PLAY_HANDLE}?ref=${ticket}`,
  }
}

export async function announceDraw(): Promise<{ ok: true; round: PublicRound } | { ok: false; error: string }> {
  const rounds = await loadRounds()
  if (rounds.some((round) => round.status === 'open')) {
    return { ok: false, error: 'A draw is already running. Let it finish before the next code.' }
  }
  const nextNumber = rounds.length + 1
  if (nextNumber > DRAW_LIMIT) return { ok: false, error: 'All five draws are already recorded.' }
  const now = Date.now()
  const openedAt = now
  const entryClosesAt = now + ENTRY_MS
  const startsAt = entryClosesAt + COUNTDOWN_MS
  const endsAt = startsAt + GAME_MS
  const used = new Set(rounds.map((round) => round.code))
  const code = ROUND_WORDS.find((word) => !used.has(word)) ?? ROUND_WORDS[0]
  const saved = await insertRound({
    roundNumber: nextNumber,
    code,
    seed: randomInt(1, 1_000_000_000),
    openedAt: new Date(openedAt).toISOString(),
    entryClosesAt: new Date(entryClosesAt).toISOString(),
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
  })
  if (!saved.ok) return saved
  const board = await loadBoard()
  const round = board.rounds.find((item) => item.roundNumber === nextNumber)
  if (!round) return { ok: false, error: 'The draw opened but could not be read back.' }
  return { ok: true, round }
}

export async function joinDraw(input: {
  ticket: string
  code: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const pass = await loadPass(input.ticket)
  if (!pass) return { ok: false, error: 'This phone has no play pass. Start again from the follow step.' }
  if (pass.status !== 'verified') {
    return { ok: false, error: pass.rejectionReason || 'Follow @tathastukeepsakes and send PLAY before the code will work.' }
  }
  const round = await currentOpenRound()
  if (!round) return { ok: false, error: 'Wait for the code on the monitor.' }
  const phase = phaseOf(round, Date.now())
  if (phase !== 'entry') return { ok: false, error: 'That code window has closed.' }
  if (round.code !== input.code) return { ok: false, error: 'That is not the code on the monitor.' }
  const entries = await loadEntries(round.roundNumber)
  if (entries.length >= MAX_PLAYERS && !entries.some((entry) => entry.passId === pass.id)) {
    return { ok: false, error: 'This draw is full.' }
  }
  return insertEntry({ roundNumber: round.roundNumber, passId: pass.id, username: pass.igUsername })
}

export async function recordRun(input: {
  ticket: string
  tapsMs: number[]
}): Promise<{ ok: true; factors: RunFactors } | { ok: false; error: string }> {
  const tapError = validateTaps(input.tapsMs)
  if (tapError) return { ok: false, error: tapError }
  const pass = await loadPass(input.ticket)
  if (!pass || pass.status !== 'verified') {
    return { ok: false, error: 'The follow check has not cleared, so this run cannot count.' }
  }
  const round = await currentOpenRound()
  if (!round) return { ok: false, error: 'This draw is already closed.' }
  const now = Date.now()
  const startsAt = Date.parse(round.startsAt)
  const endsAt = Date.parse(round.endsAt)
  if (now < startsAt + GAME_MS - 1_000) return { ok: false, error: 'The round is still printing.' }
  if (now > endsAt + 5_000) return { ok: false, error: 'The recording window for this draw has closed.' }
  const entries = await loadEntries(round.roundNumber)
  const entry = entries.find((item) => item.passId === pass.id)
  if (!entry) return { ok: false, error: 'You were not in this draw. The code has to be entered when it is announced.' }
  if (entry.submittedAt) {
    return { ok: true, factors: entry.factors ?? scoreTaps({ seed: round.seed, tapsMs: input.tapsMs }) }
  }
  const factors = scoreTaps({ seed: round.seed, tapsMs: input.tapsMs })
  const saved = await saveTaps({ roundNumber: round.roundNumber, passId: pass.id, taps: input.tapsMs, factors })
  if (!saved.ok) return saved
  return { ok: true, factors }
}

export async function loadBoard(): Promise<{
  serverNow: number
  verifiedCount: number
  rounds: PublicRound[]
}> {
  await finalizeDueRound()
  const rounds = await loadRounds()
  const now = Date.now()
  const since = new Date(now - 8 * 60 * 60 * 1000).toISOString()
  const verifiedCount = await countVerifiedSince(since)
  const publicRounds: PublicRound[] = []
  for (const round of rounds) {
    publicRounds.push(await presentRound(round, now, rounds))
  }
  return { serverNow: Date.now(), verifiedCount, rounds: publicRounds }
}

export async function loadPlayerState(ticket: string): Promise<{
  pass: { status: string; username: string | null; rejectionReason: string | null } | null
  joined: boolean
  round: PublicRound | null
  factors: RunFactors | null
  serverNow: number
}> {
  const board = await loadBoard()
  const pass = await loadPass(ticket)
  const active = board.rounds.find((round) => round.phase !== 'closed') ?? null
  const latest = active ?? board.rounds[board.rounds.length - 1] ?? null
  if (!pass || !latest) {
    return {
      pass: pass
        ? { status: pass.status, username: pass.igUsername, rejectionReason: pass.rejectionReason }
        : null,
      joined: false,
      round: latest,
      factors: null,
      serverNow: board.serverNow,
    }
  }
  const entries = await loadEntries(latest.roundNumber)
  const entry = entries.find((item) => item.passId === ticket) ?? null
  return {
    pass: { status: pass.status, username: pass.igUsername, rejectionReason: pass.rejectionReason },
    joined: Boolean(entry),
    round: entry ? latest : { ...latest, seed: null, code: null },
    factors: entry?.factors ?? null,
    serverNow: board.serverNow,
  }
}

export async function clearDraws(): Promise<{ ok: true } | { ok: false; error: string }> {
  return resetDraws()
}

async function finalizeDueRound(): Promise<void> {
  const round = await currentOpenRound()
  if (!round) return
  if (phaseOf(round, Date.now()) !== 'due') return
  const entries = await loadEntries(round.roundNumber)
  const priorWinners = new Set(await listWinnerPassIds())
  const winner = pickWinner(
    entries.map((entry) => ({
      passId: entry.passId,
      username: entry.igUsername || 'Player',
      composite: entry.factors?.composite ?? 0,
      accuracy: entry.factors?.accuracy ?? 0,
      clutch: entry.factors?.clutch ?? 0,
      submittedAtMs: entry.submittedAt ? Date.parse(entry.submittedAt) : 0,
      alreadyWon: priorWinners.has(entry.passId),
    }))
  )
  const winningEntry = winner ? entries.find((entry) => entry.passId === winner.passId) ?? null : null
  await closeRound({
    roundNumber: round.roundNumber,
    winnerPassId: winner?.passId ?? null,
    winnerUsername: winner?.username ?? null,
    winnerComposite: winner?.composite ?? null,
    winnerFactors: winningEntry?.factors ?? null,
    winnerTaps: winningEntry?.taps ?? null,
  })
}

async function presentRound(round: RoundRow, nowMs: number, rounds: RoundRow[]): Promise<PublicRound> {
  const phase = phaseOf(round, nowMs)
  const entries = await loadEntries(round.roundNumber)
  const earlierWinners = new Set(
    rounds
      .filter((item) => item.roundNumber < round.roundNumber && item.winnerPassId)
      .map((item) => item.winnerPassId as string)
  )
  const showCode = phase === 'entry'
  const showSeed = phase !== 'entry'
  return {
    roundNumber: round.roundNumber,
    phase,
    code: showCode ? round.code : null,
    seed: showSeed ? round.seed : null,
    entryClosesAt: Date.parse(round.entryClosesAt),
    startsAt: Date.parse(round.startsAt),
    endsAt: Date.parse(round.endsAt),
    joined: entries.map((entry) => entry.igUsername || 'Player'),
    standings: standingsFor(entries, earlierWinners),
    winner: winnerView(round),
  }
}

function standingsFor(entries: Awaited<ReturnType<typeof loadEntries>>, earlierWinners: Set<string>): Standing[] {
  return entries
    .filter((entry) => entry.factors)
    .map((entry) => ({
      username: entry.igUsername || 'Player',
      composite: entry.factors?.composite ?? 0,
      eligible: !earlierWinners.has(entry.passId),
    }))
    .sort((left, right) => right.composite - left.composite)
}

function winnerView(round: RoundRow): PublicWinner | null {
  if (!round.winnerUsername || !round.winnerFactors) return null
  return {
    username: round.winnerUsername,
    composite: round.winnerComposite ?? round.winnerFactors.composite,
    accuracy: round.winnerFactors.accuracy,
    combo: round.winnerFactors.combo,
    speed: round.winnerFactors.speed,
    stability: round.winnerFactors.stability,
    clutch: round.winnerFactors.clutch,
    tapsMs: round.winnerTaps ?? [],
    seed: round.seed,
  }
}

async function currentOpenRound(): Promise<RoundRow | null> {
  const rounds = await loadRounds()
  return rounds.find((round) => round.status === 'open') ?? null
}

function phaseOf(round: RoundRow, nowMs: number) {
  return derivePhase({
    status: round.status,
    nowMs,
    entryClosesAtMs: Date.parse(round.entryClosesAt),
    startsAtMs: Date.parse(round.startsAt),
    endsAtMs: Date.parse(round.endsAt),
  })
}
