# Deployment Guide - Railway via GitHub

Deploy the Serendipity application to Railway using GitHub integration.

## Architecture

```
GitHub Repo
    │
    ├─► Railway Backend  ──► Supabase
    │   (Express + Bun)
    │
    └─► Railway Frontend ──► Backend API
        (React Router SSR)
```

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

---

## Step 2: Deploy Backend

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository
4. Configure:
   - **Root Directory**: `backend`
   - Railway auto-detects `railway.toml`

5. **Add Environment Variables** (Settings → Variables):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CORS_ORIGINS` | `https://your-frontend.up.railway.app` |
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_KEY` | Your anon key |
| `SUPABASE_SERVICE_KEY` | Your service key |
| `SELLER_SUPABASE_URL` | Seller DB URL |
| `SELLER_SUPABASE_KEY` | Seller anon key |
| `SELLER_SUPABASE_SERVICE_KEY` | Seller service key |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `REDIS_URL` | (Optional) Redis URL |

1. Click **Deploy** → Note the generated URL (e.g., `backend-xxx.up.railway.app`)

---

## Step 3: Deploy Frontend

1. In the same Railway project, click **+ New Service**
2. Select **Deploy from GitHub repo** (same repo)
3. Configure:
   - **Root Directory**: `frontend/apps/web`
   - Railway auto-detects `railway.toml`

4. **Add Environment Variables**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `VITE_API_URL` | `https://your-backend.up.railway.app` |
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `VITE_SOCKET_URL` | `https://your-backend.up.railway.app` |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` |

1. Click **Deploy**

---

## Step 4: Update Backend CORS

After frontend deploys, update backend's `CORS_ORIGINS`:

```
CORS_ORIGINS=https://frontend-xxx.up.railway.app
```

---

## Verify Deployment

**Backend Health:**

```bash
curl https://your-backend.up.railway.app/api/health
# {"status":"ok","timestamp":"...","service":"serendipity-backend"}
```

**Frontend:**
Open `https://your-frontend.up.railway.app` in browser.

---

## Auto-Deploy

Railway automatically redeploys when you push to GitHub:

```bash
git push origin main  # Triggers deploy
```

---

## Custom Domain (Optional)

1. Railway Dashboard → Service → Settings → Domains
2. Add custom domain
3. Configure DNS with provided CNAME
