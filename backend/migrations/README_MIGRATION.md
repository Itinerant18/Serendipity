# Seller Data Migration Guide

This guide explains how to migrate seller profiles and seller products from the main database to the seller database.

## Overview

The migration script (`migrateSellerData.js`) transfers:
1. **Seller Profiles**: All `seller_profiles` records from main database → seller database
2. **Seller Products**: All `products` with `seller_profile_id` from main database → seller database

## Prerequisites

1. ✅ Both databases are configured in your `.env` file:
   - Main database: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - Seller database: `SELLER_SUPABASE_URL`, `SELLER_SUPABASE_SERVICE_KEY`

2. ✅ Seller database has the required tables:
   - `seller_profiles` table (with same schema as main DB)
   - `products` table (with same schema as main DB)

3. ✅ You have admin access to both databases

## Running the Migration

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run migrate:seller
```

### Option 2: Direct execution

```bash
cd backend
node migrations/migrateSellerData.js
```

## What the Migration Does

### Step 1: Migrate Seller Profiles
- Fetches all `seller_profiles` from main database
- Checks if each profile already exists in seller database (by ID)
- Inserts only new profiles to avoid duplicates
- Preserves all profile data (store_name, description, logo_url, rating, etc.)

### Step 2: Migrate Seller Products
- Fetches all `products` where `seller_profile_id` is not null
- Processes products in batches of 50 for efficiency
- Checks for existing products to avoid duplicates
- Inserts products into seller database
- Preserves all product data (name, price, description, images, etc.)

### Step 3: Verification
- Counts records in both databases
- Compares counts to verify migration success
- Reports any discrepancies

## Migration Output

The script provides detailed logging:

```
🚀 Starting Seller Data Migration
=====================================
Main Database: https://wosxyoivsiqzyufhcyhy.supabase.co
Seller Database: https://kfyocccbvsanihtzrfmb.supabase.co
=====================================

📦 Step 1: Migrating seller_profiles...
Found 5 seller profile(s) to migrate
✅ Migrated seller profile: My Store (ID: abc123...)
✅ Migrated seller profile: Another Store (ID: def456...)
...

📦 Step 2: Migrating seller products...
Found 150 seller product(s) to migrate
   Processing batch 1 (50 products)...
   ✅ Migrated 50 product(s) in this batch
   ...

🔍 Step 3: Verifying migration...
📊 Migration Summary:
   Seller Profiles:
     - Main DB: 5
     - Seller DB: 5
   Seller Products:
     - Main DB: 150
     - Seller DB: 150

✅ Migration completed successfully!
```

## Important Notes

### ⚠️ Data Safety
- The migration script **does NOT delete** data from the main database
- All data is **copied** (not moved) to the seller database
- Original data remains in the main database as a backup

### ⚠️ Duplicate Prevention
- The script checks for existing records by ID before inserting
- If a record already exists, it's skipped (not overwritten)
- You can safely run the migration multiple times

### ⚠️ After Migration
1. **Test your application** to ensure everything works with the seller database
2. **Verify data integrity** by checking a few records manually
3. **Monitor for a few days** before considering cleanup
4. **Keep backups** of both databases

### ⚠️ Cleanup (Optional - Do NOT do this immediately)
After verifying the migration works correctly for a few days, you can optionally:
- Delete seller_profiles from main database (if you're sure)
- Delete seller products from main database (if you're sure)

**⚠️ WARNING**: Only do this after thorough testing and with a backup!

## Troubleshooting

### Error: "Main database credentials not set"
- Check your `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### Error: "Seller database credentials not set"
- Check your `.env` file has `SELLER_SUPABASE_URL` and `SELLER_SUPABASE_SERVICE_KEY`

### Error: "Could not find table 'seller_profiles'"
- Ensure the seller database has the `seller_profiles` table created
- Check the table schema matches the main database

### Error: "Column 'xxx' does not exist"
- The seller database schema might be different from main database
- Check both databases have the same column structure

### Migration shows "Skipped" for all records
- Records already exist in seller database (this is normal if you ran migration before)
- This is safe - no data will be duplicated

## Rollback

If something goes wrong:
1. The main database still has all original data (nothing was deleted)
2. You can manually delete migrated data from seller database if needed
3. Re-run the migration after fixing any issues

## Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your `.env` file has all required credentials
3. Ensure both databases are accessible
4. Check that table schemas match between databases
