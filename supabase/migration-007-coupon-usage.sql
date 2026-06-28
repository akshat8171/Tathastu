-- migration-007-coupon-usage.sql
-- Atomic coupon redemption counter.
--
-- WHY: lib/coupons.ts computeCouponDiscount() rejects a coupon once
-- usage_count >= usage_limit, but nothing was incrementing usage_count, so the
-- limit was never reachable. The order-creation route now records each
-- redemption by calling incrementCouponUsage(), which prefers this RPC for an
-- atomic, race-free server-side increment (falls back to read-then-write if the
-- function is absent).
--
-- Do NOT apply automatically to the live shared DB — the Director/owner applies
-- migrations manually (per project constraint). Safe to run more than once.

-- ── Ensure the column exists (no-op if schema.sql already created it) ──────────
alter table if exists public.coupons
  add column if not exists usage_count integer not null default 0;

-- ── Atomic increment function ─────────────────────────────────────────────────
-- Case-insensitive match on code (validateCoupon also matches case-insensitively).
-- SECURITY DEFINER so it runs with the table owner's rights; the service-role
-- client used by the app already has full access, but this keeps the contract
-- explicit and lets a future anon path call it safely if ever needed.
create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
     set usage_count = coalesce(usage_count, 0) + 1
   where upper(code) = upper(coupon_code);
$$;

-- Allow the API roles to execute it.
grant execute on function public.increment_coupon_usage(text) to service_role;
grant execute on function public.increment_coupon_usage(text) to authenticated;
grant execute on function public.increment_coupon_usage(text) to anon;
