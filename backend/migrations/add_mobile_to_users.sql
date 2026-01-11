-- Migration: Add mobile number column to users table
-- This migration adds a mobile column to store user phone numbers

-- Add mobile column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Add index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);

-- Add comment to document the column
COMMENT ON COLUMN public.users.mobile IS 'User mobile/phone number for contact and verification';
