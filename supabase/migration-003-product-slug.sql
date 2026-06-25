-- =====================================================
-- Migration 003 — Product slug (catalog ID ↔ DB UUID bridge)
-- =====================================================
--
-- WHY THIS EXISTS
-- ---------------
-- The storefront catalog (lib/products.json) identifies every product by a
-- human-readable string slug, e.g. "lamps-lamp1". The database, however, uses
-- UUID primary keys (products.id is UUID, and order_items.product_id is a UUID
-- foreign key → products(id)).
--
-- Before this migration there was no way to map a catalog slug to its DB UUID,
-- so checkout tried to INSERT the raw slug "lamps-lamp1" into the UUID column
-- order_items.product_id and Postgres rejected it:
--
--     ERROR: 22P02 invalid input syntax for type uuid: "lamps-lamp1"
--
-- ...which rolled back the whole order ("Failed to create order").
--
-- THE FIX (Option B — keep UUIDs)
-- -------------------------------
-- 1. Add a `slug` column to products and seed every catalog product with a
--    DETERMINISTIC UUID derived from its slug (uuid_generate_v5). Deterministic
--    means re-seeding never changes a product's id, so historical
--    order_items.product_id references stay valid.
-- 2. lib/supabase/orders.ts resolves slug → UUID at order-write time by looking
--    the slug up in this table, then stores the real UUID in
--    order_items.product_id. Unknown/unseeded slugs resolve to NULL (the column
--    is nullable and the product snapshot columns still capture name/price/img).
--
-- This keeps the cart localStorage shape, product URLs, pricing, and the test
-- suite entirely slug-based — only the single DB write boundary translates.
--
-- Idempotent: safe to run multiple times.
-- =====================================================

-- uuid_generate_v5 lives in the uuid-ossp extension (already enabled by schema.sql)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add the slug column (nullable first so it can be added to a populated table),
-- then enforce uniqueness so it can be an ON CONFLICT target for re-runnable seeds.
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(120);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
