# PLAN: Fix Cart Persistence & COD Order Failure

## Problem Statement
Two related issues reported:
1. **Cart empties after logout/re-login (Google)**: User adds product → logs out → logs back in via Google → cart is empty.
2. **COD order fails after re-adding product**: User re-adds product to cart → tries COD → gets 400 error.

---

## Root Cause Analysis

### Issue 1: Cart Empties After Logout → Re-Login

**Evidence Found:**

| File | Finding |
|------|---------|
| `useAuth.js:183` | `useCartStore.getState().clearCart()` — Logout explicitly wipes the Zustand cart state |
| `useAuth.js:186` | `localStorage.removeItem('cart-storage')` — Logout also nukes the localStorage backup |
| `cartStore.js:68-70` | Cart uses `zustand/persist` with `name: 'cart-storage'` (localStorage only) |
| `auth/callback/page.jsx` | After Google login redirect, there is **NO code** to restore cart from server |
| `cartRoutes.js` | Backend `/api/cart/sync` and `GET /api/cart` exist but are **never called** during login |

**Flow Diagram:**
```
Login → Add to Cart → localStorage['cart-storage'] = [{product}]
            ↓
Logout → clearCart() + localStorage.removeItem('cart-storage') 
            ↓
Re-Login (Google) → auth/callback → login(user, token) → navigate("/")
            ↓
Cart shows EMPTY ← localStorage['cart-storage'] was deleted, no server restore
```

**Root Cause:** Cart is stored ONLY in `localStorage`. Logout **explicitly deletes** it. Re-login does NOT restore it from the server (`saved_carts` table). The backend cart sync endpoint (`/api/cart/sync`) exists but is **never called** during login or logout.

---

### Issue 2: COD Order Fails (400 Error) After Re-Adding Product

**Most Likely Cause:** This is the same "Products not found" error from the previous fix. The product ID stored in cart doesn't exist in the main `products` table (it exists only in the seller database). The fix from Phase 4.1 (cross-database check) should resolve this if deployed.

**Alternative Cause:** If the `increment_stock` RPC function doesn't exist in Supabase, the stock deduction step (Step 2.5) would throw an error. However, this is caught as non-fatal, so it shouldn't cause a 400.

**To Verify:** Check Railway deployment logs after latest push to confirm the cross-database fix is active.

---

## Proposed Fix

### Phase 1: Sync Cart to Server Before Logout
**File:** `useAuth.js` → `signOut()`

Before clearing localStorage, save the current cart to the server:
```
signOut → sync cart to /api/cart/sync → THEN clearCart() → THEN redirect
```

This ensures the cart survives logout/login cycles.

### Phase 2: Restore Cart from Server After Login
**File:** `auth/callback/page.jsx`

After successful Google login:
```
login(user, token) → fetch /api/cart → merge into cartStore → navigate
```

Also apply to `signInWithCredentials` (email/password login) flow.

### Phase 3: Fix Cart Sync Field Mapping
**File:** `cartRoutes.js` + `cartStore.js`

The backend sync expects `{ product_id, title, price, image, quantity }`.
The frontend cartStore stores `{ product, name, price, image, qty }`.
**Field names don't match** — this will cause silent data loss during sync.

| Frontend (cartStore) | Backend (cartRoutes) | Match? |
|---|---|---|
| `product` | `product_id` | ❌ |
| `name` | `product_title` → `title` | ❌ |
| `qty` | `quantity` | ❌ |
| `price` | `price` | ✅ |
| `image` | `image_url` → `image` | ⚠️ (key rename) |

These mappings must be fixed in the sync call.

### Phase 4: Verify COD Order Works
- Confirm Railway has latest cross-database fix deployed
- Test full flow: Login → Add → Checkout → COD → Success

---

## Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `frontend/.../useAuth.js` | Add cart server-sync before logout AND cart restore after login |
| 2 | `frontend/.../auth/callback/page.jsx` | Add cart restore from server after Google login |
| 3 | `frontend/.../cartStore.js` | Add `syncToServer()` and `restoreFromServer()` actions |
| 4 | `backend/routes/cartRoutes.js` | Switch to `supabaseAdmin` to bypass RLS on `saved_carts` |

---

## Verification Checklist
- [ ] Login with Google → Add product to cart → Logout → Re-login with Google → **Cart should still have the product**
- [ ] Place COD order → **Should succeed (200)**
- [ ] Add 2 items → Logout → Login → **Both items present**
- [ ] Clear cart manually → Logout → Login → **Cart empty (correct behavior)**
