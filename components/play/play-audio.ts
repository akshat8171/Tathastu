let audioContext: AudioContext | null = null

export function unlockPlayAudio(): void {
  const context = getContext()
  if (context.state === 'suspended') void context.resume()
}

export function playDropTone(isPerfect: boolean): void {
  const context = getContext()
  tone(context, isPerfect ? 880 : 180, isPerfect ? 'sine' : 'triangle', isPerfect ? 0.12 : 0.08)
}

export function playCountdownTone(): void {
  tone(getContext(), 520, 'sine', 0.1)
}

export function playWinnerTone(): void {
  const context = getContext()
  ;[523, 659, 784, 1046].forEach((frequency, index) => {
    window.setTimeout(() => tone(context, frequency, 'sine', 0.14), index * 140)
  })
}

function getContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext()
  return audioContext
}

function tone(context: AudioContext, frequency: number, type: OscillatorType, duration: number): void {
  if (context.state === 'suspended') return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.07, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
}
