import {
  BASE_SIZE,
  BASE_SPEED,
  GROW_AFTER_COMBO,
  GROW_AMOUNT,
  IDLE_LIMIT_MS,
  MAX_COMBO_MULTIPLIER,
  MAX_LAYERS,
  MAX_SPEED,
  MIN_SIZE,
  PERFECT_BONUS,
  PERFECT_TOLERANCE,
  POINTS_PER_LAYER,
  SPEED_STEP,
  TRAVEL,
} from '@/lib/tower/constants'

/**
 * Pure, deterministic stacking engine.
 *
 * The only input is how many whole milliseconds each slab was allowed to slide
 * before the player tapped. Given the same seed and the same list, this file
 * produces the same tower on a phone and on the server, bit for bit. It only
 * uses +, -, *, / and % on doubles (no Math.sin and friends), and those are
 * IEEE-exact on every JavaScript engine.
 */

export type Axis = 'x' | 'z'

/** One slab. x/z is the centre of its footprint; w spans x, d spans z. */
export interface Slab {
  x: number
  z: number
  w: number
  d: number
}

export interface TowerState {
  seed: number
  /** slabs[0] is the base. The moving slab is always at index slabs.length. */
  slabs: Slab[]
  combo: number
  bestCombo: number
  perfects: number
  score: number
  over: boolean
}

export type DropKind = 'perfect' | 'cut' | 'miss'

export interface DropOutcome {
  kind: DropKind
  /** The slab that stays on the tower (null on a miss). */
  placed: Slab | null
  /** The piece that falls off (the whole slab on a miss, null on a perfect). */
  chopped: Slab | null
  points: number
  combo: number
}

export interface RunSummary {
  score: number
  layers: number
  perfects: number
  bestCombo: number
  over: boolean
  /** How many of the supplied intervals were actually used. */
  used: number
}

export function createTower(seed: number): TowerState {
  return {
    seed: seed >>> 0,
    slabs: [{ x: 0, z: 0, w: BASE_SIZE, d: BASE_SIZE }],
    combo: 0,
    bestCombo: 0,
    perfects: 0,
    score: 0,
    over: false,
  }
}

/** Index of the slab that is currently sliding. Layer 1 is the first one the player drops. */
export function currentLevel(state: TowerState): number {
  return state.slabs.length
}

export function layersPlaced(state: TowerState): number {
  return state.slabs.length - 1
}

export function axisFor(level: number): Axis {
  return level % 2 === 1 ? 'x' : 'z'
}

export function speedFor(level: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + (level - 1) * SPEED_STEP)
}

/** +1 means the slab enters from the negative side, -1 from the positive side. */
export function entrySide(seed: number, level: number): 1 | -1 {
  let h = Math.imul((seed >>> 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(level + 1, 0xc2b2ae35)
  h ^= h >>> 13
  h = Math.imul(h, 0x27d4eb2f)
  h ^= h >>> 16
  return (h & 1) === 0 ? 1 : -1
}

/** Offset of the sliding slab from the slab below it, along the sliding axis. */
export function slideOffset(seed: number, level: number, elapsedMs: number): number {
  const distance = speedFor(level) * Math.max(0, elapsedMs)
  const period = 4 * TRAVEL
  const phase = distance % period
  const along = phase <= 2 * TRAVEL ? -TRAVEL + phase : TRAVEL - (phase - 2 * TRAVEL)
  return entrySide(seed, level) * along
}

/** Where the sliding slab is right now. */
export function movingSlab(state: TowerState, elapsedMs: number): Slab {
  const top = state.slabs[state.slabs.length - 1]
  const level = currentLevel(state)
  const offset = slideOffset(state.seed, level, elapsedMs)
  return axisFor(level) === 'x' ? { ...top, x: top.x + offset } : { ...top, z: top.z + offset }
}

/**
 * Drop the sliding slab after it has moved for `elapsedMs`. Mutates `state`.
 * Callers must pass a whole number of milliseconds so phone and server agree.
 */
export function dropSlab(state: TowerState, elapsedMs: number): DropOutcome {
  if (state.over) return { kind: 'miss', placed: null, chopped: null, points: 0, combo: 0 }

  const level = currentLevel(state)
  const axis = axisFor(level)
  const top = state.slabs[state.slabs.length - 1]
  const moving = movingSlab(state, elapsedMs)

  if (elapsedMs > IDLE_LIMIT_MS) return endRun(state, moving)

  const delta = axis === 'x' ? moving.x - top.x : moving.z - top.z
  const size = axis === 'x' ? top.w : top.d
  const distance = Math.abs(delta)

  if (distance <= PERFECT_TOLERANCE) {
    state.combo += 1
    state.perfects += 1
    if (state.combo > state.bestCombo) state.bestCombo = state.combo
    const grown = state.combo >= GROW_AFTER_COMBO ? Math.min(BASE_SIZE, size + GROW_AMOUNT) : size
    const placed: Slab = axis === 'x' ? { ...top, w: grown } : { ...top, d: grown }
    const points = POINTS_PER_LAYER + PERFECT_BONUS * Math.min(state.combo, MAX_COMBO_MULTIPLIER)
    return placeSlab(state, { kind: 'perfect', placed, chopped: null, points, combo: state.combo })
  }

  const overlap = size - distance
  if (overlap < MIN_SIZE) return endRun(state, moving)

  state.combo = 0
  const sign = delta > 0 ? 1 : -1
  const keptCentre = (axis === 'x' ? top.x : top.z) + delta / 2
  const choppedCentre = keptCentre + sign * (size / 2)
  const placed: Slab = axis === 'x' ? { ...top, x: keptCentre, w: overlap } : { ...top, z: keptCentre, d: overlap }
  const chopped: Slab =
    axis === 'x' ? { ...top, x: choppedCentre, w: distance } : { ...top, z: choppedCentre, d: distance }
  return placeSlab(state, { kind: 'cut', placed, chopped, points: POINTS_PER_LAYER, combo: 0 })
}

/** Rebuild a run on the server from its tap intervals. */
export function replayRun(seed: number, intervalsMs: readonly number[]): RunSummary {
  const state = createTower(seed)
  let used = 0
  for (const interval of intervalsMs) {
    if (state.over) break
    dropSlab(state, interval)
    used += 1
  }
  return {
    score: state.score,
    layers: layersPlaced(state),
    perfects: state.perfects,
    bestCombo: state.bestCombo,
    over: state.over,
    used,
  }
}

function placeSlab(state: TowerState, outcome: DropOutcome): DropOutcome {
  if (outcome.placed) state.slabs.push(outcome.placed)
  state.score += outcome.points
  if (layersPlaced(state) >= MAX_LAYERS) state.over = true
  return outcome
}

function endRun(state: TowerState, moving: Slab): DropOutcome {
  state.over = true
  state.combo = 0
  return { kind: 'miss', placed: null, chopped: moving, points: 0, combo: 0 }
}
