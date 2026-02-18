# PLAN: Fix "Products Not Found" Error During Checkout

## Context
The user is encountering a `400 Bad Request` error when attempting to place an order.
**Error Message**: `Products not found: 46c21362-d291-47f7-bad1-c2c95c8872c7`.
**User Scenario**: "i try to order a product from a customar profile that was added in seller account by one of my other seller account".

## Goal
Resolve the `400 Bad Request` error by ensuring product consistency between the Seller Dashboard, Database, and Customer Cart.

## Initial Analysis
- **Root Cause**: The backend `createOrder` function queries the `products` table for the ID `46c21362...`. It returns **no result**.
- **Implication**: The product ID exists in the user's cart (frontend) but does NOT exist in the backend database.
- **Why?**:
    1.  **Product Creation Failed**: The product was "added" in the Seller UI but the database insertion failed silently (e.g., RLS, validation error).
    2.  **Product Deleted**: The product was added, then deleted (or soft-deleted), but the cart still references it.
    3.  **Environment Mismatch**: User added product in Local Dev but is trying to buy on Production (Railway).
    4.  **Database Reset**: The database was reset, wiping the product, but the cart persisted in local storage.

## Phase 1: Investigation & Verification
- [ ] **Verify Database State**: Check if product `46c21362...` exists in `public.products` on the Railway database.
- [ ] **Check Product Status**: If it exists, check its `status` (draft, active, archived) and `is_deleted` flag.
- [ ] **Verify Creation Flow**: 
    -   Log in as Seller.
    -   Create a new product.
    -   Check network tab for success response.
    -   Check database immediately.
- [ ] **Check RLS Policies**: Ensure `products` table RLS allows `INSERT` for authenticated sellers.

## Phase 2: Fix Implementation
- [x] **Backend Fix**: Modified orderRoutes.js to check BOTH main database AND seller database for product validation
- [x] **Frontend (Cart Cleanup)**:
    -   If `createOrder` returns `Products not found`, the frontend now:
        1.  Parses the missing IDs from the error message.
        2.  **Automatically removes** these invalid items from the cart.
        3.  Shows a toast: "Some items in your cart are no longer available and have been removed."
        4.  Refreshes the cart UI.

## Phase 3: Verification
- [ ] **User Test**:
    1.  Clear Cart.
    2.  Add a *freshly created* product.
    3.  Checkout.
    4.  Verify success (200 OK).

## Immediate Workaround for User
1.  **Clear your Cart**: The item in your cart is likely stale or invalid.
2.  **Re-add the Product**: Go to the store page and add the product again.
3.  **Check Seller Dashboard**: Confirm the product actually exists in the "My Products" list and has a valid ID.
