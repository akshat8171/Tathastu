-- =====================================================
-- SEED PRODUCTS DATA
-- Import products from your products.json
-- =====================================================

-- Note: This script converts your products.json data to SQL
-- Run this AFTER running schema.sql

-- Clear existing products (optional - only if you want to start fresh)
-- TRUNCATE TABLE products CASCADE;

-- Insert products from your catalog
-- Based on your products.json structure

-- Lamps Category
INSERT INTO products (id, name, description, category, price, original_price, images, rating, review_count, label_type, is_sold_out, care_guide, shipping_info) VALUES
('lamps-lamp2', 'Lamp 2', 'A beautifully crafted lamp that combines modern design with rustic charm. Perfect for adding ambient lighting to any room.', 'lamps', 2499.00, 2999.00, 
'["/images/products/lamps/lamp2/IMG_2517.jpeg", "/images/products/lamps/lamp2/IMG_2585.jpeg"]'::jsonb, 
4.5, 28, 'trending', false,
'Clean with a soft, dry cloth. Avoid using harsh chemicals. Keep away from direct sunlight to prevent fading. For optimal performance, use LED bulbs.',
'Free shipping on orders above ₹2000. Standard delivery takes 3-5 business days. Express delivery available for metro cities.');

INSERT INTO products (id, name, description, category, price, original_price, images, rating, review_count, label_type, is_sold_out, care_guide, shipping_info) VALUES
('lamps-lamp3', 'Lamp 3', 'An elegant and sophisticated lamp design that brings warmth and style to your living space. Features a unique base design and premium finish.', 'lamps', 2799.00, 3299.00,
'["/images/products/lamps/lamp3/2025-05-16_6a8ec33265afa8.webp", "/images/products/lamps/lamp3/2025-05-16_af6d1e89fb36e8.webp"]'::jsonb,
4.7, 42, 'editors-choice', false,
'Dust regularly with a microfiber cloth. Use mild soap and water for deeper cleaning. Ensure the lamp is unplugged before cleaning.',
'Free shipping on all orders. Standard delivery: 3-5 business days. Express delivery: 1-2 business days (metro cities only).');

INSERT INTO products (id, name, description, category, price, original_price, images, rating, review_count, label_type, is_sold_out, care_guide, shipping_info) VALUES
('lamps-Lamp4', 'Lamp 4', 'A stunning contemporary lamp that blends functionality with artistic design. Perfect for modern interiors.', 'lamps', 3199.00, 3799.00,
'["/images/products/lamps/Lamp4/IMG_2517.jpeg", "/images/products/lamps/Lamp4/IMG_2585.jpeg"]'::jsonb,
4.8, 35, 'new', false,
'Clean with a soft, dry cloth. Avoid using harsh chemicals. Keep away from direct sunlight.',
'Free shipping on orders above ₹2000. Standard delivery takes 3-5 business days.');

-- Note: Add all your other products here following the same pattern
-- You can use the script below to convert your products.json to SQL

-- =====================================================
-- VERIFY PRODUCTS
-- =====================================================

-- Check inserted products
SELECT id, name, category, price, original_price, label_type 
FROM products 
ORDER BY category, name;

-- Check product count by category
SELECT category, COUNT(*) as product_count 
FROM products 
GROUP BY category 
ORDER BY category;
