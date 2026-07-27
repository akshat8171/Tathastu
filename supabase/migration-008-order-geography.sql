-- =====================================================
-- Migration 008: Add shipping geography columns to orders
-- =====================================================
-- Adds structured shipping location fields (state, city, pincode)
-- to enable geography-based analytics. Backfills from legacy notes.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_state   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_city    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10);

-- Index for geography analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_state ON orders(shipping_state);

-- Backfill from legacy notes field
-- Pattern: "Address: <addr>, <city>, <state> - <pincode>"
UPDATE orders SET
  shipping_pincode = COALESCE(shipping_pincode, substring(notes from '-\s*(\d{6})')),
  shipping_state   = COALESCE(shipping_state, trim(substring(notes from ',\s*([^,]+?)\s*-\s*\d{6}')))
WHERE notes IS NOT NULL AND shipping_state IS NULL;
