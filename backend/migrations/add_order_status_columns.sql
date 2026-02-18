-- Add missing columns to orders table for order lifecycle support
-- Run this in the MAIN Supabase project SQL Editor (wosxyoivsiqzyufhcyhy)

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD',
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
