# Fix: Order Creation 500 Internal Server Error

## Problem

`POST https://serendipity-backend.up.railway.app/api/orders` returns **500 Internal Server Error** when placing a Cash on Delivery order.

## Root Cause Analysis

The backend `orderRoutes.js` inserts into the `orders` table with **all** of these columns:

| Column | Source |
|--------|--------|
| `user_id` | Original table |
| `order_number` | Original table |
| `total_amount` | Original table |
| `stripe_session_id` | Original table |
| `payment_status` | Original table |
| `shipping_name` | Original table |
| `shipping_address` | Original table |
| `shipping_city` | Original table |
| `shipping_state` | Original table |
| `shipping_zip` | Original table |
| `shipping_country` | Original table |
| `is_paid` | Original table |
| `is_delivered` | Original table |
| **`status`** | ⚠️ Added by migration |
| **`payment_method`** | ⚠️ Added by migration |
| **`status_history`** | ⚠️ Added by migration |

If **any** of these columns are missing in the deployed Supabase `orders` table, Supabase returns a 500 error.

The migration file `backend/migrations/add_order_status_columns.sql` adds 6 columns:
- `status`, `payment_method`, `status_history`, `cancelled_at`, `cancellation_reason`, `shipped_at`

> [!CAUTION]
> **This migration must be run manually** in the Supabase SQL Editor. If you haven't done this yet, that is the cause of the 500 error.

## Fix: Step-by-Step

### Step 1: Run the Migration SQL

Go to your **main Supabase project** → SQL Editor → paste and run:

```sql
-- Add missing columns to orders table for order lifecycle support
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD',
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
```

### Step 2: Verify ALL Required Columns Exist

After running the migration, verify the full schema by running:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;
```

**Expected columns** (minimum required for order creation):

| Column | Type | Required |
|--------|------|----------|
| `id` | uuid | ✅ |
| `user_id` | uuid | ✅ |
| `order_number` | text | ✅ |
| `total_amount` | numeric | ✅ |
| `stripe_session_id` | text | ❌ nullable |
| `payment_status` | text | ✅ |
| `shipping_name` | text | ✅ |
| `shipping_address` | text | ✅ |
| `shipping_city` | text | ✅ |
| `shipping_state` | text | ❌ nullable |
| `shipping_zip` | text | ✅ |
| `shipping_country` | text | ✅ |
| `is_paid` | boolean | ✅ |
| `is_delivered` | boolean | ✅ |
| `status` | text | ✅ (from migration) |
| `payment_method` | text | ✅ (from migration) |
| `status_history` | jsonb | ✅ (from migration) |
| `cancelled_at` | timestamptz | ❌ nullable |
| `cancellation_reason` | text | ❌ nullable |
| `shipped_at` | timestamptz | ❌ nullable |
| `created_at` | timestamptz | ✅ |

> [!IMPORTANT]
> If ANY column in the "Required" list is missing, run the appropriate `ALTER TABLE` to add it.

### Step 3: Verify `order_items` Table Exists

The order creation also inserts into `order_items`. Verify this table exists:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_items'
ORDER BY ordinal_position;
```

**Expected columns:**

| Column | Type |
|--------|------|
| `id` | uuid |
| `order_id` | uuid (FK → orders.id) |
| `product_id` | uuid |
| `product_title` | text |
| `price` | numeric |
| `quantity` | integer |
| `image_url` | text |

If this table doesn't exist, create it:

```sql
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_title TEXT,
  price NUMERIC DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can insert
CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: users can read their own order items
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
```

### Step 4: Check RLS Policies

Row Level Security might block inserts. Run this to check:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';
```

If there's no INSERT policy, add one:

```sql
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### Step 5: Test

After completing the above steps, try placing a COD order again. It should now succeed.

## Verification Plan

1. Run migration SQL in Supabase SQL Editor
2. Verify columns exist with the schema query
3. Check RLS policies allow INSERT
4. Place a test COD order on the deployed site
5. Verify order appears in the database

## No Code Changes Required

The backend code (`orderRoutes.js`) and frontend code (`shipping/page.jsx`) are correct. This is purely a **database schema issue** on the deployed Supabase instance.
