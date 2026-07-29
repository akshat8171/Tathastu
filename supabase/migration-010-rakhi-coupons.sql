-- migration-010-rakhi-coupons.sql
-- Raksha Bandhan 2026 festival coupons for the new `rakhi` product category.
--
-- WHY: The rakhi launch needs competitive, psychology-driven offers WITHOUT
-- ever pushing the realised price below ₹200 per rakhi (owner constraint).
-- Validation + discount math already live in lib/coupons.ts; this migration only
-- SEEDS coupon rows. Discounts are computed server-side against the trusted
-- subtotal (never client-supplied), and only ONE coupon applies per order
-- (see lib/pricing.applyDiscount), so the coupons below never stack.
--
-- MARGIN SAFETY (cheapest rakhi = ₹259; sets: ₹549/2, ₹1049/4):
--   RAKHI2026  10% off, cap ₹300, min ₹259  → worst case ₹233.10 / rakhi  ✓ >= 200
--   RAKHISET   ₹100 off,           min ₹549  → worst case ₹224.50 / rakhi  ✓ >= 200
--   RAKHIFAM   ₹200 off,           min ₹999  → worst case ₹209.00 / rakhi  ✓ >= 200
-- (The existing FIRST20 = 20% off, cap ₹500, min ₹199 → ₹207.20 / rakhi ✓.)
--
-- Thresholds are chosen so the MINIMUM order value that unlocks each coupon
-- keeps every rakhi at/above the ₹200 floor. The percentage cap on RAKHI2026
-- prevents runaway discounts on large mixed carts.
--
-- CUSTOMER PSYCHOLOGY behind the design:
--   • RAKHI2026 — a modest, everyone-gets-it 10% "festival welcome" that creates
--     an easy yes without cheapening the product (small % on an anchored,
--     already-discounted price feels like a bonus, not a fire sale).
--   • RAKHISET — a flat ₹100 that rewards buying 2+ (basket-building / AOV lift);
--     a round-number rupee amount reads as more generous than an equivalent %.
--   • RAKHIFAM — a flat ₹200 on family orders (₹999+) drives the high-value
--     "sort the whole family in one order" behaviour while protecting per-unit
--     margin via the high minimum.
--
-- Do NOT apply automatically to the live shared DB — the Director/owner applies
-- migrations manually (per project constraint). Safe to run more than once
-- (ON CONFLICT DO NOTHING keeps it idempotent and never overwrites edits).

INSERT INTO coupons (
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    usage_limit,
    usage_count,
    valid_from,
    valid_until,
    is_first_order_only,
    is_active
)
VALUES
    (
        'RAKHI2026',
        '10% off your customised rakhi order for Raksha Bandhan 2026. Min order ₹259.',
        'percentage',
        10.00,
        259.00,        -- = cheapest single rakhi, so a single rakhi still nets ₹233
        300.00,        -- cap keeps large-cart discounts sane
        NULL,          -- available to everyone (not first-order gated)
        0,
        NOW(),
        '2026-08-31T23:59:59+05:30',  -- festival window; expires just after Rakhi
        FALSE,
        TRUE
    ),
    (
        'RAKHISET',
        '₹100 off when you order a rakhi set (2 or more). Min order ₹549.',
        'fixed',
        100.00,
        549.00,        -- unlocks at the set-of-2 price; worst case ₹224.50 / rakhi
        NULL,          -- fixed amount needs no cap
        NULL,
        0,
        NOW(),
        '2026-08-31T23:59:59+05:30',
        FALSE,
        TRUE
    ),
    (
        'RAKHIFAM',
        '₹200 off family rakhi orders over ₹999 — sort the whole family in one order.',
        'fixed',
        200.00,
        999.00,        -- high min protects per-rakhi margin; worst case ₹209 / rakhi
        NULL,
        NULL,
        0,
        NOW(),
        '2026-08-31T23:59:59+05:30',
        FALSE,
        TRUE
    )
ON CONFLICT (code) DO NOTHING;
