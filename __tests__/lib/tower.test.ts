/**
 * @jest-environment node
 */

import {
  BASE_SIZE,
  GROW_AFTER_COMBO,
  IDLE_LIMIT_MS,
  MAX_LAYERS,
  PERFECT_BONUS,
  POINTS_PER_LAYER,
  ROUND_END_GRACE_MS,
  RUN_SUBMIT_WINDOW_MS,
  TRAVEL,
} from '@/lib/tower/constants'
import {
  axisFor,
  createTower,
  currentLevel,
  dropSlab,
  movingSlab,
  replayRun,
  slideOffset,
  speedFor,
} from '@/lib/tower/engine'
import {
  attemptsLeft,
  bestPerPlayer,
  checkRunTiming,
  clampIntervals,
  compareRuns,
  countsForRound,
  roundStandings,
  roundWinner,
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

/** First moment the sliding slab sits exactly over the one below it. */
function centredInterval(level: number): number {
  return Math.round(TRAVEL / speedFor(level))
}

describe('Tathastu Tower engine', () => {
  it('starts every slab off to one side and crosses the centre', () => {
    for (let level = 1; level < 40; level += 1) {
      expect(Math.abs(slideOffset(42, level, 0))).toBe(TRAVEL)
      expect(Math.abs(slideOffset(42, level, centredInterval(level)))).toBeLessThan(1)
    }
  })

  it('alternates the sliding axis', () => {
    expect(axisFor(1)).toBe('x')
    expect(axisFor(2)).toBe('z')
    expect(axisFor(3)).toBe('x')
  })

  it('gets faster as the tower grows, up to a cap', () => {
    expect(speedFor(2)).toBeGreaterThan(speedFor(1))
    expect(speedFor(1000)).toBe(speedFor(2000))
  })

  it('scores a perfect drop, builds a combo, and grows back after a streak', () => {
    const state = createTower(7)
    const first = dropSlab(state, centredInterval(1))
    expect(first.kind).toBe('perfect')
    expect(first.points).toBe(POINTS_PER_LAYER + PERFECT_BONUS)
    for (let level = 2; level <= GROW_AFTER_COMBO; level += 1) dropSlab(state, centredInterval(level))
    expect(state.combo).toBe(GROW_AFTER_COMBO)
    // Never grows past the base footprint.
    expect(state.slabs[state.slabs.length - 1].w).toBe(BASE_SIZE)
  })

  it('cuts an off-centre drop and keeps only the overlap', () => {
    const state = createTower(99)
    const interval = centredInterval(1) + 100
    const moving = movingSlab(state, interval)
    const outcome = dropSlab(state, interval)
    expect(outcome.kind).toBe('cut')
    const placed = outcome.placed!
    const chopped = outcome.chopped!
    expect(placed.w + chopped.w).toBeCloseTo(BASE_SIZE, 9)
    expect(placed.w).toBeCloseTo(BASE_SIZE - Math.abs(moving.x), 9)
    expect(state.combo).toBe(0)
  })

  it('grows a perfect slab back toward full size after it was cut', () => {
    const state = createTower(5)
    dropSlab(state, centredInterval(1) + 60)
    const cutWidth = state.slabs[1].w
    expect(cutWidth).toBeLessThan(BASE_SIZE)
    // Slabs alternate axis, so the streak needs one extra drop to reach an x-axis layer.
    for (let index = 0; index < GROW_AFTER_COMBO + 1; index += 1) {
      dropSlab(state, centredInterval(currentLevel(state)))
    }
    const top = state.slabs[state.slabs.length - 1]
    expect(top.w).toBeGreaterThan(cutWidth)
    expect(top.d).toBeGreaterThan(BASE_SIZE - 1)
  })

  it('ends the run when the slab misses entirely', () => {
    const state = createTower(3)
    const outcome = dropSlab(state, 0)
    expect(outcome.kind).toBe('miss')
    expect(state.over).toBe(true)
    expect(state.score).toBe(0)
    // Further drops are ignored.
    expect(dropSlab(state, centredInterval(1)).points).toBe(0)
  })

  it('ends the run when nobody taps for too long', () => {
    const state = createTower(3)
    expect(dropSlab(state, IDLE_LIMIT_MS + 1).kind).toBe('miss')
  })

  it('stops at the layer cap', () => {
    const intervals = Array.from({ length: MAX_LAYERS + 20 }, (_, index) => centredInterval(index + 1))
    const summary = replayRun(1, intervals)
    expect(summary.layers).toBe(MAX_LAYERS)
    expect(summary.over).toBe(true)
    expect(summary.used).toBe(MAX_LAYERS)
  })

  it('replays a run to exactly the same result as live play', () => {
    let rng = 12345
    const random = () => {
      rng = (rng * 1103515245 + 12345) % 2147483648
      return rng / 2147483648
    }
    for (let trial = 0; trial < 50; trial += 1) {
      const seed = Math.floor(random() * 2_000_000_000)
      const live = createTower(seed)
      const intervals: number[] = []
      while (!live.over && intervals.length < 200) {
        const level = currentLevel(live)
        const interval = centredInterval(level) + Math.round((random() - 0.5) * 120)
        intervals.push(interval)
        dropSlab(live, interval)
      }
      const replayed = replayRun(seed, intervals)
      expect(replayed.score).toBe(live.score)
      expect(replayed.layers).toBe(live.slabs.length - 1)
      expect(replayed.perfects).toBe(live.perfects)
    }
  })
})

describe('Tathastu Tower rules', () => {
  it('turns what visitors type into a WhatsApp number', () => {
    expect(normalizePhone('98765 43210')).toBe('+919876543210')
    expect(normalizePhone('098765-43210')).toBe('+919876543210')
    expect(normalizePhone('919876543210')).toBe('+919876543210')
    expect(normalizePhone('+91 98765 43210')).toBe('+919876543210')
    expect(normalizePhone('0091 9876543210')).toBe('+919876543210')
    expect(normalizePhone('+1 (415) 555-0123')).toBe('+14155550123')
    expect(normalizePhone('12345 67890')).toBeNull() // Indian mobiles start 6-9
    expect(normalizePhone('+91 12345 67890')).toBeNull()
    expect(normalizePhone('98765')).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('+1234567890123456')).toBeNull()
  })

  it('masks numbers for the phone and builds wa.me links', () => {
    expect(maskPhone('+919876543210')).toBe('+91 98•••••210')
    expect(maskPhone('+14155550123')).toBe('+1 41•••••123')
    expect(whatsappDigits('+91 98765 43210')).toBe('919876543210')
  })

  it('cleans names for the big screen', () => {
    expect(cleanPlayerName('  Priya   Sharma ')).toEqual({ ok: true, name: 'Priya Sharma' })
    expect(cleanPlayerName('राहुल')).toEqual({ ok: true, name: 'राहुल' })
    expect(cleanPlayerName("D'Souza-2")).toEqual({ ok: true, name: "D'Souza-2" })
    expect(cleanPlayerName('A').ok).toBe(false)
    expect(cleanPlayerName('a'.repeat(21)).ok).toBe(false)
    expect(cleanPlayerName('1234').ok).toBe(false)
    expect(cleanPlayerName('www.spam.com').ok).toBe(false)
    expect(cleanPlayerName('<b>hi</b>')).toEqual({ ok: true, name: 'bhib' })
  })

  it('blocks rude names without blocking real ones', () => {
    for (const rude of ['Fuck you', 'FUCKER', 'sh1t', 'MC', 'bc boy', 'Ch00tiya', 'chutiya', 'Lund', 'b1tch']) {
      expect(cleanPlayerName(rude).ok).toBe(false)
    }
    for (const real of ['Kshitij', 'Ashit', 'Randip', 'Mcintosh', 'Abc', 'Dickson', 'Shital', 'Sakshi']) {
      expect(cleanPlayerName(real)).toEqual({ ok: true, name: real })
    }
  })

  it('reads round codes and avoids repeats and easy ones', () => {
    expect(normalizeRoundCode(' 48 21 ')).toBe('4821')
    expect(normalizeRoundCode('482')).toBeNull()
    expect(normalizeRoundCode('48a1')).toBeNull()
    const sequence = [0.4821, 0.5678, 0.3907]
    // 4821 was last round's code and 5678 is too easy to guess.
    expect(newRoundCode('4821', () => sequence.shift() ?? 0.9)).toBe('3907')
    expect(newRoundCode(null, () => 0.1111)).not.toBe('1111')
    expect(newRoundCode('7391', () => 0)).toMatch(/^\d{4}$/)
    expect(newRoundCode('7391', () => 0)).not.toBe('7391')
    for (let index = 0; index < 200; index += 1) expect(newRoundCode(null)).toMatch(/^\d{4}$/)
  })

  it('derives the big-screen phase of a round', () => {
    const base = { goAtMs: 10_000, joined: 3, finished: 0 }
    expect(roundPhase({ ...base, status: 'lobby', goAtMs: null, nowMs: 0 })).toBe('lobby')
    expect(roundPhase({ ...base, status: 'playing', nowMs: 9_000 })).toBe('countdown')
    expect(roundPhase({ ...base, status: 'playing', nowMs: 11_000 })).toBe('playing')
    expect(roundPhase({ ...base, status: 'playing', nowMs: 11_000, finished: 3 })).toBe('results')
    expect(roundPhase({ ...base, status: 'playing', nowMs: 11_000, joined: 0 })).toBe('playing')
    expect(roundPhase({ ...base, status: 'ended', nowMs: 0 })).toBe('results')
  })

  it('caps live progress at what is physically possible', () => {
    expect(plausibleProgress({ layers: 500, score: 99_999, elapsedMs: 0 }).layers).toBeLessThanOrEqual(1)
    const honest = plausibleProgress({ layers: 10, score: 120, elapsedMs: 20_000 })
    expect(honest).toEqual({ layers: 10, score: 120 })
    expect(plausibleProgress({ layers: -4, score: -1, elapsedMs: 5_000 })).toEqual({ layers: 0, score: 0 })
    expect(plausibleProgress({ layers: 10, score: 1e9, elapsedMs: 60_000 }).score).toBeLessThan(1e9)
  })

  it('tells players with the same name apart on the screen', () => {
    const labels = screenNames([
      { id: 'a', name: 'Priya', phone: '+919876543210' },
      { id: 'b', name: 'priya', phone: '+919811111177' },
      { id: 'c', name: 'Rahul', phone: '+919822222222' },
    ])
    expect(labels.get('a')).toBe('Priya ·10')
    expect(labels.get('b')).toBe('priya ·77')
    expect(labels.get('c')).toBe('Rahul')
  })

  it('rejects runs whose timings do not add up', () => {
    const startedAtMs = 1_000_000
    expect(checkRunTiming({ intervalsMs: [1000, 1000], startedAtMs, nowMs: startedAtMs + 2500 })).toBeNull()
    expect(checkRunTiming({ intervalsMs: [60_000], startedAtMs, nowMs: startedAtMs + 2500 })).toMatch(/range/)
    expect(checkRunTiming({ intervalsMs: [9000, 9000], startedAtMs, nowMs: startedAtMs + 2000 })).toMatch(/match/)
    expect(checkRunTiming({ intervalsMs: [1.5], startedAtMs, nowMs: startedAtMs + 2000 })).toMatch(/range/)
    expect(
      checkRunTiming({ intervalsMs: [], startedAtMs, nowMs: startedAtMs + RUN_SUBMIT_WINDOW_MS + 1 })
    ).toMatch(/late/)
  })

  it('ranks by score, then perfects, then whoever got there first', () => {
    const runs = [
      { playerId: 'a', score: 500, perfects: 3, finishedAtMs: 30 },
      { playerId: 'b', score: 500, perfects: 5, finishedAtMs: 40 },
      { playerId: 'c', score: 500, perfects: 5, finishedAtMs: 20 },
      { playerId: 'a', score: 700, perfects: 1, finishedAtMs: 50 },
      { playerId: 'd', score: 100, perfects: 0, finishedAtMs: 10 },
    ]
    const board = bestPerPlayer(runs)
    expect(board.map((run) => run.playerId)).toEqual(['a', 'c', 'b', 'd'])
    expect(board[0].score).toBe(700)
    expect(compareRuns(runs[0], runs[0])).toBe(0)
  })

  it('counts tries left including staff top-ups', () => {
    expect(attemptsLeft({ allowed: 3, bonus: 0, used: 1 })).toBe(2)
    expect(attemptsLeft({ allowed: 3, bonus: 1, used: 3 })).toBe(1)
    expect(attemptsLeft({ allowed: 3, bonus: 0, used: 5 })).toBe(0)
  })

  it('clamps long gaps to a timeout instead of rejecting the run', () => {
    const intervals = [600, 40_000, -5, 712.4]
    const clamped = clampIntervals(intervals)
    expect(clamped).toEqual([600, IDLE_LIMIT_MS + 1, 0, 712])
    // A clamped gap ends the run exactly where the unclamped one would have.
    const seed = 99
    const live = createTower(seed)
    for (const interval of [600, 40_000]) if (!live.over) dropSlab(live, interval)
    const replayed = replayRun(seed, clamped)
    expect(replayed.over).toBe(true)
    expect(replayed.score).toBe(live.score)
    expect(replayed.layers).toBe(live.slabs.length - 1)
    expect(checkRunTiming({ intervalsMs: clamped, startedAtMs: 0, nowMs: 60_000 })).toBeNull()
  })

  it('flags runs where nearly every drop was perfect', () => {
    expect(isSuspiciousRun({ layers: 40, perfects: 38 })).toBe(true)
    expect(isSuspiciousRun({ layers: 40, perfects: 12 })).toBe(false)
    expect(isSuspiciousRun({ layers: 6, perfects: 6 })).toBe(false)
    expect(isSuspiciousRun({ layers: null, perfects: null })).toBe(false)
    // A bot that taps the computed centre every time is caught.
    const bot = replayRun(7, Array.from({ length: 60 }, (_, index) => centredInterval(index + 1)))
    expect(isSuspiciousRun(bot)).toBe(true)
  })
})

