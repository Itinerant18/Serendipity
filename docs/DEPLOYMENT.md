# Deployment Guide - Backend on Render

Deploy the Serendipity backend to Render using GitHub integration and Docker.

## Architecture

```
GitHub Repo
    |
    +--> Render Web Service (backend/Dockerfile)
            |
            +--> Supabase (main + seller DB)
            +--> Optional Redis
```

## Option A (Recommended): Blueprint via render.yaml

1. Push repository changes to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select this repository and branch.
4. Render will detect `render.yaml` in repository root and propose a `serendipity-backend` service.
5. Add secret values for all environment variables marked `sync: false`.
6. Create the service.

## Option B: Manual Service Setup

1. In Render, click **New +** -> **Web Service**.
2. Connect the repository.
3. Configure:
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: Enabled

## Required Environment Variables

Set these in Render Dashboard -> Environment:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CORS_ORIGINS` | Frontend domain(s), comma-separated |
| `SUPABASE_URL` | Main Supabase URL |
| `SUPABASE_KEY` | Main anon/public key |
| `SUPABASE_SERVICE_KEY` | Main service role key |
| `SELLER_SUPABASE_URL` | Seller Supabase URL |
| `SELLER_SUPABASE_KEY` | Seller anon/public key |
| `SELLER_SUPABASE_SERVICE_KEY` | Seller service role key |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `REDIS_URL` | Optional external Redis URL |

Notes:
- Keep secrets only in Render, never in repository.
- If hosting frontend elsewhere, include that exact domain in `CORS_ORIGINS`.
- Multiple origins must be comma-separated with no spaces.

## Cutover Checklist (Railway -> Render)

1. Deploy backend to Render and wait for **Live** status.
2. Verify health endpoint:

```bash
curl https://your-render-backend.onrender.com/api/health
```

3. Update frontend environment values:
   - `VITE_API_URL=https://your-render-backend.onrender.com`
   - `VITE_SOCKET_URL=https://your-render-backend.onrender.com`
4. Update `CORS_ORIGINS` in Render to include your production frontend domain.
5. Run a smoke test:
   - Auth login/signup
   - Product listing
   - Cart and checkout flow
   - Seller endpoints (if enabled)
6. Keep Railway backend running during validation window.
7. After successful validation, disable Railway backend service.

## Verification

Expected health response:

```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "serendipity-backend"
}
```

## Auto-Deploy

Render redeploys automatically on push to the connected branch.

## Custom Domain (Optional)

1. Render Dashboard -> Service -> Settings -> Custom Domains
2. Add domain
3. Configure DNS records per Render instructions
