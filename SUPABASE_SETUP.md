# Supabase Setup Guide

This document explains the Supabase credentials required for the Amazon Clone application.

## Required Credentials

### 1. Supabase URL
- **Location**: Supabase Dashboard → Project Settings → API → Project URL
- **Format**: `https://YOUR_PROJECT_REF.supabase.co`
- **Used in**:
  - Backend: `SUPABASE_URL`
  - Frontend: `VITE_SUPABASE_URL`

### 2. Supabase Anon/Public Key
- **Location**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- **Format**: Long JWT token
- **Security**: Safe to use in client-side code (respects Row Level Security policies)
- **Used in**:
  - Backend: `SUPABASE_KEY`
  - Frontend: `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_KEY`

### 3. Supabase Service Role Key
- **Location**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- **Format**: Long JWT token
- **Security**: ⚠️ **NEVER** expose this in client-side code - it bypasses all Row Level Security!
- **Used in**: Backend only (`SUPABASE_SERVICE_KEY`)
- **Purpose**: Admin operations that need to bypass RLS policies

## Current Configuration

### Backend (`c:\amazon-clone\backend\.env`)
```
SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### Frontend (`c:\amazon-clone\frontensd\apps\web\.env`)
```
VITE_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
```

## How to Get Your Credentials

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Project**: Click on your project (currently: `wosxyoivsiqzyufhcyhy`)
3. **Navigate to Settings**: Settings (gear icon) → API
4. **Copy Credentials**:
   - Project URL → Copy to `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public` key → Copy to `SUPABASE_KEY` and `VITE_SUPABASE_KEY`
   - `service_role secret` key → Copy to `SUPABASE_SERVICE_KEY` (backend only)

## Architecture

### Backend Usage
The backend initializes two Supabase clients:

1. **Regular Client** (`supabase`): Uses the anon key, respects RLS policies
2. **Admin Client** (`supabaseAdmin`): Uses the service role key, bypasses RLS

Location: `c:\amazon-clone\backend\config\supabase.js`

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
