import type { RoundPhase } from '@/lib/play/phase'

export interface PublicWinner {
  username: string
  composite: number
  accuracy: number
  combo: number
  speed: number
  stability: number
  clutch: number
  tapsMs: number[]
  seed: number
}

export interface Standing {
  username: string
  composite: number
  eligible: boolean
}

export interface PublicRound {
  roundNumber: number
  phase: RoundPhase
  code: string | null
  seed: number | null
  entryClosesAt: number
  startsAt: number
  endsAt: number
  joined: string[]
  standings: Standing[]
  winner: PublicWinner | null
}
