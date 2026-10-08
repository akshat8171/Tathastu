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
  isSuspiciousRun,
  normalizeHandle,
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
  it('cleans up Instagram handles', () => {
    expect(normalizeHandle('@Tathastu.Keepsakes ')).toBe('tathastu.keepsakes')
    expect(normalizeHandle('https://www.instagram.com/some_one/?hl=en')).toBe('some_one')
    expect(normalizeHandle('has space')).toBeNull()
    expect(normalizeHandle('')).toBeNull()
    expect(normalizeHandle('.dot')).toBeNull()
    expect(normalizeHandle('a'.repeat(31))).toBeNull()
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
