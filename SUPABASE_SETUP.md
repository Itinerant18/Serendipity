# Supabase Setup Guide

This document explains the Supabase credentials required for the Amazon Clone application.

## Dual Database Architecture

This application uses **two separate Supabase databases**:

1. **Main Database**: For customer data, orders, cart, and general application data
2. **Seller Database**: For seller profiles, seller-specific data, and seller operations

This separation provides better data isolation, security, and scalability.

## Required Credentials

### Main Database

#### 1. Main Supabase URL
- **Location**: Supabase Dashboard → Project Settings → API → Project URL
- **Format**: `https://YOUR_PROJECT_REF.supabase.co`
- **Used in**:
  - Backend: `SUPABASE_URL`
  - Frontend: `VITE_SUPABASE_URL`

#### 2. Main Supabase Anon/Public Key
- **Location**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- **Format**: Long JWT token
- **Security**: Safe to use in client-side code (respects Row Level Security policies)
- **Used in**:
  - Backend: `SUPABASE_KEY`
  - Frontend: `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_KEY`

#### 3. Main Supabase Service Role Key
- **Location**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- **Format**: Long JWT token
- **Security**: ⚠️ **NEVER** expose this in client-side code - it bypasses all Row Level Security!
- **Used in**: Backend only (`SUPABASE_SERVICE_KEY`)
- **Purpose**: Admin operations that need to bypass RLS policies

### Seller Database

#### 4. Seller Supabase URL
- **Location**: Seller Supabase Dashboard → Project Settings → API → Project URL
- **Format**: `https://YOUR_SELLER_PROJECT_REF.supabase.co`
- **Used in**: Backend only (`SELLER_SUPABASE_URL`)
- **Current**: `https://kfyocccbvsanihtzrfmb.supabase.co`

#### 5. Seller Supabase Anon/Public Key
- **Location**: Seller Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- **Format**: Long JWT token (or publishable key)
- **Used in**: Backend only (`SELLER_SUPABASE_KEY`)
- **Current**: `sb_publishable_ibPvVNwwUHm7xwr5DZP4-g_XUJqmcPb`

#### 6. Seller Supabase Service Role Key
- **Location**: Seller Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- **Format**: Long JWT token
- **Security**: ⚠️ **NEVER** expose this in client-side code!
- **Used in**: Backend only (`SELLER_SUPABASE_SERVICE_KEY`)
- **Purpose**: Admin operations on seller database that need to bypass RLS

## Current Configuration

### Backend (`.env`)
```env
# Main Database
SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Seller Database
SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co
SELLER_SUPABASE_KEY=sb_publishable_ibPvVNwwUHm7xwr5DZP4-g_XUJqmcPb
SELLER_SUPABASE_SERVICE_KEY=your_seller_service_role_key_here
```

### Frontend (`.env`)
```
VITE_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
```

## How to Get Your Credentials

### Main Database

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Main Project**: Click on your project (currently: `wosxyoivsiqzyufhcyhy`)
3. **Navigate to Settings**: Settings (gear icon) → API
4. **Copy Credentials**:
   - Project URL → Copy to `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public` key → Copy to `SUPABASE_KEY` and `VITE_SUPABASE_KEY`
   - `service_role secret` key → Copy to `SUPABASE_SERVICE_KEY` (backend only)

### Seller Database

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Seller Project**: Click on your seller project (currently: `kfyocccbvsanihtzrfmb`)
3. **Navigate to Settings**: Settings (gear icon) → API
4. **Copy Credentials**:
   - Project URL → Copy to `SELLER_SUPABASE_URL`
   - `anon public` key (or publishable key) → Copy to `SELLER_SUPABASE_KEY`
   - `service_role secret` key → Copy to `SELLER_SUPABASE_SERVICE_KEY` (backend only)

## Architecture

### Backend Usage

#### Main Database Clients
Location: `backend/config/supabase.js`

1. **Regular Client** (`supabase`): Uses the anon key, respects RLS policies
2. **Admin Client** (`supabaseAdmin`): Uses the service role key, bypasses RLS

**Used for:**
- User/customer data (`users` table)
- Orders (`orders`, `order_items` tables)
- Cart (`cart` table)
- Admin-created products (`products` table - products created by admins)
- Customer-facing features

#### Seller Database Clients
Location: `backend/config/supabaseSeller.js`

1. **Regular Client** (`supabaseSeller`): Uses the seller anon key, respects RLS policies
2. **Admin Client** (`supabaseSellerAdmin`): Uses the seller service role key, bypasses RLS

**Used for:**
- Seller profiles (`seller_profiles` table)
- Seller products (`products` table - products created by sellers)
- Seller-specific data
- All seller-related operations

### Database Separation

- **Main Database**: Handles customer-facing operations, orders, and general app data
- **Seller Database**: Handles all seller-related data and operations
- **User Authentication**: Uses main database (users authenticate in main DB, but seller data is stored in seller DB)

### Frontend Usage
The frontend should initialize a Supabase client using:
- URL: `import.meta.env.VITE_SUPABASE_URL`
- Key: `import.meta.env.VITE_SUPABASE_KEY`

**Note**: The frontend should NEVER use the service role key.

## Additional Environment Variables

### Backend
- `JWT_SECRET`: Optional, can be removed if fully using Supabase Auth
- `STRIPE_SECRET_KEY`: For payment processing
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For Indian payment processing
- `SELLER_SUPABASE_URL`: Seller database URL (required)
- `SELLER_SUPABASE_KEY`: Seller database anon/publishable key (required)
- `SELLER_SUPABASE_SERVICE_KEY`: Seller database service role key (required for admin operations)

### Frontend
- `AUTH_SECRET`: For session management

## Security Best Practices

1. ✅ **DO**: Use the anon key in client-side code
2. ✅ **DO**: Use Row Level Security (RLS) policies in Supabase
3. ✅ **DO**: Keep the service role key in backend `.env` only
4. ❌ **DON'T**: Commit `.env` files to Git
5. ❌ **DON'T**: Expose the service role key in frontend code
6. ❌ **DON'T**: Share your service role key publicly

## Verification

To verify your Supabase setup:

1. **Backend**: Run `npm start` and check for console logs showing Supabase URL and key status
2. **Frontend**: Check if the Supabase client initializes without errors
3. **Test Connection**: Try a simple query to verify database access

## Troubleshooting

### "supabaseUrl is required"
- Make sure your `.env` file exists and has `SUPABASE_URL` set

### "supabaseKey is required"
- Verify `SUPABASE_KEY` is set in your `.env` file

### "Invalid API key"
- Double-check you copied the correct key from the Supabase dashboard
- Make sure there are no extra spaces or newlines

### RLS Errors
- If you get permission errors, check your Row Level Security policies in Supabase
- Use `supabaseAdmin` in backend for operations that need to bypass RLS
