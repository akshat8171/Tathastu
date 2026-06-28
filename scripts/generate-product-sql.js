/**
 * Script to convert lib/products.json into an idempotent product seed.
 * Run: node scripts/generate-product-sql.js
 *
 * IMPORTANT — why this is not a naive INSERT of the catalog id:
 * --------------------------------------------------------------
 * products.id is a UUID primary key. The storefront catalog identifies
 * products by a human-readable STRING slug ("lamps-lamp1"). Earlier versions
 * of this script wrote the slug directly into the UUID `id` column, which
 * Postgres rejects (22P02 invalid input syntax for type uuid) — that broke
 * both the seed AND, downstream, every checkout (order_items.product_id is a
 * UUID FK → products(id)).
 *
 * The fix (see supabase/migration-003-product-slug.sql):
 *   - Store the catalog slug in a dedicated `slug` column (UNIQUE).
 *   - Derive `id` DETERMINISTICALLY from the slug with uuid_generate_v5, so a
 *     re-seed never changes a product's UUID and historical order_items FKs
 *     stay valid.
 *   - The app maps slug → UUID at order-write time (lib/supabase/orders.ts).
 *
 * Run order in Supabase: schema.sql → migration-001 → migration-002 →
 * migration-003 → seed-all-products.sql (this file).
 */

const fs = require('fs')
const path = require('path')

// Fixed namespace UUID for uuid_generate_v5(). Constant + hardcoded on purpose:
// the product UUIDs are a pure function of (this namespace, slug), so they are
// stable forever. DO NOT change this value — doing so would re-key every
// product and orphan existing order_items.product_id references.
const SLUG_NAMESPACE = 'b6e0f8a2-1c3d-4e5f-8a9b-0c1d2e3f4a5b'

// Read products.json
const productsPath = path.join(__dirname, '../lib/products.json')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

// Escape single quotes for SQL string literals
const escapeSql = (str) => (str == null ? null : String(str).replace(/'/g, "''"))
const lit = (str) => (str ? `'${escapeSql(str)}'` : 'NULL')

let sql = `-- =====================================================
-- AUTO-GENERATED PRODUCT SEED  (generated from lib/products.json)
-- Generator: scripts/generate-product-sql.js  —  DO NOT EDIT BY HAND
-- =====================================================
--
-- Prerequisites (run first, in order):
--   schema.sql, migration-001-addresses.sql, migration-002-rls-policies.sql,
--   migration-003-product-slug.sql
--
-- Idempotent: products.id is derived deterministically from the slug via
-- uuid_generate_v5(), and rows upsert ON CONFLICT (slug). Re-running this file
-- refreshes catalog fields without ever changing a product's UUID.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`

products.forEach((product) => {
  const {
    id, // catalog slug, e.g. "lamps-lamp1"
    name,
    description,
    category,
    price,
    originalPrice,
    comparePrice,
    discountPercentage,
    images,
    secondImageUrl,
    labelType,
    isSoldOut,
    rating,
    reviewCount,
    careGuide,
    shippingInfo,
  } = product

  const slug = id
  const imagesJson = JSON.stringify(images || [])
  const discount =
    discountPercentage ||
    (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null)

  sql += `INSERT INTO products (
  id,
  slug,
  name,
  description,
  category,
  price,
  original_price,
  compare_price,
  discount_percentage,
  images,
  second_image_url,
  label_type,
  is_sold_out,
  rating,
  review_count,
  care_guide,
  shipping_info,
  stock_quantity,
  is_active
) VALUES (
  uuid_generate_v5('${SLUG_NAMESPACE}'::uuid, '${escapeSql(slug)}'),
  '${escapeSql(slug)}',
  ${lit(name)},
  ${lit(description)},
  '${escapeSql(category)}',
  ${price},
  ${originalPrice || 'NULL'},
  ${comparePrice || 'NULL'},
  ${discount || 'NULL'},
  '${imagesJson}'::jsonb,
  ${secondImageUrl ? `'${escapeSql(secondImageUrl)}'` : 'NULL'},
  ${labelType ? `'${escapeSql(labelType)}'` : 'NULL'},
  ${isSoldOut || false},
  ${rating || 0.0},
  ${reviewCount || 0},
  ${lit(careGuide)},
  ${lit(shippingInfo)},
  100,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  compare_price = EXCLUDED.compare_price,
  discount_percentage = EXCLUDED.discount_percentage,
  images = EXCLUDED.images,
  second_image_url = EXCLUDED.second_image_url,
  label_type = EXCLUDED.label_type,
  is_sold_out = EXCLUDED.is_sold_out,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  care_guide = EXCLUDED.care_guide,
  shipping_info = EXCLUDED.shipping_info,
  is_active = true,
  updated_at = NOW();

`
})

sql += `
-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT slug, id, name, category, price, label_type FROM products ORDER BY category, slug;
SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY category;
SELECT COUNT(*) AS total_products FROM products;
`

const outputPath = path.join(__dirname, '../supabase/seed-all-products.sql')
fs.writeFileSync(outputPath, sql, 'utf8')

console.log('✅ Product seed generated (deterministic UUIDs + slug, upsertable).')
console.log(`📁 Output: ${outputPath}`)
console.log(`📊 Products: ${products.length}`)
