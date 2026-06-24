-- =====================================================
-- Migration 002: RLS Policies for orders, order_items, payment_logs
-- =====================================================
--
-- WHAT THIS FIXES
-- ---------------
-- schema.sql enables RLS on orders, order_items, and payment_logs but
-- defines ZERO policies for those tables.  In Supabase/PostgreSQL, RLS
-- enabled + no policy = implicit DENY for every role (including anon).
-- This means:
--   • Guest-checkout order creation via the anon client is silently
--     rejected (or throws a 403), breaking the entire checkout flow.
--   • No authenticated user can read their own order history.
--
-- PHONE-FORMAT CAVEAT
-- -------------------
-- The app stores 10-digit Indian mobile numbers in orders.customer_phone
-- (e.g. "9876543210").  Supabase phone-OTP stores numbers in E.164 format
-- in auth.users.phone (e.g. "+919876543210").  When comparing the two,
-- we strip to the last 10 digits using right(..., 10) on both sides.
--
-- RECOMMENDATION: normalise at write-time.  When inserting an order,
-- ensure customer_phone is stored in E.164 (+91XXXXXXXXXX) and update
-- this policy to use a simple equality check:
--     auth.jwt()->>'phone' = customer_phone
-- Until then the right(..., 10) comparison below is safe for 10-digit
-- Indian numbers but will mis-match numbers from other countries.
--
-- SERVER-SIDE KEY REQUIREMENT
-- ---------------------------
-- Payment-status updates (marking an order as 'paid', writing Cashfree/
-- Razorpay webhook results to payment_logs) MUST be performed with the
-- Supabase SERVICE-ROLE key on the server side (Next.js API route /
-- Edge Function).  The NEXT_PUBLIC_SUPABASE_ANON_KEY exposed to the
-- browser must NEVER perform privileged writes.  The policies below
-- enforce this: UPDATE/DELETE on orders and all writes to payment_logs
-- from webhook handlers are not granted to anon/authenticated roles.
--
-- ADDRESSES TABLE (migration-001)
-- --------------------------------
-- The addresses table already has the four correct RLS policies from
-- migration-001-addresses.sql:
--   SELECT  — auth.uid() = user_id
--   INSERT  — auth.uid() = user_id
--   UPDATE  — auth.uid() = user_id
--   DELETE  — auth.uid() = user_id
-- DO NOT redefine those policies here.
-- =====================================================


-- =====================================================
-- SECTION 1: orders
-- =====================================================
-- Columns used in predicates (from schema.sql):
--   customer_phone  VARCHAR(20) NOT NULL  (app stores 10-digit)
--   customer_email  VARCHAR(255) NOT NULL

-- --- INSERT ---
-- Guest checkout: the browser anon client inserts new orders.
-- We allow INSERT for both anon (guest) and authenticated users.
-- No row-level predicate needed on insert; the app supplies all columns.
-- UPDATE/DELETE are intentionally NOT granted — payment status must be
-- updated via the service-role key on the server.

DROP POLICY IF EXISTS "orders_anon_insert"         ON orders;
DROP POLICY IF EXISTS "orders_authenticated_insert" ON orders;
DROP POLICY IF EXISTS "orders_select_by_phone"     ON orders;
DROP POLICY IF EXISTS "orders_select_by_email"     ON orders;

-- Allow guest (anon) to create orders
CREATE POLICY "orders_anon_insert"
    ON orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow logged-in users to create orders (e.g. if they are authenticated
-- via phone OTP before reaching checkout)
CREATE POLICY "orders_authenticated_insert"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to read their own orders matched by phone.
-- Phone format: app stores 10-digit, Supabase JWT stores E.164.
-- We compare the trailing 10 digits of each value.
-- IMPORTANT: once you normalise to E.164 in the app, simplify this to:
--   auth.jwt()->>'phone' = customer_phone
CREATE POLICY "orders_select_by_phone"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        right(auth.jwt()->>'phone', 10) = right(customer_phone, 10)
    );

