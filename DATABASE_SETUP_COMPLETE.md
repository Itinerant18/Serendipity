# Database Setup Complete Guide

## ✅ What Has Been Done

1. ✅ **Dual Database Architecture Configured**
   - Main database for customers, orders, cart
   - Seller database for seller profiles and products

2. ✅ **Code Updated**
   - All seller routes use seller database
   - Product routes route seller products to seller database
   - Customer browsing queries both databases

3. ✅ **Migration Scripts Created**
   - `migrateSellerData.js` - Migrates existing seller data
   - `verifyDatabases.js` - Verifies both databases
   - `setupSellerDatabase.js` - Checks seller database setup

4. ✅ **SQL Schema Created**
   - `createSellerDatabaseSchema.sql` - Complete schema for seller database

## 🚀 Quick Start Checklist

### Step 1: Verify Seller Database Tables

```bash
cd backend
npm run setup:seller-db
```

**If tables don't exist**, you'll need to create them:

1. Go to: https://supabase.com/dashboard/project/kfyocccbvsanihtzrfmb/sql
2. Copy SQL from: `backend/migrations/createSellerDatabaseSchema.sql`
3. Paste and run in SQL Editor
4. Verify tables were created

### Step 2: Verify Both Databases

```bash
npm run verify:databases
```

This will check:
- ✅ Table existence
- ✅ Data counts
- ✅ Query performance
- ✅ Schema compatibility

### Step 3: Migrate Existing Data (if you have seller data)

```bash
npm run migrate:seller
```

This will:
- Copy all `seller_profiles` from main → seller DB
- Copy all seller `products` from main → seller DB
- Verify migration success

### Step 4: Test the Application

1. Start backend: `npm start`
2. Start frontend: `cd ../frontensd/apps/web && npm run dev`
3. Test seller registration
4. Test product creation
5. Test product browsing

## 📊 Database Status

### Main Database ✅
- **Status**: Active
- **Tables**: All required tables exist
- **Performance**: Good (with recommended indexes)

### Seller Database ⚠️
- **Status**: Needs table creation
- **Tables**: `seller_profiles`, `products` need to be created
- **Performance**: Will be optimized after setup

## 🔧 Performance Optimizations

### Already Implemented
- ✅ Indexes on foreign keys
- ✅ Indexes on frequently queried columns
- ✅ Batch processing for migrations
- ✅ Efficient query patterns

### Recommended (if needed)
- Add indexes on `created_at` for time-based queries
- Add composite indexes for complex queries
- Monitor query performance and optimize as needed

## 📝 Files Created

1. **Migration Scripts**:
   - `backend/migrations/migrateSellerData.js`
   - `backend/migrations/verifyDatabases.js`
   - `backend/migrations/setupSellerDatabase.js`

2. **SQL Schema**:
   - `backend/migrations/createSellerDatabaseSchema.sql`

3. **Documentation**:
   - `DATABASE_STATUS.md`
   - `backend/migrations/README_MIGRATION.md`

4. **Configuration**:
   - `backend/config/supabaseSeller.js`
   - Updated `QUICK_ENV_SETUP.md` with seller credentials

## ⚡ Performance Expectations

### Query Times (Expected)
- **Main DB queries**: < 50ms (with indexes)
- **Seller DB queries**: < 50ms (with indexes)
- **Combined queries** (browsing): < 100ms

### Scalability
- **Main DB**: Handles customer operations efficiently
- **Seller DB**: Isolated seller operations for better performance
- **Separation**: Reduces load on main database

## 🎯 Next Actions

1. **Create seller database tables** (if not done)
   ```sql
   -- Run createSellerDatabaseSchema.sql in seller database
   ```

2. **Run verification**
   ```bash
   npm run verify:databases
   ```

3. **Migrate data** (if you have existing seller data)
   ```bash
   npm run migrate:seller
   ```

4. **Test thoroughly**
   - Seller registration
   - Product creation
   - Product browsing
   - Order processing

## ✅ Success Criteria

Your setup is complete when:
- ✅ Seller database has `seller_profiles` and `products` tables
- ✅ Both databases are accessible from backend
- ✅ Seller registration works
- ✅ Product creation works (saves to seller DB)
- ✅ Product browsing works (queries both DBs)
- ✅ Verification script shows all green checkmarks

## 🆘 Troubleshooting

### "Table does not exist" errors
→ Run `createSellerDatabaseSchema.sql` in seller database

### Slow queries
→ Check indexes are created, verify RLS policies

### Migration fails
→ Verify credentials, check table schemas match

### Products not showing
→ Verify product browsing queries both databases correctly

For detailed help, see:
- `DATABASE_STATUS.md` - Complete status and optimization guide
- `backend/migrations/README_MIGRATION.md` - Migration guide
