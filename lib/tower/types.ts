/** Shapes shared by the API routes and the browser. No server imports here. */

export type FollowCheckMode = 'honor' | 'instagram'
export type EventStatus = 'open' | 'closed'

export interface PublicWinner {
  handle: string
  displayName: string | null
  score: number
  layers: number
  perfects: number
}

export interface PublicEvent {
  id: number
  name: string
  status: EventStatus
  attemptsPerPlayer: number
  winner: PublicWinner | null
  announcedAt: number | null
}

export interface BoardRow {
  rank: number
  handle: string
  displayName: string | null
  score: number
  layers: number
  perfects: number
}

export interface RecentRun {
  handle: string
  score: number
  layers: number
  finishedAt: number
}

export interface PublicBoard {
  serverNow: number
  event: PublicEvent | null
  top: BoardRow[]
  players: number
  games: number
  playingNow: number
  recent: RecentRun[]
}

export interface PlayerView {
  handle: string
  displayName: string | null
  attemptsAllowed: number
  attemptsLeft: number
  best: { score: number; layers: number; perfects: number } | null
  rank: number | null
  disqualified: boolean
  event: PublicEvent
}

export interface RunTicket {
  runId: string
  seed: number
  attempt: number
}

export interface RunResult {
  score: number
  layers: number
  perfects: number
  bestCombo: number
}

export interface AdminPlayerRow {
  id: string
  handle: string
  displayName: string | null
  followCheck: FollowCheckMode
  disqualified: boolean
  bonusAttempts: number
  attemptsUsed: number
  attemptsLeft: number
  bestScore: number | null
  bestLayers: number | null
  /** Best run looks scripted (nearly every drop perfect) — check before announcing. */
  bestSuspicious: boolean
  rank: number | null
  createdAt: number
}

export interface AdminRunRow {
  id: string
  handle: string
  attempt: number
  status: 'playing' | 'finished' | 'rejected'
  score: number | null
  layers: number | null
  perfects: number | null
  startedAt: number
  finishedAt: number | null
  rejectReason: string | null
  suspicious: boolean
}

export interface AdminSnapshot {
  serverNow: number
  followCheck: FollowCheckMode
  event: PublicEvent | null
  pastEvents: PublicEvent[]
  players: AdminPlayerRow[]
  runs: AdminRunRow[]
}

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string; status?: number }
