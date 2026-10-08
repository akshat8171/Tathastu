import {
  DROP_COUNT,
  DROP_WINDOW_MS,
  GAME_MS,
  MAX_TAPS,
  MISS_WINDOW_MS,
  PERFECT_WINDOW_MS,
} from '@/lib/play/constants'

export interface DropScore {
  dropIndex: number
  accuracy: number
  timingErrorMs: number
  isPerfect: boolean
  wasTapped: boolean
}

export interface RunFactors {
  accuracy: number
  combo: number
  comboBonus: number
  speed: number
  stability: number
  clutch: number
  clutchBonus: number
  composite: number
  drops: DropScore[]
}

export function nozzleX(seed: number, elapsedMs: number): number {
  const phase = unitHash(seed, 99) * Math.PI * 2
  return Math.sin((elapsedMs / 700) * Math.PI + phase)
}

export function idealTapMs(dropIndex: number): number {
  return dropIndex * DROP_WINDOW_MS + Math.round(DROP_WINDOW_MS / 2)
}

/** Gate sits where the nozzle will be on the beat, so a centered tap lands on it. */
export function gateX(seed: number, dropIndex: number): number {
  return nozzleX(seed, idealTapMs(dropIndex))
}

export function activeDropIndex(elapsedMs: number): number {
  if (elapsedMs < 0) return 0
  const index = Math.floor(elapsedMs / DROP_WINDOW_MS)
  return Math.min(DROP_COUNT - 1, Math.max(0, index))
}

export function validateTaps(tapsMs: number[]): string | null {
  if (tapsMs.length > MAX_TAPS) return 'Too many taps for one round.'
  let previous = -1
  for (const tap of tapsMs) {
    if (!Number.isInteger(tap) || tap < 0 || tap > GAME_MS) return 'A tap fell outside the round.'
    if (tap <= previous) return 'Taps have to move forward.'
    previous = tap
  }
  return null
}

export function scoreTaps(input: { seed: number; tapsMs: number[] }): RunFactors {
  const drops = scoreDrops(input.seed, input.tapsMs)
  const accuracy = drops.reduce((sum, drop) => sum + drop.accuracy, 0)
  const combo = longestPerfectRun(drops)
  const comboBonus = combo * 25
  const speed = speedPoints(drops)
  const stability = stabilityPoints(drops)
  const clutch = drops[drops.length - 1]?.accuracy ?? 0
  const clutchBonus = drops[drops.length - 1]?.isPerfect ? 80 : 0
  const composite = accuracy + comboBonus + speed + stability + clutchBonus
  return { accuracy, combo, comboBonus, speed, stability, clutch, clutchBonus, composite, drops }
}

function scoreDrops(seed: number, tapsMs: number[]): DropScore[] {
  return Array.from({ length: DROP_COUNT }, (_, dropIndex) => {
    const windowStart = dropIndex * DROP_WINDOW_MS
    const windowEnd = windowStart + DROP_WINDOW_MS
    const tap = tapsMs.find((value) => value >= windowStart && value < windowEnd)
    if (tap === undefined) return missedDrop(dropIndex)
    const timingErrorMs = Math.abs(tap - idealTapMs(dropIndex))
    const accuracy = Math.max(0, Math.round(100 - (timingErrorMs / MISS_WINDOW_MS) * 100))
    return {
      dropIndex,
      accuracy,
      timingErrorMs,
      isPerfect: timingErrorMs <= PERFECT_WINDOW_MS,
      wasTapped: true,
    }
  })
}

function missedDrop(dropIndex: number): DropScore {
  return { dropIndex, accuracy: 0, timingErrorMs: MISS_WINDOW_MS, isPerfect: false, wasTapped: false }
}

function longestPerfectRun(drops: DropScore[]): number {
  let best = 0
  let run = 0
  for (const drop of drops) {
    run = drop.isPerfect ? run + 1 : 0
    if (run > best) best = run
  }
  return best
}

function speedPoints(drops: DropScore[]): number {
  if (drops.some((drop) => !drop.wasTapped)) return 0
  const meanError = drops.reduce((sum, drop) => sum + drop.timingErrorMs, 0) / drops.length
  return Math.max(0, 160 - Math.round(meanError * 0.5))
}

function stabilityPoints(drops: DropScore[]): number {
  if (drops.every((drop) => drop.accuracy === 0)) return 0
  const values = drops.map((drop) => drop.accuracy)
  return Math.max(0, Math.round(80 - standardDeviation(values)))
}

function standardDeviation(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function unitHash(seed: number, index: number): number {
  const raw = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
  return raw - Math.floor(raw)
}
