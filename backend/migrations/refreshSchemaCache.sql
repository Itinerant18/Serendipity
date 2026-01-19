-- ============================================
-- Refresh PostgREST Schema Cache
-- ============================================
-- This script refreshes PostgREST's schema cache
-- Run this in your Supabase SQL Editor if you're getting PGRST205 errors
-- ============================================

-- Method 1: Notify PostgREST to reload schema (PRIMARY METHOD)
NOTIFY pgrst, 'reload schema';

-- Method 2: Ensure schema is accessible
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Method 3: Verify tables exist and are accessible
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('seller_profiles', 'products')
ORDER BY table_name;

-- ============================================
-- After running this script:
-- 1. Wait 10-30 seconds for PostgREST to reload
-- 2. Try your seller registration again
-- 3. If still failing, restart your Supabase project
-- ============================================
