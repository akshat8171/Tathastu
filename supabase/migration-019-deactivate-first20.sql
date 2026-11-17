-- Deactivate FIRST20 first-order discount (no longer offered on the storefront).
UPDATE coupons
SET
  is_active = FALSE,
  updated_at = NOW()
WHERE code = 'FIRST20';
