# Go-Live Migration Runbook

This document provides the ordered checklist for applying all database migrations before the Tathastu e-commerce site goes live. These migrations are **applied manually** via the Supabase SQL Editor (no Supabase CLI automation is wired).

## Prerequisites

- **Supabase Project**: Access to the production Supabase project SQL Editor
- **Service Role Key**: The `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (for migrations that require bypassing RLS)
- **Backup**: Take a snapshot of the database before applying migrations (Supabase Dashboard → Database → Backups)

---

## Migration Order & Checklist

Apply in this exact order. Each migration is idempotent (safe to re-run), but they have cross-dependencies.

### ✅ Migration 001: Addresses
**File**: `supabase/migration-001-addresses.sql`

**Purpose**: Creates the `addresses` table for saved delivery addresses (tied to authenticated users).

**Dependencies**: None (foundation table)

**What it does**:
- Creates `addresses` table with user_id, name, phone, address_line, city, state, pincode, is_default
- Enables RLS with policies: users can view/manage their own addresses
- Adds index on `user_id` for fast lookups

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-001-addresses.sql`
3. Click **Run**

**Verification**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'addresses';
-- Should return 1 row
```

---

### ✅ Migration 002: RLS Policies ⚠️ **CRITICAL**
**File**: `supabase/migration-002-rls-policies.sql`

**Purpose**: Adds Row-Level Security policies for `orders`, `order_items`, and `payment_logs`. **Without this, guest checkout is completely broken** — all anon/user writes are silently rejected.

**Dependencies**: Requires `orders`, `order_items`, `payment_logs` tables from `schema.sql`

**What it does**:
- Adds `anon_can_insert_*` policies to allow guest checkout (anon role can INSERT orders/items/logs)
- Adds `users_can_read_own_*` policies so authenticated users can view their order history
- Documents the phone-format caveat (10-digit Indian mobiles vs E.164 format)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-002-rls-policies.sql`
3. Click **Run**

**Verification**:
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items', 'payment_logs');
-- Should return 6+ policies
```

**⚠️ CODE DEPENDENCY**: The checkout API route (`app/api/checkout/route.ts`) relies on these policies to allow anon order creation. If this migration is not applied, ALL guest checkouts will fail with 403 Forbidden.

---

### ✅ Migration 003: Product Slug
**File**: `supabase/migration-003-product-slug.sql`

**Purpose**: Adds the `slug` column to the `products` table to bridge the catalog ID (human-readable string like "lamps-lamp1") to the database UUID (`products.id`).

**Dependencies**: Requires `products` table from `schema.sql`

**What it does**:
- Adds `slug VARCHAR(100) UNIQUE NOT NULL` column to `products`
- Creates unique index on `slug` for fast lookups
- Documents why this exists (catalog slugs vs DB UUIDs)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-003-product-slug.sql`
3. Click **Run**

**Verification**:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug';
-- Should return 1 row
```

---

### ✅ Migration 004: Customers Upsert ⚠️ **CRITICAL**
**File**: `supabase/migration-004-customers-upsert.sql`

**Purpose**: Converts the `customers` table from email-keyed to phone-keyed to support guest checkout deduplication by phone number (E.164 format: +91XXXXXXXXXX).

**Dependencies**: Requires `customers` table from `schema.sql`

**What it does**:
- Drops `NOT NULL` constraint on `email` (allows phone-only guest rows)
- Drops `UNIQUE` constraint on `email` (multiple guests can share null email)
- Drops `NOT NULL` constraint on `name` (allows phone-only rows at checkout)
- Normalizes existing phone values to E.164 format
- De-duplicates rows by phone (keeps earliest, nulls out duplicates)
- Adds `UNIQUE` constraint on `phone` (`customers_phone_key`)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-004-customers-upsert.sql`
3. Click **Run**

**Verification**:
```sql
SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'customers' AND constraint_type = 'UNIQUE' AND constraint_name = 'customers_phone_key';
-- Should return 1 row
```

**⚠️ CODE DEPENDENCY**: The checkout API route relies on the `customers_phone_key` UNIQUE constraint to upsert guest customers by phone number without colliding. If this migration is not applied, guest checkouts will either fail or create duplicate customer records.

---

### ✅ Migration 005: Account Area
**File**: `supabase/migration-005-account.sql`

**Purpose**: Adds persistence for customer-facing account pages: `/account/profile`, `/account/addresses`, `/account/wishlist`.

**Dependencies**: None (standalone tables)

**What it does**:
- Creates `user_profiles` table (for display name, avatar URL)
- Creates `wishlist` table (for saved products)
- Enables RLS with policies: users can view/manage their own data
- Documents cross-provider identity (Firebase phone OTP vs Supabase email+password)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-005-account.sql`
3. Click **Run**

**Verification**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_profiles', 'wishlist');
-- Should return 2 rows
```

---

### ✅ Migration 006: Quote Requests
**File**: `supabase/migration-006-quote-requests.sql`

**Purpose**: Creates the `quote_requests` table for custom/bulk order inquiries.

**Dependencies**: None (standalone table)

**What it does**:
- Creates `quote_requests` table with type (keychain/portrait/custom_object/bulk_order), description, quantity, budget
- Adds indexes for admin filtering (`type`, `created_at`)
- Documents usage (inserted via `/api/quote-request` route)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-006-quote-requests.sql`
3. Click **Run**

**Verification**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quote_requests';
-- Should return 1 row
```

---

