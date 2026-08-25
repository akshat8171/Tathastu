-- ============================================================
-- Migration 012 — Catalog CMS (admin SKUs + homepage settings)
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- Storefront still ships with lib/products.json. Admin-created SKUs live here
-- and overlay/extend that file at request time. Homepage section visibility
-- and featured product ids live in homepage_settings (single row).
-- ============================================================

CREATE TABLE IF NOT EXISTS catalog_products (
  id          text        PRIMARY KEY,
  payload     jsonb       NOT NULL,
  published   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS catalog_products_published_idx ON catalog_products (published);
CREATE INDEX IF NOT EXISTS catalog_products_category_idx
  ON catalog_products ((payload->>'category'));

ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published catalog products" ON catalog_products;
CREATE POLICY "Public can read published catalog products"
  ON catalog_products
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Service role manages catalog products" ON catalog_products;
CREATE POLICY "Service role manages catalog products"
  ON catalog_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS homepage_settings (
  id          integer     PRIMARY KEY CHECK (id = 1),
  settings    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO homepage_settings (id, settings)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read homepage settings" ON homepage_settings;
CREATE POLICY "Public can read homepage settings"
  ON homepage_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role manages homepage settings" ON homepage_settings;
CREATE POLICY "Service role manages homepage settings"
  ON homepage_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public bucket so product photos can render via next/image on the storefront.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-images',
  'catalog-images',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public reads catalog images" ON storage.objects;
CREATE POLICY "Public reads catalog images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "Service role inserts catalog images" ON storage.objects;
CREATE POLICY "Service role inserts catalog images"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "Service role deletes catalog images" ON storage.objects;
CREATE POLICY "Service role deletes catalog images"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'catalog-images');