-- Fallback: allow select by email for users who registered with email
-- (Supabase auth.email() returns the authenticated user's email address)
CREATE POLICY "orders_select_by_email"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        auth.email() = customer_email
    );

-- NOTE: No UPDATE or DELETE policy for anon/authenticated.
-- All order-status and payment-status updates must be performed by
-- server-side Next.js API routes using the Supabase service-role client
-- (SUPABASE_SERVICE_ROLE_KEY), never via NEXT_PUBLIC_SUPABASE_ANON_KEY.


-- =====================================================
-- SECTION 2: order_items
-- =====================================================
-- Columns used in predicates (from schema.sql):
--   order_id  UUID REFERENCES orders(id)

-- --- INSERT ---
-- order_items are written atomically with the order by the anon client.

DROP POLICY IF EXISTS "order_items_anon_insert"          ON order_items;
DROP POLICY IF EXISTS "order_items_authenticated_insert"  ON order_items;
DROP POLICY IF EXISTS "order_items_select_own_order"      ON order_items;

-- Guest checkout: allow anon to insert items
CREATE POLICY "order_items_anon_insert"
    ON order_items
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Authenticated checkout: allow authenticated to insert items
CREATE POLICY "order_items_authenticated_insert"
    ON order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- SELECT: a user may read items only if they can see the parent order.
-- The sub-query re-applies the same ownership check used in the orders
-- SELECT policies (phone or email).  This keeps the rule set in one place.
CREATE POLICY "order_items_select_own_order"
    ON order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM orders o
            WHERE o.id = order_items.order_id
              AND (
                  right(auth.jwt()->>'phone', 10) = right(o.customer_phone, 10)
                  OR auth.email() = o.customer_email
              )
        )
    );

-- NOTE: No UPDATE or DELETE for anon/authenticated.
-- Item-level changes (e.g. cancellation) must go through a server-side
-- function using the service-role key.


-- =====================================================
-- SECTION 3: payment_logs
-- =====================================================
-- This table contains raw payment-gateway response payloads, signatures,
-- and error messages — it is SENSITIVE and must never be readable by
-- anonymous or authenticated users via the anon key.
--
-- Write flow:
--   1. The order-creation API route (server, service-role) inserts the
--      initial log row when creating a Cashfree/Razorpay order.
--   2. The payment webhook route (server, service-role) inserts a row
--      when Cashfree/Razorpay posts a payment event.
--
-- Because both writes happen server-side with the service-role key,
-- the service role bypasses RLS entirely — no INSERT policy is needed
-- for service role.
--
-- We still define a narrow INSERT policy for the anon role for the
-- initial log row that may be written client-side during order creation
-- (if the app currently does this via the anon client).  Verify your
-- app's actual write path and remove the anon INSERT policy if the
-- initial log write is already server-side.
--
-- SELECT: NO policy for anon or authenticated = implicit DENY (desired).
-- Only the service-role key (admin API routes, dashboard) can read logs.

DROP POLICY IF EXISTS "payment_logs_anon_insert"   ON payment_logs;

-- CAUTION: Only keep this policy if your client-side checkout code
-- currently writes to payment_logs directly via the anon key.
-- If payment_logs is only written from server-side API routes, remove
-- this policy entirely — service role bypasses RLS automatically.
CREATE POLICY "payment_logs_anon_insert"
    ON payment_logs
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- No SELECT policy for anon or authenticated.
-- payment_logs rows are readable ONLY via the service-role key
-- (e.g. admin dashboard, webhook reconciliation).
-- This is intentional: with RLS enabled and no SELECT policy,
-- anon/authenticated queries return zero rows (not an error), which
-- prevents accidental data leakage through mis-configured frontend code.


-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Apply in Supabase SQL Editor or via `supabase db push`.
-- Verify by:
--   1. Placing a test order as a guest — should succeed.
--   2. Querying orders as anon — should return 0 rows (not an error).
--   3. Signing in via phone OTP and querying orders — should return only
--      your own orders.
--   4. Querying payment_logs as anon/authenticated — should return 0 rows.
