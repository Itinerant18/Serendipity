# Fix: Order Creation 500 — Schema Mismatch

## Problem

`POST /api/orders` returns **500 Internal Server Error**. The backend code inserts columns that **don't exist** in the Supabase `orders` and `order_items` tables.

## Root Cause (Verified via Supabase SQL Query)

### `orders` Table — Schema Mismatch

| Code Inserts (WRONG) | Actual DB Column | Issue |
|---|---|---|
| `order_number` | ❌ MISSING | Column doesn't exist |
| `total_amount` | `total_price` | **NAME MISMATCH** |
| `stripe_session_id` | ❌ MISSING | Column doesn't exist |
| `payment_status` | ❌ MISSING | Column doesn't exist |
| `shipping_name` | ❌ MISSING | Column doesn't exist |
| `shipping_address` (text) | `shipping_address` (JSONB) | **TYPE MISMATCH** — code sends string, DB expects JSON |
| `shipping_city` | ❌ MISSING | Column doesn't exist |
| `shipping_state` | ❌ MISSING | Column doesn't exist |
| `shipping_zip` | ❌ MISSING | Column doesn't exist |
| `shipping_country` | ❌ MISSING | Column doesn't exist |

**Columns that DO match:** `user_id`, `is_paid`, `is_delivered`, `status`, `payment_method`, `status_history` ✅

### `order_items` Table — Schema Mismatch

| Code Inserts (WRONG) | Actual DB Column | Issue |
|---|---|---|
| `product_title` | `name` | **NAME MISMATCH** |
| `quantity` | `qty` | **NAME MISMATCH** |
| `image_url` | `image` | **NAME MISMATCH** |

**Columns that DO match:** `order_id`, `product_id`, `price` ✅

### RLS Policies — ✅ OK

- `orders`: INSERT policy exists (`auth.uid() = user_id`)
- `order_items`: INSERT policy exists (validates order ownership)
- No UPDATE policy exists ⚠️ (needed for cancel/status updates — separate fix)

---

## Fix Strategy

**Hybrid approach:** Add missing columns to DB + Fix code to use correct names for existing columns.

### Phase 1: Database — Add Missing Columns

```sql
-- Add columns the code needs that are genuinely NEW
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add UPDATE policy for order cancellation / seller status updates
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for orphan order cleanup
CREATE POLICY "Users can delete own orders" ON public.orders
  FOR DELETE TO public
  USING (auth.uid() = user_id);

-- Add UPDATE policy for order_items (for future needs)
CREATE POLICY "Users can update own order items" ON public.order_items
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
```

### Phase 2: Backend Code — Fix Column Names

#### [MODIFY] `backend/routes/orderRoutes.js`

**Order insert:** Use `shipping_address` as JSONB (the DB type), remove individual shipping columns:

```javascript
// BEFORE (broken):
{
  shipping_name: shipping?.name,
  shipping_address: shipping?.address,    // TEXT — DB expects JSONB!
  shipping_city: shipping?.city,
  shipping_zip: shipping?.zip,
  ...
}

// AFTER (fixed):
{
  order_number: orderNumber,
  total_amount: parseFloat(totalPrice) || 0,
  total_price: parseFloat(totalPrice) || 0,  // Keep both for compat
  shipping_address: {                        // JSONB object
    name: shipping?.name || '',
    address: shipping?.address || '',
    city: shipping?.city || '',
    state: shipping?.state || '',
    zip: shipping?.zip || '',
    country: shipping?.country || 'IN',
    phone: shipping?.phone || ''
  },
  ...
}
```

**Order items insert:** Use correct DB column names:

```javascript
// BEFORE (broken):
{ product_title: item.title, quantity: item.quantity, image_url: item.image }

// AFTER (fixed):
{ name: item.title || item.name, qty: parseInt(item.quantity || item.qty || 1), image: item.image || item.image_url }
```

#### Files to Modify

| File | Changes |
|------|---------|
| `backend/routes/orderRoutes.js` | Fix all insert/select column names for orders + order_items |
| `backend/routes/sellerRoutes.js` | Fix seller order queries to use correct column names |

### Phase 3: Verification

1. Run Phase 1 SQL in Supabase SQL Editor
2. Deploy updated code
3. Test COD order placement
4. Verify order appears in database
5. Verify seller dashboard shows the order
