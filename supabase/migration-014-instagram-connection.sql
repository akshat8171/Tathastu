-- ============================================================
-- Migration 014 — Instagram Graph API connection (single row)
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- Stores the owner's long-lived Instagram Login token for admin Insights
-- and comment replies. Browser roles get ZERO access — service role only.
-- ============================================================

CREATE TABLE IF NOT EXISTS instagram_connection (
  id                   integer     PRIMARY KEY CHECK (id = 1),
  ig_user_id           text        NOT NULL,
  username             text,
  access_token         text        NOT NULL,
  token_expires_at     timestamptz,
  connected_by_email   text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instagram_connection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages instagram connection" ON instagram_connection;
CREATE POLICY "Service role manages instagram connection"
  ON instagram_connection
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE instagram_connection FROM anon, authenticated;
GRANT ALL ON TABLE instagram_connection TO service_role;