### ✅ Migration 007: Coupon Usage
**File**: `supabase/migration-007-coupon-usage.sql`

**Purpose**: Adds atomic coupon redemption counter to enforce usage limits.

**Dependencies**: Requires `coupons` table from `schema.sql`

**What it does**:
- Ensures `coupons.usage_count` column exists (INT DEFAULT 0)
- Creates RPC function `increment_coupon_usage(code TEXT)` for atomic server-side increment
- Documents why this exists (usage limits were never reachable before)

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-007-coupon-usage.sql`
3. Click **Run**

**Verification**:
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'increment_coupon_usage';
-- Should return 1 row
```

---

### ✅ Migration 008: Order Geography ⚠️ **CRITICAL**
**File**: `supabase/migration-008-order-geography.sql`

**Purpose**: Adds structured shipping location fields (`shipping_state`, `shipping_city`, `shipping_pincode`) to enable geography-based analytics in the admin dashboard.

**Dependencies**: Requires `orders` table from `schema.sql`

**What it does**:
- Adds `shipping_state`, `shipping_city`, `shipping_pincode` columns to `orders`
- Creates index on `shipping_state` for analytics queries
- Backfills from legacy `notes` field (regex extraction: "Address: <addr>, <city>, <state> - <pincode>")

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-008-order-geography.sql`
3. Click **Run**

**Verification**:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('shipping_state', 'shipping_city', 'shipping_pincode');
-- Should return 3 rows
```

**⚠️ CODE DEPENDENCY**: The admin analytics dashboard (`app/admin/dashboard/page.tsx`) relies on these columns for the "Orders by State" geography breakdown. If this migration is not applied, the geography chart will show zero data.

---

### Migration 012: Catalog CMS (admin SKUs + landing page)
**File**: `supabase/migration-012-catalog-cms.sql`

**Purpose**: Lets admins add catalog SKUs (photos, price, description, and all product-page metadata) and control what the homepage shows, without editing `lib/products.json`.

**Dependencies**: None (new tables + a public Storage bucket)

**What it does**:
- Creates `catalog_products` (`id` text PK, `payload` jsonb, `published`)
- Creates `homepage_settings` (single row `id=1`)
- Creates public Storage bucket `catalog-images` (8 MB, jpeg/png/webp/gif)
- RLS: public can read published products and homepage settings; service role manages writes

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-012-catalog-cms.sql`
3. Click **Run**
4. Confirm Storage → `catalog-images` exists and is **public**

**Verification**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('catalog_products', 'homepage_settings');
-- Should return 2 rows
```

**Without this migration**: The storefront still uses `lib/products.json`. Admin Catalog / Landing page saves will show an error asking you to run this SQL. Checkout of shipped SKUs is unaffected.

---

### Migration 013: Quote → order link
**File**: `supabase/migration-013-quote-orders.sql`

**Purpose**: Links a custom quote to an `orders` row **after** admin saves a quoted price. Adds `quote_requests.order_id` and `quoted_price`. New `/customize` requests stay in Quotes until priced; they are not created as ₹0 orders.

**Dependencies**: `quote_requests` (006/011) and `orders`

**How to apply**:
1. Open Supabase SQL Editor
2. Paste the contents of `migration-013-quote-orders.sql`
3. Click **Run**
4. In admin → Quotes, enter the agreed price, then create the order (never at ₹0)

**Verification**:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'quote_requests' AND column_name IN ('order_id', 'quoted_price');
-- Should return 2 rows
```

---

### Migration 014: Instagram connection
**File**: `supabase/migration-014-instagram-connection.sql`

**Purpose**: Single-row table for the owner's Instagram Login access token. Used by `/admin/instagram` (Insights + comment replies). No anon/authenticated access.

**How to apply**:
1. Open Supabase SQL Editor
2. Paste `migration-014-instagram-connection.sql`
3. Click **Run**

**Verification**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instagram_connection';
```

---

## Hard Dependencies Summary

These migrations are **required** for deployed code to function correctly:

| Migration | Why It's Critical |
|-----------|-------------------|
| **002-rls-policies** | Allows guest checkout (anon order creation); without it, checkout is completely broken |
| **004-customers-upsert** | Enables phone-keyed customer deduplication; without it, guest checkouts fail or create duplicates |
| **008-order-geography** | Provides data for admin geography analytics; without it, the geography breakdown chart is empty |

All other migrations are **strongly recommended** but not blocking (missing them degrades features rather than breaking core flows).

---

## Rollback Plan

If a migration causes issues, you can:
1. **Restore from backup**: Supabase Dashboard → Database → Backups → Restore
2. **Revert specific migration**: Each migration file documents its changes. You can manually write a rollback script (e.g., `DROP TABLE`, `DROP COLUMN`, `DROP POLICY`) if needed.

---

## Post-Migration Checklist

After applying all migrations:

- [ ] Verify all tables exist: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
- [ ] Verify RLS policies exist: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`
- [ ] Test guest checkout end-to-end (place an order as an anonymous user)
- [ ] Test authenticated user order history (sign in, verify orders appear in `/account/orders`)
- [ ] Test admin dashboard geography breakdown (verify "Orders by State" chart populates)
- [ ] Test coupon redemption (apply a coupon with `usage_limit=1`, verify it can't be reused)

---

## Support

If any migration fails:
1. Check the Supabase logs for the specific error
2. Verify the migration file syntax (all migrations are idempotent; safe to re-run)
3. Contact @akshat8171 (repo owner) for assistance
