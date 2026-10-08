import {
  HANDLE_PATTERN,
  IDLE_LIMIT_MS,
  MAX_LAYERS,
  RUN_CLOCK_SLACK_MS,
  RUN_SUBMIT_WINDOW_MS,
  SUSPICIOUS_MIN_LAYERS,
  SUSPICIOUS_PERFECT_RATE,
} from '@/lib/tower/constants'

/**
 * Accepts "@name", "name", "Name ", or a pasted profile link and returns the
 * bare lowercase Instagram username, or null when it cannot be a username.
 */
export function normalizeHandle(input: string): string | null {
  let value = input.trim()
  const link = value.match(/instagram\.com\/([^/?#\s]+)/i)
  if (link) value = link[1]
  value = value.replace(/^@+/, '').trim().toLowerCase()
  if (!HANDLE_PATTERN.test(value)) return null
  if (value.startsWith('.') || value.endsWith('.') || value.includes('..')) return null
  return value
}

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

/** Number of tries a player has left this event. */
export function attemptsLeft(input: { allowed: number; bonus: number; used: number }): number {
  return Math.max(0, input.allowed + input.bonus - input.used)
}
