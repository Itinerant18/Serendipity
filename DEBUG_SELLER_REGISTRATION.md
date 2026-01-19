# Debug Seller Registration 400 Error

## Common Causes of 400 Bad Request

When registering as a seller, a 400 error can occur for these reasons:

### 1. **Store Name Missing or Invalid**
- **Error**: `"Store name is required"` or `"Store name must be at least 2 characters"`
- **Cause**: The `store_name` field is missing, empty, or too short
- **Fix**: Ensure you fill in the store name field (minimum 2 characters)

### 2. **Already Registered as Seller**
- **Error**: `"You are already registered as a seller"`
- **Cause**: Your user account already has a seller profile
- **Fix**: Check if you already have a seller account, or use a different user account

### 3. **Store Name Already Taken**
- **Error**: `"Store name already taken"`
- **Cause**: Another seller is already using that store name
- **Fix**: Choose a different, unique store name

## How to Debug

### Step 1: Check Backend Terminal Logs

When you try to register, check your backend server terminal. You should see:

```
=== Seller Registration Request ===
User ID: <your-user-id>
Request Body: { store_name: "...", ... }
Checking if user is already a seller...
Checking if store name exists...
Creating seller profile...
```

Look for any error messages or validation failures.

### Step 2: Check Browser Console

Open browser DevTools (F12) and check the Console tab. You should see:

```javascript
Sending seller registration request: {
  endpoint: "http://localhost:5000/api/seller/register",
  payload: { ... },
  isAuth: true,
  hasToken: true
}
```

And if there's an error:
```javascript
Registration error: {
  status: 400,
  message: "...",
  data: { ... }
}
```

### Step 3: Verify Form Data

Make sure you've filled in:
- ✅ **Store Name** (required, minimum 2 characters)
- ✅ **Description** (optional but recommended)
- ✅ You're logged in with Google (has valid token)

### Step 4: Check if Already a Seller

If you think you might already be registered:

1. Check your user profile in the main database
2. Look for `is_seller: true` or `seller_profile_id` field
3. If found, you're already registered

## Quick Fixes

### Fix 1: Ensure Store Name is Filled

```javascript
// In the form, make sure storeName is not empty
storeName.trim().length >= 2  // Minimum 2 characters
```

### Fix 2: Check Authentication Token

Make sure you're properly authenticated:
- Token exists in localStorage/session
- Token is valid and not expired
- Token is being sent in Authorization header

### Fix 3: Clear and Retry

1. Clear browser cache/localStorage
2. Log out and log back in with Google
3. Try registration again

## Still Having Issues?

Share these details:

1. **Backend terminal output** (the full log from registration attempt)
2. **Browser console output** (any errors or logs)
3. **The exact error message** you see in the UI
4. **Whether you've registered before** with this account

This will help identify the exact cause of the 400 error.
