-- ============================================================
-- Migration 017 — Tathastu Tower (exhibition stall game, Kahoot-style rounds)
-- ============================================================
-- Apply via the Supabase SQL editor: paste the whole file, click Run.
-- Idempotent — safe to re-run, and safe on a project that ran an earlier draft.
--
-- tower_events   one row per exhibition day / session. The newest row is live.
-- tower_rounds   one row per round. The host reads its 4-digit code out loud;
--                everyone who types it in plays the same tower together.
-- tower_players  one row per WhatsApp number per event.
-- tower_runs     every game played, with the raw tap timings so any score
--                can be replayed and audited later.
--
-- Browser roles get ZERO access — the Next.js server uses the service role.
-- Phone numbers never leave the server except in the admin console and CSV.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------ events
CREATE TABLE IF NOT EXISTS tower_events (
  id                   bigserial   PRIMARY KEY,
  name                 text        NOT NULL,
  status               text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  -- How many rounds one person may play this event. Their best score counts.
  attempts_per_player  integer     NOT NULL DEFAULT 3 CHECK (attempts_per_player BETWEEN 1 AND 20),
  show_code            boolean     NOT NULL DEFAULT false,
  winner_player_id     uuid,
  winner_name          text,
  winner_score         integer,
  announced_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  closed_at            timestamptz
);
ALTER TABLE tower_events ADD COLUMN IF NOT EXISTS show_code boolean NOT NULL DEFAULT false;
ALTER TABLE tower_events ADD COLUMN IF NOT EXISTS winner_name text;

-- ------------------------------------------------------------ rounds
CREATE TABLE IF NOT EXISTS tower_rounds (
  id                   bigserial   PRIMARY KEY,
  event_id             bigint      NOT NULL REFERENCES tower_events (id) ON DELETE CASCADE,
  number               integer     NOT NULL,
  code                 text        NOT NULL CHECK (code ~ '^[0-9]{4}$'),
  status               text        NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'ended')),
  -- Same seed for everyone in the round: every player stacks the same tower.
  seed                 bigint      NOT NULL,
  go_at                timestamptz,
  ended_at             timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, number)
);
CREATE INDEX IF NOT EXISTS tower_rounds_event_idx ON tower_rounds (event_id, number DESC);

-- ------------------------------------------------------------ players
CREATE TABLE IF NOT EXISTS tower_players (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             bigint      NOT NULL REFERENCES tower_events (id) ON DELETE CASCADE,
  phone                text,
  display_name         text,
  marketing_opt_in     boolean     NOT NULL DEFAULT false,
  -- NULL = signed out ("Next player" / host "Reset phone"), so the number can sign in again.
  token_hash           text,
  bonus_attempts       integer     NOT NULL DEFAULT 0,
  disqualified         boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);
-- Upgrade path from the Instagram-handle draft of this file.
ALTER TABLE tower_players ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE tower_players ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE tower_players ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE tower_players ALTER COLUMN token_hash DROP NOT NULL;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'tower_players' AND column_name = 'ig_handle') THEN
    EXECUTE 'ALTER TABLE tower_players ALTER COLUMN ig_handle DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'tower_players' AND column_name = 'follow_check') THEN
    EXECUTE 'ALTER TABLE tower_players ALTER COLUMN follow_check DROP NOT NULL';
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS tower_players_event_phone_idx
  ON tower_players (event_id, phone)
  WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS tower_players_event_idx ON tower_players (event_id);
CREATE INDEX IF NOT EXISTS tower_players_token_idx ON tower_players (token_hash);

-- ------------------------------------------------------------ runs
CREATE TABLE IF NOT EXISTS tower_runs (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             bigint      NOT NULL REFERENCES tower_events (id) ON DELETE CASCADE,
  player_id            uuid        NOT NULL REFERENCES tower_players (id) ON DELETE CASCADE,
  round_id             bigint      REFERENCES tower_rounds (id) ON DELETE SET NULL,
  attempt              integer     NOT NULL,
  seed                 bigint      NOT NULL,
  status               text        NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'finished', 'rejected')),
  started_at           timestamptz NOT NULL DEFAULT now(),
  finished_at          timestamptz,
  intervals_ms         jsonb,
  score                integer,
  layers               integer,
  perfects             integer,
  best_combo           integer,
  reject_reason        text,
  -- Live score the phone reports mid-game, for the big screen only. The real score is replayed.
  progress_score       integer,
  progress_layers      integer,
  progress_at          timestamptz,
  start_key            text,
  UNIQUE (player_id, attempt)
);
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS round_id bigint REFERENCES tower_rounds (id) ON DELETE SET NULL;
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS progress_score integer;
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS progress_layers integer;
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS progress_at timestamptz;
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS start_key text;
-- One game per player per round.
CREATE UNIQUE INDEX IF NOT EXISTS tower_runs_round_player_idx
  ON tower_runs (round_id, player_id)
  WHERE round_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS tower_runs_event_score_idx
  ON tower_runs (event_id, score DESC)
  WHERE status = 'finished';
CREATE INDEX IF NOT EXISTS tower_runs_player_idx ON tower_runs (player_id);
CREATE INDEX IF NOT EXISTS tower_runs_round_idx ON tower_runs (round_id);

-- ------------------------------------------------------------ access
ALTER TABLE tower_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages tower events" ON tower_events;
CREATE POLICY "Service role manages tower events"
  ON tower_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages tower rounds" ON tower_rounds;
CREATE POLICY "Service role manages tower rounds"
  ON tower_rounds FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages tower players" ON tower_players;
CREATE POLICY "Service role manages tower players"
  ON tower_players FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages tower runs" ON tower_runs;
CREATE POLICY "Service role manages tower runs"
  ON tower_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE tower_events FROM anon, authenticated;
REVOKE ALL ON TABLE tower_rounds FROM anon, authenticated;
REVOKE ALL ON TABLE tower_players FROM anon, authenticated;
REVOKE ALL ON TABLE tower_runs FROM anon, authenticated;
GRANT ALL ON TABLE tower_events TO service_role;
GRANT ALL ON TABLE tower_rounds TO service_role;
GRANT ALL ON TABLE tower_players TO service_role;
GRANT ALL ON TABLE tower_runs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE tower_events_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE tower_rounds_id_seq TO service_role;

-- ------------------------------------------------------------ leaderboard
-- Each player's single best finished run this event. Same ordering as lib/tower/rules.ts.
-- Dropped first because earlier drafts had different columns (CREATE OR REPLACE cannot rename).
DROP VIEW IF EXISTS tower_leaderboard;
CREATE VIEW tower_leaderboard AS
SELECT DISTINCT ON (r.player_id)
  r.event_id,
  r.player_id,
  p.display_name,
  p.phone,
  p.disqualified,
  r.id AS run_id,
  r.score,
  r.layers,
  r.perfects,
  r.best_combo,
  r.finished_at
FROM tower_runs r
JOIN tower_players p ON p.id = r.player_id
WHERE r.status = 'finished'
ORDER BY r.player_id, r.score DESC, r.perfects DESC, r.finished_at ASC;

-- security_invoker needs Postgres 15+. Browser roles are revoked below either way.
DO $$
BEGIN
  IF current_setting('server_version_num')::int >= 150000 THEN
    EXECUTE 'ALTER VIEW tower_leaderboard SET (security_invoker = true)';
  END IF;
END $$;

REVOKE ALL ON TABLE tower_leaderboard FROM anon, authenticated;
GRANT SELECT ON TABLE tower_leaderboard TO service_role;

-- Tell the Supabase API about the new tables straight away.
NOTIFY pgrst, 'reload schema';
