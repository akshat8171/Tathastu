-- ============================================================
-- Migration 011 — Quote storage bucket + table (idempotent)
-- ============================================================
-- Apply via the Supabase SQL editor on production.
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS quote_requests (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text,
  type        text        NOT NULL DEFAULT 'custom',
  description text,
  file_url    text,
  status      text        NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_requests_email_idx  ON quote_requests (email);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests (status);
CREATE INDEX IF NOT EXISTS quote_requests_type_idx   ON quote_requests (type);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a quote request" ON quote_requests;
CREATE POLICY "Anyone can submit a quote request"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads all quotes" ON quote_requests;
CREATE POLICY "Service role reads all quotes"
  ON quote_requests
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role updates quotes" ON quote_requests;
CREATE POLICY "Service role updates quotes"
  ON quote_requests
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Private bucket. Uploads go through the server (service role), never the browser.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-uploads',
  'quote-uploads',
  false,
  26214400,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/octet-stream',
    'application/pdf',
    'application/sla',
    'model/stl',
    'model/obj'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage access is server-side only (supabaseAdmin / service_role).
DROP POLICY IF EXISTS "Anyone can upload a quote file" ON storage.objects;
DROP POLICY IF EXISTS "Service role inserts quote files" ON storage.objects;
CREATE POLICY "Service role inserts quote files"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'quote-uploads');

DROP POLICY IF EXISTS "Service role reads quote files" ON storage.objects;
CREATE POLICY "Service role reads quote files"
  ON storage.objects
  FOR SELECT
  TO service_role
  USING (bucket_id = 'quote-uploads');
