-- Add images column to products table for multiple image support
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
