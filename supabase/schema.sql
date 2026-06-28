-- =====================================================
-- E-Commerce Database Schema for Tathastu/Layerix
-- Supabase PostgreSQL Database
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_customers_email ON customers(email);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    compare_price DECIMAL(10, 2),
    discount_percentage INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    is_sold_out BOOLEAN DEFAULT FALSE,
    label_type VARCHAR(50), -- 'trending', 'editors-choice', 'lightning-deal', 'new'
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    care_guide TEXT,
    shipping_info TEXT,
    images JSONB DEFAULT '[]', -- Array of image URLs
    second_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_label_type ON products(label_type);

-- =====================================================
-- 3. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Order totals
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    shipping DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Order status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
    
    -- Payment info
    payment_method VARCHAR(50) DEFAULT 'upi', -- 'upi', 'card', 'netbanking', 'wallet'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_id VARCHAR(255), -- Cashfree payment ID
    payment_order_id VARCHAR(255), -- Cashfree order ID
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional info
    notes TEXT,
    tracking_number VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- 4. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product snapshot (in case product is deleted/changed)
    product_name VARCHAR(255) NOT NULL,
    product_variant VARCHAR(100),
    product_image VARCHAR(500),
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 5. CART TABLE (Optional - for persistent carts)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL, -- For anonymous users
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE, -- For logged-in users
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    variant VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique product per session/customer
    UNIQUE(session_id, product_id, variant)
);

-- Indexes
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- =====================================================
-- 6. PAYMENT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Cashfree details
    cashfree_order_id VARCHAR(255),
    cashfree_payment_id VARCHAR(255),
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    
    -- Response data
    response_data JSONB,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX idx_payment_logs_cashfree_order_id ON payment_logs(cashfree_order_id);

-- =====================================================
-- 7. REVIEWS TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

-- =====================================================
-- 8. COUPONS TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,

    -- Discount details
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,

    -- Conditions
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),

    -- Usage limits
    usage_limit INTEGER, -- NULL = unlimited
    usage_count INTEGER DEFAULT 0,

    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,

    -- First-order gating: when TRUE, the coupon is only usable by customers
    -- with no prior orders (enforced server-side in lib/coupons.ts validateCoupon).
    is_first_order_only BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- =====================================================
-- SEED: FIRST20 first-order coupon
-- Run ONCE after schema is applied. Uses ON CONFLICT DO NOTHING so re-running
-- this script is safe.
-- Thresholds aligned to FREE_SHIPPING_THRESHOLD (₹199) from lib/pricing.ts.
-- =====================================================
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
    '20% off on your first order — valid for all customers placing their first Layerix order.',
    'percentage',
    20.00,
    199.00,       -- min order = FREE_SHIPPING_THRESHOLD so the coupon only applies to meaningful orders
    500.00,       -- cap discount at ₹500 (20% of ₹2500 max benefit)
    NULL,         -- no overall usage cap; first-order gating is enforced in code
    0,
    NOW(),
    NULL,         -- never expires
    TRUE,         -- FIRST20 is first-order only
    TRUE
)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = TRUE);

-- Public read access for reviews
CREATE POLICY "Approved reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (is_approved = TRUE);

-- Public read access for active coupons
CREATE POLICY "Active coupons are viewable by everyone"
    ON coupons FOR SELECT
    USING (is_active = TRUE);

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- Insert sample products (based on your existing products.json)
-- You can customize this based on your actual products

-- Note: This is commented out - you should insert your actual products
-- INSERT INTO products (name, description, category, price, original_price, images, label_type, rating, review_count) VALUES
-- ('Ancient Dragon Miniature', 'Detailed 3D printed dragon miniature', 'customized-miniatures', 2499.00, 2999.00, '["https://example.com/dragon.jpg"]', 'trending', 4.5, 45),
-- Add more products here...

-- =====================================================
-- VIEWS (Optional - for analytics)
-- =====================================================

-- View for order statistics
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- View for product performance
CREATE OR REPLACE VIEW product_performance AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.category, p.price
ORDER BY total_revenue DESC;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE customers IS 'Stores customer information';
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory';
COMMENT ON TABLE orders IS 'Customer orders with payment and shipping info';
COMMENT ON TABLE order_items IS 'Individual items in each order';
COMMENT ON TABLE cart_items IS 'Persistent shopping cart items';
COMMENT ON TABLE payment_logs IS 'Payment transaction logs from Cashfree';
COMMENT ON TABLE reviews IS 'Product reviews and ratings';
COMMENT ON TABLE coupons IS 'Discount coupons and promo codes';

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Then use the migration scripts to populate initial data
