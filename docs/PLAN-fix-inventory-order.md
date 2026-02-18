# Plan: Fix Inventory Order Issue

## 1. Goal
Resolve the issue preventing users from placing orders for products that are currently in inventory. Ensure that strictly "in-stock" items can be purchased, while correctly handling edge cases like self-purchasing (sellers buying their own items) and concurrent stock updates.

## 2. Problem Analysis
User reports: "i csn not sblr to plase order that was in some once's inventry"
Interpretation: User is unable to purchase an item that appears to be available in a seller's inventory.

### Potential Causes
1.  **Self-Purchase restriction**: Is the user trying to buy their own product?
2.  **Stock Synchronization**: Is `count_in_stock` actually > 0 in the DB, or just in the UI?
3.  **RLS Blocking Stock Check**: Does the backend have permission to read/update the product's stock?
4.  **Implicit Stock Deduction**: Is there a database trigger that prevents the order if stock is low, which is failing silently or with a generic error?
5.  **Missing Logic**: Does the backend fail to decrement stock, or decrement it incorrectly?

## 3. Investigation Strategy
- [ ] **Clarify w/ User**: Get specific error message and scenario (Self-purchase? Specific product?).
- [ ] **Code Review**: Check `createOrder` in `backend/routes/orderRoutes.js` for stock deduction logic. (Preliminary check suggests it might be MISSING or handled via triggers).
- [ ] **Database Review**: Check for Postgres triggers on `orders` or `order_items` that might enforce stock limits.
- [ ] **Manual Test**: Attempt to buy a product with `count_in_stock = 1` and `count_in_stock = 0`.

## 4. Proposed Solution (TBD)
Depending on findings:
-   **If Stock Logic Missing**: Implement atomic stock decrement in `createOrder` (using `rpc` or `update`).
-   **If RLS Issue**: Use `supabaseAdmin` for the stock check/update (already using it for creation, need to verify if stock update matches).
-   **If Self-Purchase**: Decide if we should allow or block (and provide clear error).

## 5. Verification Checklist
-   [ ] Verify self-purchase scenario (allowed/disallowed?)
-   [ ] Verify strict stock check (order fails if stock is 0 but item is in cart)
-   [ ] Verify stock is decremented after successful order.
-   [ ] Verify stock is incremented after cancellation (already implemented).
