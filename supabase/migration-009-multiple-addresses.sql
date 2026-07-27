-- =====================================================
-- Migration 009: multiple saved addresses per user
-- =====================================================
-- Migration 005 capped each user at exactly one billing + one shipping address
-- via UNIQUE(user_id, address_type). We now let a user keep an address book with
-- as many entries as they like (each order's delivery address is saved, deduped).
--
-- What changes
-- ------------
--   1. Drop the UNIQUE(user_id, address_type) constraint so many rows per user
--      (and per type) are allowed.
--   2. Make address_type default to 'shipping' (the checkout address type) so new
--      rows always have a sensible value.
--   3. Ensure the per-user index still exists for fast look-ups.
--
-- is_default already exists from migration-001. We keep at most one default per
-- user in application code (setDefaultAddress), so no DB-level partial index is
-- required for correctness — but one is added below to make it enforceable and
-- self-documenting.
--
-- Idempotent: guarded so it can be re-run safely.
-- =====================================================

-- 1. Drop the single-slot uniqueness so multiple addresses per (user, type) work.
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_user_type_key;

-- 2. Default new rows to the checkout address type.
ALTER TABLE addresses ALTER COLUMN address_type SET DEFAULT 'shipping';

-- 3. Per-user index (created in migration-001; guarded here for fresh DBs).
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- 4. At most one default address per user. A partial unique index only counts
--    rows where is_default = true, so any number of non-default rows coexist.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'addresses_one_default_per_user'
  ) THEN
    CREATE UNIQUE INDEX addresses_one_default_per_user
      ON addresses(user_id)
      WHERE is_default = TRUE;
  END IF;
END $$;

-- =====================================================
-- Verification
-- =====================================================
SELECT
  conname
FROM pg_constraint
WHERE conrelid = 'addresses'::regclass;
-- addresses_user_type_key should be GONE from the list above.

SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'addresses' AND column_name = 'address_type';
