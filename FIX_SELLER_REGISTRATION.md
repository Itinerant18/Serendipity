# Fix Seller Registration 500 Error

## Problem
Getting `500 Internal Server Error` when trying to register as a seller. The error is:
```
PGRST205: Could not find the table 'public.seller_profiles' in the schema cache
```

## Root Cause
The `seller_profiles` table exists in your seller database, but PostgREST's schema cache is stale and doesn't know about it. This prevents INSERT operations from working.

## Solution

### Option 1: Refresh Schema via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your seller project: `kfyocccbvsanihtzrfmb`

2. **Refresh Schema Cache**
   - Navigate to: **Settings** > **API**
   - Look for **"Reload Schema"** or **"Refresh Schema"** button
   - Click it and wait 10-30 seconds

3. **Alternative: Restart Project**
   - Go to: **Settings** > **General**
   - Click **"Restart Project"** (if available)
   - Wait for the project to restart

### Option 2: Refresh Schema via SQL Editor

1. **Open SQL Editor**
   - In Supabase Dashboard, go to: **SQL Editor**

2. **Run the Refresh Script**
   - Copy and paste this SQL:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   - Click **"Run"**
   - Wait 10-30 seconds

3. **Or run the full script**
   - Open: `backend/migrations/refreshSchemaCache.sql`
   - Copy the entire contents
   - Paste into SQL Editor and run

### Option 3: Verify Table Exists

If the above doesn't work, verify the table exists:

1. **Open SQL Editor**
2. **Run this query:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'seller_profiles';
   ```

3. **If table doesn't exist**, run:
   - `backend/migrations/createSellerDatabaseSchema.sql` in your SQL Editor

## Verification

After refreshing the schema:

1. **Test the connection:**
   ```bash
   cd backend
   npm run test:seller-db
   ```

2. **Try seller registration again**
   - The INSERT should now work

## Expected Behavior After Fix

- ✅ SELECT queries work (already working)
- ✅ INSERT queries work (should work after refresh)
- ✅ No more PGRST205 errors

## Still Having Issues?

If you're still getting errors after refreshing:

1. **Check your .env file** has all seller database credentials:
   ```env
   SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co
   SELLER_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SELLER_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Run diagnostics:**
   ```bash
   npm run fix:seller-schema
   ```

## Quick Fix Command

If you have access to Supabase SQL Editor, just run:
```sql
NOTIFY pgrst, 'reload schema';
```

Wait 30 seconds, then try registration again.