describe('Tathastu Tower round winners', () => {
  const ended = Date.parse('2026-10-08T12:00:00.000Z')
  const at = (offsetMs: number) => new Date(ended + offsetMs).toISOString()
  const game = (playerId: string, score: number, perfects: number, finishedOffsetMs: number, extra = {}) => ({
    playerId,
    status: 'finished' as const,
    score,
    perfects,
    finishedAt: at(finishedOffsetMs),
    ...extra,
  })

  it('picks exactly one winner: top score, then more perfect drops, then who finished first', () => {
    const runs = [
      game('a', 900, 10, -9_000),
      game('b', 1_200, 20, -8_000),
      game('c', 1_200, 22, -5_000),
      game('d', 1_200, 22, -7_000),
    ]
    expect(roundWinner(runs, ended)?.playerId).toBe('d')
    expect(roundStandings(runs, ended).map((run) => run.playerId)).toEqual(['d', 'c', 'b', 'a'])
  })

  it('does not let a game that finished after the round ended win it', () => {
    const runs = [game('early', 500, 5, -1_000), game('late', 2_000, 30, ROUND_END_GRACE_MS + 1)]
    expect(roundWinner(runs, ended)?.playerId).toBe('early')
    expect(countsForRound(runs[1], ended)).toBe(false)
    // ...but a game landing within the grace (same moment as End round) still counts.
    expect(countsForRound(game('photo-finish', 2_000, 30, ROUND_END_GRACE_MS - 1), ended)).toBe(true)
    // A round that is still running counts every finished game.
    expect(roundWinner(runs, null)?.playerId).toBe('late')
  })

  it('skips hidden players, unfinished and rejected games, so the next best wins', () => {
    const runs = [
      game('cheat', 5_000, 50, -100, { disqualified: true }),
      { ...game('rejected', 4_000, 40, -100), status: 'rejected' as const },
      { ...game('still-playing', 0, 0, 0), status: 'playing' as const, score: null, finishedAt: null },
      game('honest', 300, 3, -100),
    ]
    expect(roundWinner(runs, ended)?.playerId).toBe('honest')
  })

  it('has no winner when nobody scored', () => {
    expect(roundWinner([game('a', 0, 0, -100), game('b', 0, 0, -50)], ended)).toBeNull()
    expect(roundWinner([], ended)).toBeNull()
  })
})
