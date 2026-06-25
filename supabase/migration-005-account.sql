-- =====================================================
-- Migration 005: Account area (profiles, wishlist, addresses)
-- =====================================================
-- Adds the persistence layer behind the customer-facing account pages:
--   /account/profile, /account/addresses, /account/wishlist
--
-- Cross-provider identity
-- -----------------------
-- Users authenticate via EITHER Firebase phone OTP (uid = 28-char string) OR
-- Supabase email+password (uid = UUID). The unified app identity is
-- AppUser.id (lib/auth/session.ts), a STRING in both cases. Every per-user
-- table below therefore keys on a TEXT user_id, NOT a uuid.
--
-- Security model
-- --------------
-- All access happens SERVER-SIDE via the service-role client (supabaseAdmin),
-- which bypasses RLS — identical to the orders flow (see migration-002). RLS
-- stays ENABLED with no permissive anon policy, so direct browser/anon access
-- is denied by default. The app enforces per-user scoping by always filtering
-- on getCurrentUser().id.
--
-- Idempotent: guarded with IF EXISTS / IF NOT EXISTS so it can be re-run.
-- =====================================================

-- -----------------------------------------------------
-- 1. profiles — editable name/email per user (Profile page)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id          TEXT PRIMARY KEY,          -- = AppUser.id (Firebase uid or Supabase uuid-as-text)
    first_name  VARCHAR(255),
    last_name   VARCHAR(255),
    email       VARCHAR(255),              -- optional contact email (phone users may add one)
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- -----------------------------------------------------
-- 2. wishlist_items — saved products per user (Wishlist page + heart toggle)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     TEXT NOT NULL,             -- = AppUser.id
    product_id  TEXT NOT NULL,             -- catalog slug (e.g. "lamps-lamp1")
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One row per (user, product); makes add idempotent + remove unambiguous.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'wishlist_items_user_product_key'
      AND conrelid = 'wishlist_items'::regclass
  ) THEN
    ALTER TABLE wishlist_items
      ADD CONSTRAINT wishlist_items_user_product_key UNIQUE (user_id, product_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 3. addresses — migrate to cross-provider TEXT user_id + billing/shipping slots
-- -----------------------------------------------------

-- 3a. Drop the Supabase-auth-only RLS policies. They compare auth.uid() (a uuid)
--     to user_id and cannot work for Firebase users or under service-role access.
--     They must also be dropped before the column type can change.
DROP POLICY IF EXISTS "Users can view own addresses"   ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

-- 3b. Convert user_id uuid → TEXT (no-op if already text).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'addresses' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE addresses ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  END IF;
END $$;

-- 3c. Add address_type ('billing' | 'shipping'). The account UI exposes exactly
--     one billing + one shipping slot per user.
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_type VARCHAR(20);

-- 3d. One slot per (user, type). NULL types (legacy rows) are treated as
--     distinct by Postgres so they never collide.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'addresses_user_type_key'
      AND conrelid = 'addresses'::regclass
  ) THEN
    ALTER TABLE addresses
      ADD CONSTRAINT addresses_user_type_key UNIQUE (user_id, address_type);
  END IF;
END $$;

-- RLS already enabled on addresses (migration-001). With the auth.uid() policies
-- now dropped and no anon policy added, direct anon access is denied; service-role
-- access (the app's only path) bypasses RLS. No new policies needed.

-- =====================================================
-- Verification
-- =====================================================
SELECT 'profiles' AS table_name, COUNT(*) AS rows FROM profiles
UNION ALL SELECT 'wishlist_items', COUNT(*) FROM wishlist_items
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses;

-- Confirm addresses.user_id is now text + address_type exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'addresses' AND column_name IN ('user_id', 'address_type')
ORDER BY column_name;
