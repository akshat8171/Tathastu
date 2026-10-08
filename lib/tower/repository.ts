import 'server-only'

import * as memory from '@/lib/tower/repository-memory'
import * as supabase from '@/lib/tower/repository-supabase'

export type {
  EventRow,
  LeaderRow,
  Outcome,
  PlayerRow,
  RoundRow,
  RoundRunRow,
  RunRow,
} from '@/lib/tower/repository-supabase'

/**
 * Picks the data store. Production (and any machine with Supabase configured) always
 * uses Supabase. Only `npm run dev` without Supabase falls back to an in-memory store,
 * so the game can be tried locally without touching a real database.
 */
export const TOWER_MEMORY_STORE =
  process.env.NODE_ENV === 'development' &&
  (process.env.TOWER_LOCAL_STORE === 'memory' || !process.env.NEXT_PUBLIC_SUPABASE_URL)

type Db = Omit<typeof supabase, 'MIGRATION_HINT' | 'TowerReadError'>
const db: Db = TOWER_MEMORY_STORE ? memory : supabase

if (TOWER_MEMORY_STORE) {
  console.warn('[tower] No Supabase configured — using the in-memory dev store. Data resets when the server stops.')
}

export const {
  loadLatestEvent,
  loadEvents,
  loadEventById,
  insertEvent,
  updateEvent,
  loadLatestRound,
  loadRound,
  insertRound,
  updateRound,
  listRounds,
  cancelRoundRuns,
  loadPlayerByToken,
  loadPlayer,
  upsertPlayer,
  updatePlayer,
  listPlayers,
  countPlayers,
  loadRun,
  listPlayerRuns,
  insertRun,
  finishRun,
  saveProgress,
  listRuns,
  listAllRuns,
  countRuns,
  listRoundRuns,
  listEventResults,
  loadLeaders,
  loadAllLeaders,
  countLeadersAbove,
} = db
