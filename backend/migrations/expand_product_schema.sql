-- Comprehensive Schema Update for Expanded Product Features
-- Run this in your Supabase SQL Editor for BOTH Main and Seller databases

-- 1. Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS weight TEXT, -- Storing as string to match frontend format "10 kg"
ADD COLUMN IF NOT EXISTS dimensions TEXT, -- Storing as string to match frontend format "10x10x10 cm"
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of strings
ADD COLUMN IF NOT EXISTS video_url TEXT, -- Primary video
ADD COLUMN IF NOT EXISTS videos TEXT[], -- Array of video URLs
ADD COLUMN IF NOT EXISTS shipping_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipping_class VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. Add constraints
-- Ensure slug is unique per seller or globally? Usually global-ish or per seller. 
-- For now, let's just index it.
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 3. Refresh schema cache
NOTIFY pgrst, 'reload schema';
