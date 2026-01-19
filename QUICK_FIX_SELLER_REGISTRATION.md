# Quick Fix: Seller Registration 500 Error

## ✅ Good News!
Your tables and policies already exist! You just need to **refresh the PostgREST schema cache**.

## 🚀 Quick Fix (2 Steps)

### Step 1: Refresh Schema Cache

Open **Supabase SQL Editor** and run this **ONE LINE**:

```sql
NOTIFY pgrst, 'reload schema';
```

**OR** if you want to be thorough, run the entire `refreshSchemaCache.sql` file.

### Step 2: Wait & Test

1. **Wait 10-30 seconds** for PostgREST to reload
2. **Try seller registration again** - it should work now!

---

## 🔄 Alternative: Recreate Everything (If Step 1 Doesn't Work)

If refreshing the cache doesn't work, you can safely recreate everything:

1. Open **Supabase SQL Editor**
2. Copy and paste the entire contents of: `backend/migrations/recreateSellerSchema.sql`
3. Click **Run**
4. Wait 10-30 seconds
5. Try registration again

This script:
- ✅ Safely drops existing policies first
- ✅ Recreates tables (won't delete existing data)
- ✅ Recreates all policies
- ✅ Refreshes the schema cache automatically

---

## 📋 What Happened?

The error `policy "Sellers can view own profile" already exists` means:
- ✅ Your tables **already exist**
- ✅ Your policies **already exist**
- ❌ PostgREST's **schema cache is stale**

The schema cache is what PostgREST uses to know which tables/columns exist. When you create tables manually, PostgREST doesn't automatically know about them until you refresh the cache.

---

## ✅ Verification

After running the refresh, test it:

```bash
cd backend
npm run test:seller-db
```

You should see:
- ✅ SELECT works
- ✅ INSERT works (no more PGRST205 error)

---

## 🆘 Still Not Working?

If you're still getting errors:

1. **Check your .env file** has all credentials:
   ```env
   SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co
   SELLER_SUPABASE_KEY=eyJhbGciOi...
   SELLER_SUPABASE_SERVICE_KEY=eyJhbGciOi...
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Restart your Supabase project** (Settings > General > Restart)

---

## 📝 Summary

**You only need to run this ONE command in SQL Editor:**

```sql
NOTIFY pgrst, 'reload schema';
```

Wait 30 seconds, then try registration again! 🎉
