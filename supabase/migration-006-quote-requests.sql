-- ============================================================
-- Migration 006 — Quote Requests
-- ============================================================
-- DO NOT apply to the live DB directly.
-- Run via: supabase db push OR paste in the Supabase SQL editor.
-- ============================================================

-- 1. Create the quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text,
  type        text        NOT NULL DEFAULT 'custom',   -- 'keychain' | 'portrait' | 'custom_object' | 'bulk_order'
  description text,
  file_url    text,                                     -- Storage path or placeholder
  status      text        NOT NULL DEFAULT 'new',       -- 'new' | 'quoted' | 'approved' | 'printing' | 'shipped' | 'closed'
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS quote_requests_email_idx  ON quote_requests (email);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests (status);
CREATE INDEX IF NOT EXISTS quote_requests_type_idx   ON quote_requests (type);

-- 3. Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies
--    Public visitors may INSERT their own quote request (no auth required).
CREATE POLICY "Anyone can submit a quote request"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

--    Only service-role (server-side admin) may SELECT / UPDATE / DELETE.
--    The public never reads the full quote list.
CREATE POLICY "Service role reads all quotes"
  ON quote_requests
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role updates quotes"
  ON quote_requests
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Storage bucket — quote-uploads
-- (Supabase Storage DDL is not standard SQL; apply via the
--  Supabase dashboard Storage tab or the Management API.)
-- ============================================================
--
-- Bucket name: quote-uploads
-- Public:      false  (private; signed URLs generated server-side)
-- File size limit: 26214400  (25 MB)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif,
--                     application/octet-stream  (STL/OBJ are octet-stream)
--
-- Equivalent SQL for reference (NOT standard — uses Supabase internal schema):
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'quote-uploads',
--   'quote-uploads',
--   false,
--   26214400,
--   ARRAY[
--     'image/jpeg', 'image/png', 'image/webp', 'image/gif',
--     'application/octet-stream'
--   ]
-- ) ON CONFLICT (id) DO NOTHING;
--
-- Storage RLS policy — authenticated & anon may INSERT into quote-uploads:
--
-- CREATE POLICY "Anyone can upload a quote file"
--   ON storage.objects
--   FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (bucket_id = 'quote-uploads');
--
-- Only service_role may SELECT/DELETE:
--
-- CREATE POLICY "Service role reads quote files"
--   ON storage.objects
--   FOR SELECT
--   TO service_role
--   USING (bucket_id = 'quote-uploads');
