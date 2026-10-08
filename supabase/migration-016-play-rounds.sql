-- ============================================================
-- Migration 016 — Layer Rush stall draws
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- Play passes are created when a phone opens /play. A pass becomes
-- verified only after the Instagram webhook confirms is_user_follow_business.
-- Browser roles get ZERO access — service role only.
-- ============================================================

CREATE TABLE IF NOT EXISTS play_passes (
  id                 text        PRIMARY KEY,
  status             text        NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  ig_scoped_id       text        UNIQUE,
  ig_username        text,
  rejection_reason   text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  verified_at        timestamptz
);

CREATE TABLE IF NOT EXISTS play_rounds (
  round_number       integer     PRIMARY KEY CHECK (round_number BETWEEN 1 AND 5),
  code               text        NOT NULL,
  seed               integer     NOT NULL,
  status             text        NOT NULL CHECK (status IN ('open', 'closed')),
  opened_at          timestamptz NOT NULL,
  entry_closes_at    timestamptz NOT NULL,
  starts_at          timestamptz NOT NULL,
  ends_at            timestamptz NOT NULL,
  winner_pass_id     text,
  winner_username    text,
  winner_composite   integer,
  winner_factors     jsonb,
  winner_taps        jsonb,
  closed_at          timestamptz
);

CREATE TABLE IF NOT EXISTS play_entries (
  round_number       integer     NOT NULL REFERENCES play_rounds (round_number) ON DELETE CASCADE,
  pass_id            text        NOT NULL REFERENCES play_passes (id),
  ig_username        text,
  joined_at          timestamptz NOT NULL DEFAULT now(),
  taps               jsonb,
  factors            jsonb,
  composite          integer,
  submitted_at       timestamptz,
  PRIMARY KEY (round_number, pass_id)
);

ALTER TABLE play_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages play passes" ON play_passes;
CREATE POLICY "Service role manages play passes"
  ON play_passes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages play rounds" ON play_rounds;
CREATE POLICY "Service role manages play rounds"
  ON play_rounds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages play entries" ON play_entries;
CREATE POLICY "Service role manages play entries"
  ON play_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE play_passes FROM anon, authenticated;
REVOKE ALL ON TABLE play_rounds FROM anon, authenticated;
REVOKE ALL ON TABLE play_entries FROM anon, authenticated;
GRANT ALL ON TABLE play_passes TO service_role;
GRANT ALL ON TABLE play_rounds TO service_role;
GRANT ALL ON TABLE play_entries TO service_role;
