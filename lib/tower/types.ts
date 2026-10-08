/** Shapes shared by the API routes and the browser. No server imports here. */

export type EventStatus = 'open' | 'closed'
export type RoundStatus = 'lobby' | 'playing' | 'ended'
/**
 * What the big screen shows. `countdown` and `results` are derived: countdown is the gap
 * between the host pressing Start and the first drop, results is an ended round (or a
 * playing round where everyone has finished).
 */
export type RoundPhase = 'lobby' | 'countdown' | 'playing' | 'results'

export interface PublicWinner {
  name: string
  score: number
  layers: number
  perfects: number
}

/** The one winner of a round. */
export interface PublicRoundWinner {
  round: number
  name: string
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

export interface PublicRound {
  id: number
  number: number
  status: RoundStatus
  phase: RoundPhase
  /** Server time (ms) of the first drop. Null while the round is in its lobby. */
  goAt: number | null
  /** Only filled in when the host chose to show the code on the big screen. */
  code: string | null
  joined: number
  finished: number
  /** Set once the round shows its results. */
  winner: PublicRoundWinner | null
}

export interface BoardRow {
  rank: number
  name: string
  score: number
  layers: number
  perfects: number
}

/** One player in the current round, for the lobby and the live race on the big screen. */
export interface RoundRow {
  name: string
  /** Final score once finished, otherwise the live score the phone last reported. */
  score: number
  layers: number
  done: boolean
  /** Finished after the round ended: still on the day's leaderboard, but not on this podium. */
  late: boolean
}

export interface PublicBoard {
  serverNow: number
  event: PublicEvent | null
  round: PublicRound | null
  /** Current round, best first (lobby: in join order). */
  roundRows: RoundRow[]
  /** Best score per player across the whole event. */
  top: BoardRow[]
  /** One winner per finished round, latest round first. */
  roundWinners: PublicRoundWinner[]
  players: number
  games: number
}

export interface PlayerRoundState {
  roundId: number
  number: number
  runId: string
  seed: number
  status: 'playing' | 'finished' | 'rejected'
  score: number | null
  rank: number | null
  /** This player won the round (only once the round shows its results). */
  won: boolean
  /** Finished after the round ended, so it counts for the day but not this round. */
  late: boolean
}

export interface PlayerView {
  name: string
  /** Masked, e.g. +91 98•••••210, so the phone can confirm who is signed in. */
  phoneHint: string
  attemptsAllowed: number
  attemptsLeft: number
  best: { score: number; layers: number; perfects: number } | null
  rank: number | null
  disqualified: boolean
  event: PublicEvent
  round: PublicRound | null
  /** This player's game in the current round, once they have entered its code. */
  current: PlayerRoundState | null
}

export interface RunResult {
  score: number
  layers: number
  perfects: number
  bestCombo: number
}

export interface AdminPlayerRow {
  id: string
  name: string
  phone: string
  marketingOptIn: boolean
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
  playerId: string
  name: string
  round: number | null
  status: 'playing' | 'finished' | 'rejected'
  score: number | null
  layers: number | null
  perfects: number | null
  startedAt: number
  finishedAt: number | null
  rejectReason: string | null
  suspicious: boolean
}

export interface AdminRound extends PublicRound {
  /** The real code, always visible to the host. */
  secretCode: string
  showCode: boolean
}

export interface AdminRoundWinner extends PublicRoundWinner {
  playerId: string
  phone: string
  marketingOptIn: boolean
  suspicious: boolean
  /** Rounds this player has won so far today (they may win more than one). */
  wins: number
}

export interface AdminSnapshot {
  serverNow: number
  event: PublicEvent | null
  round: AdminRound | null
  /** One winner per finished round, latest round first. */
  roundWinners: AdminRoundWinner[]
  pastEvents: PublicEvent[]
  players: AdminPlayerRow[]
  runs: AdminRunRow[]
}

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string; status?: number }
