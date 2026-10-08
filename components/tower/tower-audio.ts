/** Tiny Web Audio blips. No files to download, nothing to lag on. */

let context: AudioContext | null = null
let muted = false

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]

export function unlockTowerAudio(): void {
  const audio = getContext()
  if (audio && audio.state === 'suspended') void audio.resume().catch(() => undefined)
}

export function setTowerMuted(value: boolean): void {
  muted = value
}

export function isTowerMuted(): boolean {
  return muted
}

/** Perfect drops climb a pentatonic scale with the combo, like the original. */
export function playPerfect(combo: number): void {
  const step = SCALE[Math.min(combo - 1, SCALE.length - 1)] ?? 0
  tone(523.25 * Math.pow(2, step / 12), 'sine', 0.18, 0.09)
}

export function playCut(): void {
  tone(196, 'triangle', 0.09, 0.07)
}

export function playMiss(): void {
  tone(130, 'sawtooth', 0.35, 0.05)
  tone(98, 'sawtooth', 0.45, 0.04, 0.12)
}

export function playTick(): void {
  tone(660, 'sine', 0.08, 0.06)
}

export function playFanfare(): void {
  ;[523, 659, 784, 1046, 1318].forEach((frequency, index) => tone(frequency, 'sine', 0.22, 0.08, index * 0.13))
}

export function buzz(ms: number): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms)
  } catch {
    // Some browsers throw when vibration is blocked. It is only a nicety.
  }
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (context) return context
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    context = new Ctor()
  } catch {
    return null
  }
  return context
}

function tone(frequency: number, type: OscillatorType, duration: number, volume: number, delay = 0): void {
  if (muted) return
  const audio = getContext()
  if (!audio || audio.state !== 'running') return
  try {
    const start = audio.currentTime + delay
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  } catch {
    // Audio must never break the game.
  }
}
