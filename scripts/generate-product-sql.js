/**
 * Script to convert products.json to SQL INSERT statements
 * Run: node scripts/generate-product-sql.js
 */

const fs = require('fs')
const path = require('path')

// Read products.json
const productsPath = path.join(__dirname, '../lib/products.json')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

// Generate SQL INSERT statements
let sql = `-- =====================================================
-- AUTO-GENERATED PRODUCT DATA
-- Generated from products.json
-- =====================================================

-- Clear existing products (optional)
-- TRUNCATE TABLE products CASCADE;

`

products.forEach((product) => {
  const {
    id,
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

  // Escape single quotes in strings
  const escapeSql = (str) => {
    if (!str) return null
    return str.replace(/'/g, "''")
  }

  // Convert images array to JSONB
  const imagesJson = JSON.stringify(images || [])

  // Calculate discount if not provided
  const discount = discountPercentage || 
    (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null)

  sql += `INSERT INTO products (
  id, 
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
  '${id}',
  '${escapeSql(name)}',
  ${description ? `'${escapeSql(description)}'` : 'NULL'},
  '${category}',
  ${price},
  ${originalPrice || 'NULL'},
  ${comparePrice || 'NULL'},
  ${discount || 'NULL'},
  '${imagesJson}'::jsonb,
  ${secondImageUrl ? `'${secondImageUrl}'` : 'NULL'},
  ${labelType ? `'${labelType}'` : 'NULL'},
  ${isSoldOut || false},
  ${rating || 0.0},
  ${reviewCount || 0},
  ${careGuide ? `'${escapeSql(careGuide)}'` : 'NULL'},
  ${shippingInfo ? `'${escapeSql(shippingInfo)}'` : 'NULL'},
  100,
  true
);

`
})

sql += `
-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted products
SELECT id, name, category, price, label_type 
FROM products 
ORDER BY category, name;

-- Count products by category
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- Check total products
SELECT COUNT(*) as total_products FROM products;
`

// Write to file
const outputPath = path.join(__dirname, '../supabase/seed-all-products.sql')
fs.writeFileSync(outputPath, sql, 'utf8')

console.log('✅ SQL file generated successfully!')
console.log(`📁 Output: ${outputPath}`)
console.log(`📊 Products: ${products.length}`)
console.log('\n🚀 Next steps:')
console.log('1. Open Supabase SQL Editor')
console.log('2. Copy content from supabase/seed-all-products.sql')
console.log('3. Run the query')
console.log('4. Verify products inserted')
