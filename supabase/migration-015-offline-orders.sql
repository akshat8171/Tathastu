-- ============================================================
-- Migration 015 — Offline (workshop) orders on the same orders table
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- Website checkout already writes orders. Workshop / Instagram / cash
-- sales lived in Google Sheets ("Organized Products"). This adds the sheet
-- fields onto orders so admin can list online + offline together and create
-- offline rows from /admin/orders/new.
--
-- Existing rows stay channel = 'online'.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'online';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS print_status text;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS item_delivered text;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cost numeric(10, 2);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS amount_collected numeric(10, 2);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS offline_payment_status text;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_channel_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_channel_check
  CHECK (channel IN ('online', 'offline'));

CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);

COMMENT ON COLUMN orders.channel IS 'online = website checkout; offline = workshop / sheet-style order';
COMMENT ON COLUMN orders.print_status IS 'Organized Products: Not Started | In Progress | Completed | Cancelled | On hold';
COMMENT ON COLUMN orders.item_delivered IS 'Organized Products: Not started | Delivered | Packed';
COMMENT ON COLUMN orders.cost IS 'Workshop COGS (sheet Cost column)';
COMMENT ON COLUMN orders.amount_collected IS 'Sheet Payment Recieved (cash collected so far)';
COMMENT ON COLUMN orders.offline_payment_status IS 'Sheet Payment Status spelling, including Payment Recieved';
