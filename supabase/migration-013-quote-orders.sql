-- ============================================================
-- Migration 013 — Link custom quote requests to orders
-- ============================================================
-- Apply via the Supabase SQL editor. Idempotent. Safe to re-run.
--
-- Custom /customize requests were stored only in quote_requests, so they
-- never appeared in admin Orders or the customer's My Orders list.
-- This adds order_id so each quote can point at the orders row created
-- at submit time (and when backfilling existing quotes).
-- ============================================================

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id);

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS quoted_price numeric;

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_order_id_uidx
  ON quote_requests (order_id)
  WHERE order_id IS NOT NULL;
