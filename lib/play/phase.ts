import { FINALIZE_DELAY_MS } from '@/lib/play/constants'

export type RoundPhase = 'entry' | 'countdown' | 'live' | 'submitting' | 'due' | 'closed'

export function derivePhase(input: {
  status: 'open' | 'closed'
  nowMs: number
  entryClosesAtMs: number
  startsAtMs: number
  endsAtMs: number
}): RoundPhase {
  if (input.status === 'closed') return 'closed'
  if (input.nowMs < input.entryClosesAtMs) return 'entry'
  if (input.nowMs < input.startsAtMs) return 'countdown'
  if (input.nowMs < input.endsAtMs) return 'live'
  if (input.nowMs < input.endsAtMs + FINALIZE_DELAY_MS) return 'submitting'
  return 'due'
}
