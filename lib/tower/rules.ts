import {
  IDLE_LIMIT_MS,
  MAX_COMBO_MULTIPLIER,
  MAX_LAYERS,
  MIN_TAP_GAP_MS,
  NAME_MAX_LENGTH,
  PERFECT_BONUS,
  POINTS_PER_LAYER,
  ROUND_CODE_LENGTH,
  ROUND_END_GRACE_MS,
  RUN_CLOCK_SLACK_MS,
  RUN_SUBMIT_WINDOW_MS,
  SUSPICIOUS_MIN_LAYERS,
  SUSPICIOUS_PERFECT_RATE,
} from '@/lib/tower/constants'
import type { RoundPhase, RoundStatus } from '@/lib/tower/types'

// ---------------------------------------------------------------- player details

/**
 * Turns what a visitor types into an E.164 WhatsApp number, or null.
 * A plain 10-digit Indian mobile (starting 6-9) gets +91; "+91 98…", "091…", "0091…" and
 * other countries written with + or 00 are accepted too.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim()
  const international = raw.startsWith('+') || raw.startsWith('00')
  let digits = raw.replace(/\D/g, '')
  if (international) {
    if (digits.startsWith('00')) digits = digits.slice(2)
  } else {
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null
    digits = `91${digits}`
  }
  if (digits.startsWith('91') && !/^91[6-9]\d{9}$/.test(digits)) return null
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null
  return `+${digits}`
}

/** "+919876543210" -> "+91 98•••••210" — enough for a player to recognise their own number. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const country = digits.startsWith('91') ? '91' : digits.slice(0, Math.max(1, digits.length - 10))
  const local = digits.slice(country.length)
  if (local.length < 6) return `+${country} ${'•'.repeat(local.length)}`
  return `+${country} ${local.slice(0, 2)}${'•'.repeat(local.length - 5)}${local.slice(-3)}`
}

/** Digits only, for https://wa.me/<digits>. */
export function whatsappDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * A small blocklist for the big screen. Not exhaustive — the host can hide anyone with one tap —
 * but it stops the obvious ones before a crowd sees them.
 */
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'asshole', 'bastard', 'slut', 'whore', 'nigger', 'nigga',
  'rape', 'porn', 'penis', 'vagina', 'boob', 'chutiya', 'chutia', 'chootiya', 'madarchod', 'mc', 'bc',
  'behenchod', 'bhenchod', 'benchod', 'bhosdi', 'bhosdike', 'bhosda', 'gandu', 'gaandu', 'lund', 'lauda',
  'lavda', 'loda', 'randi', 'harami', 'kutta', 'kutti', 'kamina', 'chod', 'jhaat', 'tatti', 'saala', 'saali',
  'hitler', 'nazi',
]
// Matched as whole words only: as substrings they hit real names (Kshitij, Ashit, Kutti, Randip).
const SHORT_BLOCKED = new Set([
  'mc', 'bc', 'chod', 'lund', 'loda', 'dick', 'shit', 'rape', 'kutta', 'kutti', 'saala', 'saali', 'tatti', 'randi',
])

function looksAbusive(name: string): boolean {
  const folded = name
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
  const words = folded.split(/[^a-z]+/).filter(Boolean)
  const joined = words.join('')
  return BLOCKED_WORDS.some((word) =>
    SHORT_BLOCKED.has(word) ? words.includes(word) : joined.includes(word)
  )
}

