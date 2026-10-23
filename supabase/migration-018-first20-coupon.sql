-- migration-018-first20-coupon.sql
-- Ensure FIRST20 works on databases that were created from an older coupons
-- schema (no is_first_order_only column) and/or never received the schema.sql
-- seed row.
--
-- Safe to re-run: ADD COLUMN IF NOT EXISTS + ON CONFLICT DO NOTHING.

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS is_first_order_only BOOLEAN DEFAULT FALSE;

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
VALUES (
    'FIRST20',
    '20% off on your first order — valid for all customers placing their first order.',
    'percentage',
    20.00,
    199.00,
    500.00,
    NULL,
    0,
    NOW(),
    NULL,
    TRUE,
    TRUE
)
ON CONFLICT (code) DO NOTHING;

-- If FIRST20 already existed without the flag, mark it first-order-only.
UPDATE coupons
SET is_first_order_only = TRUE,
    is_active = TRUE,
    updated_at = NOW()
WHERE code = 'FIRST20'
  AND (is_first_order_only IS DISTINCT FROM TRUE OR is_active IS DISTINCT FROM TRUE);
