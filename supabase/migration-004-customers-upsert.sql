-- =====================================================
-- Migration 004: Customers phone-keyed upsert
-- =====================================================
-- Converts the customers table from email-keyed to phone-keyed so that
-- guest checkouts can be deduplicated by phone number (E.164 format:
-- +91XXXXXXXXXX for Indian mobiles).
--
-- Changes:
--   1. email: drop NOT NULL so phone-only guest rows are allowed.
--   2. email: drop the UNIQUE constraint so multiple guests can share
--      an empty/null email without colliding.
--   3. name:  drop NOT NULL so phone-only rows inserted at checkout
--      time don't require a name to already exist.
--   4. phone: normalise existing values to E.164 (+91XXXXXXXXXX).
--   5. phone: de-duplicate any rows that would violate the new UNIQUE
--      constraint (keep earliest row per phone, null out the rest).
--   6. phone: add UNIQUE constraint customers_phone_key.
--
-- Idempotent: all structural changes are guarded with IF EXISTS / IF NOT
-- EXISTS checks so the script can be re-run safely.
-- =====================================================

-- 1. Allow email to be NULL (no-op if already nullable)
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;

-- 2. Drop the implicit unique constraint on email if it still exists.
--    The auto-generated name from "UNIQUE NOT NULL" in the original DDL is
--    customers_email_key.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customers_email_key'
      AND conrelid = 'customers'::regclass
  ) THEN
    ALTER TABLE customers DROP CONSTRAINT customers_email_key;
  END IF;
END $$;

-- 3. Allow name to be NULL so phone-only checkout rows don't need a name
ALTER TABLE customers ALTER COLUMN name DROP NOT NULL;

-- 4. Normalise existing phone values to E.164 (+91XXXXXXXXXX).
--    Strips any non-digit characters, takes the last 10 digits, and
--    prepends +91.  Only rows that are not already in the correct format
--    and have at least 10 digit characters are updated.
UPDATE customers
SET phone = '+91' || right(regexp_replace(phone, '\D', '', 'g'), 10)
WHERE phone IS NOT NULL
  AND phone <> ''
  AND phone !~ '^\+91\d{10}$'
  AND length(regexp_replace(phone, '\D', '', 'g')) >= 10;

-- 5. De-duplicate: if the data already contains two rows with the same
--    phone value, adding a UNIQUE constraint would fail.  We keep the
--    earliest row (MIN created_at) and set phone = NULL on all others so
--    they become "unlinked" guest rows.  NULL phone values are treated as
--    distinct by Postgres, so they don't conflict with the new constraint.
--
--    This is a safety net for dirty data only; in a clean deployment this
--    UPDATE will match zero rows.
UPDATE customers c
SET phone = NULL
WHERE phone IS NOT NULL
  AND c.id NOT IN (
    SELECT DISTINCT ON (phone) id
    FROM customers
    WHERE phone IS NOT NULL
    ORDER BY phone, created_at ASC NULLS LAST, id ASC
  );

-- 6. Add UNIQUE constraint on phone (guarded so re-running is safe).
--    Postgres treats each NULL as a distinct value, so multiple phone-less
--    rows are still allowed — which is correct for anonymous checkouts that
--    never supplied a phone.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customers_phone_key'
      AND conrelid = 'customers'::regclass
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
  END IF;
END $$;

-- Note: the UNIQUE constraint implicitly creates an index on phone
-- (customers_phone_key), so a separate idx_customers_phone is redundant
-- and is not added here.

-- =====================================================
-- Verification SELECTs
-- =====================================================

-- Row count and null breakdown
SELECT
  COUNT(*)                                        AS total_customers,
  COUNT(phone)                                    AS with_phone,
  COUNT(*) - COUNT(phone)                         AS without_phone,
  COUNT(email)                                    AS with_email,
  COUNT(*) - COUNT(email)                         AS without_email
FROM customers;

-- Sample of the first 5 rows to confirm schema shape
SELECT id, name, email, phone, created_at
FROM customers
ORDER BY created_at ASC
LIMIT 5;