/** Returns the cleaned name for the big screen, or an error message for the player. */
export function cleanPlayerName(input: string): { ok: true; name: string } | { ok: false; error: string } {
  const name = input
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f<>{}[\]\\/"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (name.length < 2) return { ok: false, error: 'Enter your name (at least 2 letters).' }
  if (name.length > NAME_MAX_LENGTH) return { ok: false, error: `Keep your name under ${NAME_MAX_LENGTH + 1} letters.` }
  if (!/^[\p{L}\p{M}\p{N} .'_-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    return { ok: false, error: 'Use letters and numbers only in your name.' }
  }
  if (/https?:|www\.|\.com\b/i.test(name)) return { ok: false, error: 'Use your name, not a link.' }
  if (looksAbusive(name)) return { ok: false, error: 'Please pick a different name — it goes on the big screen.' }
  return { ok: true, name }
}

/** Accepts "4821", " 48 21 ", "4821\n". Returns the bare code or null. */
export function normalizeRoundCode(input: string): string | null {
  const digits = input.replace(/\s/g, '')
  return new RegExp(`^\\d{${ROUND_CODE_LENGTH}}$`).test(digits) ? digits : null
}

/** A fresh code that is not the previous one, so a stale code from the last round never works. */
export function newRoundCode(previous: string | null, random: () => number = Math.random): string {
  const span = 10 ** ROUND_CODE_LENGTH
  for (let tries = 0; tries < 20; tries += 1) {
    const code = String(Math.floor(random() * span)).padStart(ROUND_CODE_LENGTH, '0')
    // Skip codes that are easy to guess: 0000, 1111, 1234, 4321.
    const easy = /^(\d)\1+$/.test(code) || '0123456789'.includes(code) || '9876543210'.includes(code)
    if (code !== previous && !easy) return code
  }
  return previous === '7391' ? '2846' : '7391'
}

// ---------------------------------------------------------------- rounds

/** What the big screen should show for a round right now. */
export function roundPhase(input: {
  status: RoundStatus
  goAtMs: number | null
  nowMs: number
  joined: number
  finished: number
}): RoundPhase {
  if (input.status === 'lobby') return 'lobby'
  if (input.status === 'ended') return 'results'
  if (input.goAtMs !== null && input.nowMs < input.goAtMs) return 'countdown'
  if (input.joined > 0 && input.finished >= input.joined) return 'results'
  return 'playing'
}

/**
 * Highest score a run could honestly show after `elapsedMs` of play. The live score a phone
 * reports is display-only (the final score is replayed on the server), but this keeps a
 * tampered phone from putting a silly number on the big screen.
 */
export function plausibleProgress(input: { layers: number; score: number; elapsedMs: number }): {
  layers: number
  score: number
} {
  const maxLayers = Math.min(MAX_LAYERS, Math.max(0, Math.floor(Math.max(0, input.elapsedMs) / MIN_TAP_GAP_MS) + 1))
  const layers = Math.min(Math.max(0, Math.trunc(input.layers)), maxLayers)
  const maxScore = layers * (POINTS_PER_LAYER + PERFECT_BONUS * MAX_COMBO_MULTIPLIER)
  const score = Math.min(Math.max(0, Math.trunc(input.score)), maxScore)
  return { layers, score }
}

// ---------------------------------------------------------------- runs

/**
 * Any wait longer than the idle limit already ends the game, so longer values are
 * equivalent — clamp them instead of rejecting the run (a phone waking from the lock
 * screen can report a 40 s gap). Keeps live play and the server replay identical.
 */
export function clampIntervals(intervalsMs: readonly number[]): number[] {
  return intervalsMs.map((interval) => Math.min(Math.max(0, Math.round(interval)), IDLE_LIMIT_MS + 1))
}

/**
 * True when a run looks scripted: a tall tower where nearly every drop was pixel-perfect.
 * Never auto-rejected (a great player can get close) — the host console flags it for a look.
 */
export function isSuspiciousRun(run: { layers: number | null; perfects: number | null }): boolean {
  const layers = run.layers ?? 0
  const perfects = run.perfects ?? 0
  return layers >= SUSPICIOUS_MIN_LAYERS && perfects / layers >= SUSPICIOUS_PERFECT_RATE
}

/** Checks a submitted run before it is replayed. Returns a reason, or null if it is fine. */
export function checkRunTiming(input: {
  intervalsMs: readonly number[]
  startedAtMs: number
  nowMs: number
}): string | null {
  const { intervalsMs, startedAtMs, nowMs } = input
  if (intervalsMs.length > MAX_LAYERS + 1) return 'Too many drops for one run.'
  let total = 0
  for (const interval of intervalsMs) {
    if (!Number.isInteger(interval) || interval < 0 || interval > IDLE_LIMIT_MS + 1_000) {
      return 'A drop time is out of range.'
    }
    total += interval
  }
  const sinceStart = nowMs - startedAtMs
  if (sinceStart > RUN_SUBMIT_WINDOW_MS) return 'This run was submitted too late to count.'
  if (total > sinceStart + RUN_CLOCK_SLACK_MS) return 'The drop times do not match how long the run took.'
  return null
}

export interface RankedRun {
  playerId: string
  score: number
  perfects: number
  finishedAtMs: number
}

/** Higher score wins; then more perfect drops; then whoever got there first. */
export function compareRuns(left: RankedRun, right: RankedRun): number {
  if (right.score !== left.score) return right.score - left.score
  if (right.perfects !== left.perfects) return right.perfects - left.perfects
  if (left.finishedAtMs !== right.finishedAtMs) return left.finishedAtMs - right.finishedAtMs
  return left.playerId < right.playerId ? -1 : left.playerId > right.playerId ? 1 : 0
}

/** Keeps each player's single best run, sorted best first. */
export function bestPerPlayer<T extends RankedRun>(runs: readonly T[]): T[] {
  const best = new Map<string, T>()
  for (const run of runs) {
    const current = best.get(run.playerId)
    if (!current || compareRuns(run, current) < 0) best.set(run.playerId, run)
  }
  return Array.from(best.values()).sort(compareRuns)
}

// ---------------------------------------------------------------- round winners

export interface RoundEntry {
  playerId: string
  status: 'playing' | 'finished' | 'rejected'
  score: number | null
  perfects: number | null
  finishedAt: string | null
  disqualified?: boolean
}

/**
 * True when a finished game counts for its round: not hidden, and it landed before the
 * round ended (plus a short grace). A game that finishes later still counts for the day.
 */
export function countsForRound(run: RoundEntry, endedAtMs: number | null): boolean {
  if (run.status !== 'finished' || run.score === null || run.disqualified) return false
  if (endedAtMs === null || run.finishedAt === null) return true
  return Date.parse(run.finishedAt) <= endedAtMs + ROUND_END_GRACE_MS
}

/** The games that count for a round, best first (same tie-break as the day's leaderboard). */
export function roundStandings<T extends RoundEntry>(runs: readonly T[], endedAtMs: number | null): T[] {
  const ranked = runs.filter((run) => countsForRound(run, endedAtMs))
  const key = (run: T): RankedRun => ({
    playerId: run.playerId,
    score: run.score ?? 0,
    perfects: run.perfects ?? 0,
    finishedAtMs: run.finishedAt ? Date.parse(run.finishedAt) : 0,
  })
  return ranked.sort((left, right) => compareRuns(key(left), key(right)))
}

/** Exactly one winner per round: the top game that counts. Nobody wins with 0 points. */
export function roundWinner<T extends RoundEntry>(runs: readonly T[], endedAtMs: number | null): T | null {
  const [top] = roundStandings(runs, endedAtMs)
  return top && (top.score ?? 0) > 0 ? top : null
}

/** Number of rounds a player may still join this event. */
export function attemptsLeft(input: { allowed: number; bonus: number; used: number }): number {
  return Math.max(0, input.allowed + input.bonus - input.used)
}

/**
 * Screen labels. Two "Rahul"s on the board get the last two digits of their number,
 * "Rahul ·10" and "Rahul ·47", so the crowd (and the host) can tell them apart.
 */
export function screenNames(players: readonly { id: string; name: string; phone: string }[]): Map<string, string> {
  const counts = new Map<string, number>()
  for (const player of players) {
    const key = player.name.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const labels = new Map<string, string>()
  for (const player of players) {
    const duplicate = (counts.get(player.name.toLowerCase()) ?? 0) > 1
    labels.set(player.id, duplicate ? `${player.name} ·${player.phone.slice(-2)}` : player.name)
  }
  return labels
}
