# Environment Variables Setup Guide

This guide will help you set up both `.env` files for the backend and frontend with dual database configuration.

## Quick Start

### Backend `.env` File

Create or update `backend/.env` with the following variables:

```env
# ===========================================
# Serendipity Backend Environment Variables
# ===========================================

# Server Configuration
PORT=5000
NODE_ENV=development

# ===========================================
# Main Supabase Database Configuration
# ===========================================
# Used for: Users, Orders, Cart, Admin Products

# Main Database URL
SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co

# Main Database Anon/Public Key (Safe for client-side)
SUPABASE_KEY=your_main_supabase_anon_key_here

# Main Database Service Role Key (Backend only - NEVER expose!)
SUPABASE_SERVICE_KEY=your_main_supabase_service_role_key_here

# ===========================================
# Seller Supabase Database Configuration
# ===========================================
# Used for: Seller Profiles, Seller Products, Seller-specific data

# Seller Database URL
SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co

# Seller Database Anon/Public Key
SELLER_SUPABASE_KEY=sb_publishable_ibPvVNwwUHm7xwr5DZP4-g_XUJqmcPb

# Seller Database Service Role Key (Backend only - NEVER expose!)
SELLER_SUPABASE_SERVICE_KEY=your_seller_supabase_service_role_key_here

# ===========================================
# Authentication
# ===========================================
# Optional: JWT Secret (if using custom JWT instead of Supabase Auth)
JWT_SECRET=your_jwt_secret_here

# ===========================================
# Payment Processing
# ===========================================

# Razorpay Configuration (Indian Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (International Payment Gateway)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

### Frontend `.env` File

Create or update `frontensd/apps/web/.env` with the following variables:

```env
# ===========================================
# Serendipity Frontend Environment Variables
# ===========================================

# Server Configuration
NODE_ENV=development

# ===========================================
# Main Supabase Database Configuration
# ===========================================
# Used for: User Authentication, Customer Data

# Main Database URL
VITE_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co

# Main Database Anon/Public Key
VITE_SUPABASE_ANON_KEY=your_main_supabase_anon_key_here

# ===========================================
# API Configuration
# ===========================================

# Backend API URL
VITE_API_URL=http://localhost:5000

# Socket.IO Server URL (for real-time features)
VITE_SOCKET_URL=http://localhost:5000

# ===========================================
# Authentication
# ===========================================

# Auth Secret (for session management)
AUTH_SECRET=your_auth_secret_here
```

## How to Get Your Credentials

### Main Database Credentials (Supabase login using Github)

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Main Project**: Click on your project (currently: `wosxyoivsiqzyufhcyhy`)
3. **Navigate to Settings**: Settings (gear icon) → API
4. **Copy Credentials**:
   - **Project URL** → Use for `SUPABASE_URL` (backend) and `VITE_SUPABASE_URL` (frontend)
   - **`anon` `public` key** → Use for `SUPABASE_KEY` (backend) and `VITE_SUPABASE_ANON_KEY` (frontend)
   - **`service_role` `secret` key** → Use for `SUPABASE_SERVICE_KEY` (backend only)

### Seller Database Credentials (Supabase login using userdefined2209@gmail.com)

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Seller Project**: Click on your seller project (currently: `kfyocccbvsanihtzrfmb`)
3. **Navigate to Settings**: Settings (gear icon) → API
4. **Copy Credentials**:
   - **Project URL** → Use for `SELLER_SUPABASE_URL` (backend only)
   - **`anon` `public` key** → Use for `SELLER_SUPABASE_KEY` (backend only)
   - **`service_role` `secret` key** → Use for `SELLER_SUPABASE_SERVICE_KEY` (backend only)

### Payment Gateway Credentials

#### Razorpay (Indian Payment Gateway)
1. Visit https://razorpay.com
2. Log in to your dashboard
3. Go to Settings → API Keys
4. Copy:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

#### Stripe (International Payment Gateway)
1. Visit https://stripe.com
2. Log in to your dashboard
3. Go to Developers → API Keys
4. Copy:
   - **Secret Key** → `STRIPE_SECRET_KEY`

## Verification Steps

After setting up your `.env` files:

### 1. Backend Verification

```bash
cd backend
npm start
```

**Look for these console logs:**
- ✅ `Supabase URL: https://wosxyoivsiqzyufhcyhy.supabase.co`
- ✅ `Supabase Key Loaded: true`
- ✅ `Supabase Service Key Loaded: true`
- ✅ `Seller Supabase URL: https://kfyocccbvsanihtzrfmb.supabase.co`
- ✅ `Seller Supabase Key Loaded: true`
- ✅ `Seller Supabase Service Key Loaded: true`
- ✅ `Server running on port 5000`

### 2. Frontend Verification

```bash
cd frontensd/apps/web
npm run dev
```

**Check the browser console:**
- ✅ No Supabase connection errors
- ✅ No missing environment variable warnings

## Common Issues

### Issue: "supabaseUrl is required"
**Solution**: Make sure `SUPABASE_URL` or `SELLER_SUPABASE_URL` is set in your `.env` file

### Issue: "supabaseKey is required"
**Solution**: Make sure `SUPABASE_KEY` or `SELLER_SUPABASE_KEY` is set in your `.env` file

### Issue: "Invalid API key"
**Solution**: 
- Double-check you copied the correct key from Supabase dashboard
- Make sure there are no extra spaces or newlines
- Verify you're using the correct key (anon key vs service role key)

### Issue: Seller database not working
**Solution**:
- Verify `SELLER_SUPABASE_URL`, `SELLER_SUPABASE_KEY`, and `SELLER_SUPABASE_SERVICE_KEY` are all set
- Check that the seller database has the same table structure as expected
- Ensure the service role key has proper permissions

## Security Best Practices

1. ✅ **DO**: Keep all `.env` files in `.gitignore`
2. ✅ **DO**: Use service role keys only in backend `.env`
3. ✅ **DO**: Use anon keys in frontend `.env`
4. ❌ **DON'T**: Commit `.env` files to Git
5. ❌ **DON'T**: Expose service role keys in frontend code
6. ❌ **DON'T**: Share your service role keys publicly
7. ❌ **DON'T**: Use the same keys in both frontend and backend (except anon key)

## Database Architecture

### Main Database
- **URL**: `SUPABASE_URL`
- **Used for**: Users, Orders, Cart, Admin Products
- **Access**: Both frontend (anon key) and backend (anon + service role)

### Seller Database
- **URL**: `SELLER_SUPABASE_URL`
- **Used for**: Seller Profiles, Seller Products
- **Access**: Backend only (anon + service role)

## Need Help?

If you encounter any issues:
1. Check the console logs for specific error messages
2. Verify all required environment variables are set
3. Ensure you copied the correct keys from Supabase dashboard
4. Check the `SUPABASE_SETUP.md` file for detailed database setup instructions
