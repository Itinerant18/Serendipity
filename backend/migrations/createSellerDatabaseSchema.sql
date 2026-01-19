-- ============================================
-- Seller Database Schema Creation Script
-- ============================================
-- Run this SQL in your seller database (kfyocccbvsanihtzrfmb)
-- to create the necessary tables for seller data
-- ============================================

-- ============================================
-- 1. Create seller_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    store_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    logo_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for seller_profiles
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_store_name ON seller_profiles(store_name);

-- ============================================
-- 2. Create products table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    count_in_stock INTEGER DEFAULT 0,
    num_reviews INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    seller_profile_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
    user_id UUID,
    seller_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products (for performance)
CREATE INDEX IF NOT EXISTS idx_products_seller_profile_id ON products(seller_profile_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- ============================================
-- 3. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create RLS Policies for seller_profiles
-- ============================================
-- Policy: Sellers can view their own profile
CREATE POLICY "Sellers can view own profile"
    ON seller_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Sellers can insert their own profile
CREATE POLICY "Sellers can insert own profile"
    ON seller_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Sellers can update their own profile
CREATE POLICY "Sellers can update own profile"
    ON seller_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Public can view seller profiles (for store browsing)
CREATE POLICY "Public can view seller profiles"
    ON seller_profiles FOR SELECT
    USING (true);

-- ============================================
-- 5. Create RLS Policies for products
-- ============================================
-- Policy: Sellers can view their own products
CREATE POLICY "Sellers can view own products"
    ON products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM seller_profiles
            WHERE seller_profiles.id = products.seller_profile_id
            AND seller_profiles.user_id = auth.uid()
        )
    );

-- Policy: Sellers can insert their own products
CREATE POLICY "Sellers can insert own products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM seller_profiles
            WHERE seller_profiles.id = products.seller_profile_id
            AND seller_profiles.user_id = auth.uid()
        )
    );

-- Policy: Sellers can update their own products
CREATE POLICY "Sellers can update own products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM seller_profiles
            WHERE seller_profiles.id = products.seller_profile_id
            AND seller_profiles.user_id = auth.uid()
        )
    );

-- Policy: Sellers can delete their own products
CREATE POLICY "Sellers can delete own products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM seller_profiles
            WHERE seller_profiles.id = products.seller_profile_id
            AND seller_profiles.user_id = auth.uid()
        )
    );

-- Policy: Public can view products (for customer browsing)
CREATE POLICY "Public can view products"
    ON products FOR SELECT
    USING (true);

-- ============================================
-- 6. Create updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to seller_profiles
CREATE TRIGGER update_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Queries (Run after creating tables)
-- ============================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('seller_profiles', 'products');

-- SELECT COUNT(*) FROM seller_profiles;
-- SELECT COUNT(*) FROM products;
