# Quick Environment Setup

## Backend `.env` File Location: `backend/.env`

Copy and paste this into your `backend/.env` file, then replace the placeholder values:

```env
PORT=5000
NODE_ENV=development

# Main Database
SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
SUPABASE_KEY=your_main_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_main_supabase_service_role_key_here

# Seller Database
# ✅ Credentials fetched from Supabase Dashboard (via MCP)
SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co
SELLER_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeW9jY2NidnNhbmlodHpyZm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTEwNzUsImV4cCI6MjA4NDM2NzA3NX0.NQ7xT08Y4U_qVojZb2160um2f61eQJ6DPDayRSihyt4
SELLER_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeW9jY2NidnNhbmlodHpyZm1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5MTA3NSwiZXhwIjoyMDg0MzY3MDc1fQ.wJtxuemittXeATYmup6Ft5ZejxAU5SU8Mwlkvg7hbpU

# Optional
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Frontend `.env` File Location: `frontend/apps/web/.env`

Copy and paste this into your `frontend/apps/web/.env` file, then replace the placeholder values:

```env
NODE_ENV=development

VITE_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
VITE_SUPABASE_ANON_KEY=your_main_supabase_anon_key_here

VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

AUTH_SECRET=your_auth_secret_here
```

## Where to Get Your Keys

### Main Database (wosxyoivsiqzyufhcyhy)
1. Visit: https://supabase.com/dashboard
2. Select project: `wosxyoivsiqzyufhcyhy`
3. Go to: Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL` (backend) / `VITE_SUPABASE_URL` (frontend)
   - `anon public` key → `SUPABASE_KEY` (backend) / `VITE_SUPABASE_ANON_KEY` (frontend)
   - `service_role secret` key → `SUPABASE_SERVICE_KEY` (backend only)

### Seller Database (kfyocccbvsanihtzrfmb)
1. Visit: https://supabase.com/dashboard
2. Select project: `kfyocccbvsanihtzrfmb`
3. Go to: Settings → API
4. Copy:
   - Project URL → `SELLER_SUPABASE_URL` (backend only)
   - `anon public` key → `SELLER_SUPABASE_KEY` (backend only)
   - `service_role secret` key → `SELLER_SUPABASE_SERVICE_KEY` (backend only)

## ⚠️ Critical: Seller Database Credentials

**You MUST get all seller database credentials from your Supabase Dashboard!**

### How to Get Seller Database Credentials:

1. **Visit**: https://supabase.com/dashboard/project/kfyocccbvsanihtzrfmb/settings/api

2. **Copy the following**:
   - **Project URL** → Use for `SELLER_SUPABASE_URL`
   - **`anon` `public` key** → Use for `SELLER_SUPABASE_KEY` 
     - ⚠️ This is NOT the same as the publishable key (`sb_publishable_...`)
     - The anon key starts with `eyJ...` (it's a JWT token)
   - **`service_role` `secret` key** → Use for `SELLER_SUPABASE_SERVICE_KEY`
     - ⚠️ This is a long JWT token starting with `eyJ...`
     - Click "Reveal" to see the full key
     - Keep this secret - never expose it publicly!

3. **Paste the values** into your `backend/.env` file

**Note**: The publishable key (`sb_publishable_ibPvVNwwUHm7xwr5DZP4-g_XUJqmcPb`) is NOT the same as the anon key. You need the actual `anon public` key from the API settings page.

## Verification

After setting up, run:

```bash
# Backend
cd backend
npm start
# Look for: "Seller Supabase Service Key Loaded: true"

# Frontend
cd frontend/apps/web
npm run dev
# Check browser console for errors
```

For detailed setup instructions, see [`ENV_SETUP.md`](ENV_SETUP.md)
