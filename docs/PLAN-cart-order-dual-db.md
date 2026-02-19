# PLAN: Cart + Order Flow for Dual-Database Architecture

## Architecture Overview

```
┌─────────────────────────┐       ┌──────────────────────────┐
│      MAIN DATABASE      │       │     SELLER DATABASE      │
│  (SUPABASE_URL)         │       │  (SELLER_SUPABASE_URL)   │
├─────────────────────────┤       ├──────────────────────────┤
│  users                  │       │  products  ← ALL PRODUCTS│
│  orders                 │       │  seller_profiles         │
│  order_items            │       │                          │
│  saved_carts            │       │                          │
│  reviews                │       │                          │
│  (NO products here)     │       │                          │
└─────────────────────────┘       └──────────────────────────┘
```

> **Key Insight:** ALL products exist ONLY in the Seller DB. The Main DB has orders, users, reviews, and saved_carts — but no products.

---

## Issues Found (3 Critical + 1 Medium)

### 🔴 CRITICAL 1: `order_items.product_id` Foreign Key Violation
- **File:** `orderRoutes.js:162`
- **Problem:** `order_items` is inserted into **Main DB** with a `product_id` that only exists in the **Seller DB**.
- **Impact:** If `order_items` has a FK constraint `product_id → products.id` on Main DB, every order will fail with `23503 FK violation` because there are no products in Main DB.
- **Fix:** Either (a) remove the FK constraint from `order_items`, or (b) always ensure product_id references are stored without FK enforcement.

### 🔴 CRITICAL 2: Stock Deduction Targets Wrong Database
- **File:** `orderRoutes.js:187`
- **Problem:** Stock deduction calls `supabaseAdmin.rpc('increment_stock', ...)` — this runs on the **Main DB** where no products exist.
- **Impact:** Stock is never actually decremented. Products show infinite stock.
- **Fix:** Run stock deduction against **Seller DB** (`supabaseSellerAdmin`).

### 🔴 CRITICAL 3: Cart Persistence - `saved_carts` Schema Issue
- **File:** `cartRoutes.js`
- **Problem:** `saved_carts` is in **Main DB**. It stores seller DB product IDs.
- **Potential Issue:** If `saved_carts` has a FK constraint `product_id → products.id`, the sync will fail because products don't exist in Main DB.
- **Fix:** Verify FK constraints and remove if present.

### 🟡 MEDIUM: Cart Restore Field Mapping (Already Fixed)
- Cart persistence was already fixed in previous commit (sync before logout, restore after login).
- But it will only work if `saved_carts` has no FK constraint on `product_id`.

---

## Proposed Fixes

### Phase 1: Remove/Verify FK Constraints (Database Level)
**Action:** Check if `order_items.product_id` and `saved_carts.product_id` have FK constraints to `products` table in Main DB.
- If yes → Drop those constraints via SQL migration
- These product IDs reference the Seller DB, not Main DB

### Phase 2: Fix Stock Deduction to Target Seller DB
**File:** `orderRoutes.js` (lines ~182-198)

```diff
- return supabaseAdmin.rpc('increment_stock', {
+ return sellerClient.rpc('increment_stock', {
    p_product_id: pid,
    p_amount: -qty
  });
```

Also need to verify `increment_stock` RPC function exists in the Seller DB. If not, either:
- Create it in Seller DB, OR
- Use a direct UPDATE query instead

### Phase 3: Verify Cart Persistence Works End-to-End
1. **Email/Password Login** → Add to cart → Logout → Re-login → Cart restored ✓
2. **Google Login** → Add to cart → Logout → Re-login (Google) → Cart restored ✓
3. **Place COD order** → Should succeed without FK violations ✓

---

## Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | SQL Migration | Drop FK constraint on `order_items.product_id` and `saved_carts.product_id` (if they exist) |
| 2 | `orderRoutes.js` | Fix stock deduction to use `sellerClient` instead of `supabaseAdmin` |
| 3 | Seller DB | Verify `increment_stock` RPC exists, create if missing |

---

## Verification Checklist
- [ ] No FK constraint errors on order creation
- [ ] Stock decrements correctly in Seller DB
- [ ] Cart syncs to `saved_carts` before logout
- [ ] Cart restores from `saved_carts` after login (both email and Google)
- [ ] Full flow: Login → Add seller product → Checkout COD → Order created → Stock decremented
