# Database Status & Performance Report

This document provides a comprehensive overview of both databases and their optimization status.

## Quick Verification Commands

```bash
# Check seller database setup
cd backend
npm run setup:seller-db

# Verify both databases
npm run verify:databases

# Migrate seller data (if needed)
npm run migrate:seller
```

## Database Overview

### Main Database (wosxyoivsiqzyufhcyhy)
**Purpose**: Customer-facing operations, orders, cart, admin products

**Tables**:
- ✅ `users` - User accounts and authentication
- ✅ `seller_profiles` - Seller profiles (to be migrated)
- ✅ `products` - Products (admin products + seller products to be migrated)
- ✅ `orders` - Customer orders
- ✅ `order_items` - Order line items
- ✅ `cart` - Shopping cart
- ✅ `addresses` - User addresses
- ✅ `payment_methods` - Payment methods

**Status**: ✅ Active and operational

### Seller Database (kfyocccbvsanihtzrfmb)
**Purpose**: Seller-specific data and operations

**Required Tables**:
- ⚠️ `seller_profiles` - **Needs to be created**
- ⚠️ `products` - **Needs to be created**

**Status**: ⚠️ **Tables need to be created**

## Setup Steps for Seller Database

### Step 1: Create Tables

**Option A: Using SQL Editor (Recommended)**
1. Go to: https://supabase.com/dashboard/project/kfyocccbvsanihtzrfmb/sql
2. Copy the SQL from `backend/migrations/createSellerDatabaseSchema.sql`
3. Paste and run in the SQL Editor
4. Verify tables were created

**Option B: Using Table Editor**
1. Go to: https://supabase.com/dashboard/project/kfyocccbvsanihtzrfmb/editor
2. Click "New table"
3. Create `seller_profiles` table with columns:
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Not Null)
   - `store_name` (VARCHAR(255), Not Null, Unique)
   - `description` (TEXT)
   - `logo_url` (TEXT)
   - `rating` (DECIMAL(3,2), Default 0)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
4. Create `products` table with columns matching main database schema

### Step 2: Verify Setup

```bash
cd backend
npm run setup:seller-db
```

### Step 3: Migrate Existing Data (if any)

```bash
npm run migrate:seller
```

## Performance Optimization

### Recommended Indexes

#### Main Database
```sql
-- Products table
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_profile_id ON products(seller_profile_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
```

#### Seller Database
```sql
-- Already included in createSellerDatabaseSchema.sql
-- seller_profiles indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_store_name ON seller_profiles(store_name);

-- products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_profile_id ON products(seller_profile_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
```

### Query Performance Tips

1. **Use Indexes**: All foreign keys and frequently queried columns should have indexes
2. **Batch Operations**: Use batch inserts/updates when possible
3. **Limit Results**: Always use `.limit()` for list queries
4. **Select Specific Columns**: Use `.select('col1, col2')` instead of `.select('*')` when possible

## Data Distribution Strategy

### Current Architecture

```
Main Database:
├── users (all users)
├── seller_profiles (to be migrated)
├── products (admin products stay, seller products migrate)
├── orders (all orders)
├── order_items (all order items)
└── cart (all carts)

Seller Database:
├── seller_profiles (migrated from main)
└── products (seller products only)
```

### Query Patterns

**Customer Queries** (Main DB):
- Browse all products (queries both DBs and merges)
- View product details (checks both DBs)
- Create orders
- Manage cart

**Seller Queries** (Seller DB):
- View own products
- Create/update products
- View seller dashboard
- Manage inventory

## Verification Checklist

- [ ] Seller database tables created (`seller_profiles`, `products`)
- [ ] RLS policies enabled and configured
- [ ] Indexes created for performance
- [ ] Environment variables configured in `.env`
- [ ] Migration script run (if existing data)
- [ ] Both databases accessible from backend
- [ ] Test seller registration works
- [ ] Test product creation works
- [ ] Test product browsing works (queries both DBs)

## Performance Benchmarks

Run the verification script to check:

```bash
npm run verify:databases
```

Expected results:
- ✅ Both databases respond in < 100ms
- ✅ All required tables exist
- ✅ Schema compatibility verified
- ✅ Data counts match expectations

## Troubleshooting

### Issue: "Table does not exist" in seller database
**Solution**: Run the SQL schema creation script in seller database

### Issue: Slow queries
**Solution**: 
1. Check if indexes are created
2. Verify RLS policies aren't blocking queries unnecessarily
3. Use admin client for server-side operations

### Issue: Migration fails
**Solution**:
1. Verify both databases have correct credentials
2. Check table schemas match
3. Ensure service role keys are set

## Next Steps

1. **Create seller database tables** (if not done)
2. **Run migration** (if you have existing seller data)
3. **Test the application** thoroughly
4. **Monitor performance** using verification script
5. **Optimize indexes** based on query patterns

## Support

For issues:
1. Check `backend/migrations/README_MIGRATION.md` for migration help
2. Run `npm run verify:databases` for diagnostics
3. Check Supabase dashboard for table structures
4. Review error logs in backend console
