-- ============================================================
-- Migration 017 — Tathastu Tower (exhibition stacking game)
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- tower_events   one row per exhibition day / session. The newest row is live.
-- tower_players  one row per Instagram handle per event.
-- tower_runs     every game played, with the raw tap timings so any score
--                can be replayed and audited later.
--
-- Browser roles get ZERO access — the Next.js server uses the service role.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tower_events (
  id                   bigserial   PRIMARY KEY,
  name                 text        NOT NULL,
  status               text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  attempts_per_player  integer     NOT NULL DEFAULT 3 CHECK (attempts_per_player BETWEEN 1 AND 20),
  winner_player_id     uuid,
  winner_handle        text,
  winner_score         integer,
  announced_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  closed_at            timestamptz
);

CREATE TABLE IF NOT EXISTS tower_players (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             bigint      NOT NULL REFERENCES tower_events (id) ON DELETE CASCADE,
  ig_handle            text        NOT NULL,
  display_name         text,
  follow_check         text        NOT NULL CHECK (follow_check IN ('honor', 'instagram')),
  play_pass_id         text,
  token_hash           text        NOT NULL,
  bonus_attempts       integer     NOT NULL DEFAULT 0,
  disqualified         boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, ig_handle)
);

CREATE TABLE IF NOT EXISTS tower_runs (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             bigint      NOT NULL REFERENCES tower_events (id) ON DELETE CASCADE,
  player_id            uuid        NOT NULL REFERENCES tower_players (id) ON DELETE CASCADE,
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
  -- Client-generated id for one tap of "Play": a slow or retried start returns the same run
  -- instead of burning a second try.
  start_key            text,
  UNIQUE (player_id, attempt)
);
ALTER TABLE tower_runs ADD COLUMN IF NOT EXISTS start_key text;
CREATE UNIQUE INDEX IF NOT EXISTS tower_runs_start_key_idx
  ON tower_runs (player_id, start_key)
  WHERE start_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS tower_runs_event_score_idx
  ON tower_runs (event_id, score DESC)
  WHERE status = 'finished';
CREATE INDEX IF NOT EXISTS tower_runs_player_idx ON tower_runs (player_id);
CREATE INDEX IF NOT EXISTS tower_players_event_idx ON tower_players (event_id);
CREATE INDEX IF NOT EXISTS tower_players_token_idx ON tower_players (token_hash);

ALTER TABLE tower_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages tower events" ON tower_events;
CREATE POLICY "Service role manages tower events"
  ON tower_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages tower players" ON tower_players;
CREATE POLICY "Service role manages tower players"
  ON tower_players FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages tower runs" ON tower_runs;
CREATE POLICY "Service role manages tower runs"
  ON tower_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE tower_events FROM anon, authenticated;
REVOKE ALL ON TABLE tower_players FROM anon, authenticated;
REVOKE ALL ON TABLE tower_runs FROM anon, authenticated;
GRANT ALL ON TABLE tower_events TO service_role;
GRANT ALL ON TABLE tower_players TO service_role;
GRANT ALL ON TABLE tower_runs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE tower_events_id_seq TO service_role;

-- Each player's single best finished run. Same ordering as lib/tower/rules.ts.
CREATE OR REPLACE VIEW tower_leaderboard
WITH (security_invoker = true) AS
SELECT DISTINCT ON (r.player_id)
  r.event_id,
  r.player_id,
  p.ig_handle,
  p.display_name,
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

REVOKE ALL ON TABLE tower_leaderboard FROM anon, authenticated;
GRANT SELECT ON TABLE tower_leaderboard TO service_role;
