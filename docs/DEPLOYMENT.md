# Deployment Guide - Serendipity E-commerce Platform

This guide covers deploying the Serendipity application to various platforms.

## Prerequisites

- Node.js 20+ or Bun 1.0+
- Docker (optional, for containerized deployment)
- Supabase project configured
- Razorpay account (for payments)

## Quick Start with Docker

The fastest way to deploy the full stack:

```bash
# Clone and configure
git clone https://github.com/your-repo/serendipity.git
cd serendipity

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/apps/web/.env.example frontend/apps/web/.env
# Edit both .env files with your credentials

# Build and run
docker-compose up --build

# Access:
# Frontend: http://localhost:4000
# Backend:  http://localhost:5000
# Health:   http://localhost:5000/api/health
```

---

## Platform-Specific Deployments

### 1. Railway (Recommended)

Both services have `railway.toml` pre-configured.

**Backend:**

```bash
cd backend
railway login
railway init
railway up
```

**Frontend:**

```bash
cd frontend/apps/web
railway login
railway init
railway up
```

**Environment Variables** (set in Railway dashboard):

- Backend: All variables from `backend/.env.example`
- Frontend: All variables from `frontend/apps/web/.env.example`

---

### 2. Google Cloud Run

**Backend:**

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/serendipity-backend
gcloud run deploy serendipity-backend \
  --image gcr.io/YOUR_PROJECT/serendipity-backend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,CORS_ORIGINS=https://your-frontend.run.app"
```

**Frontend:**

```bash
cd frontend/apps/web
gcloud builds submit --tag gcr.io/YOUR_PROJECT/serendipity-frontend
gcloud run deploy serendipity-frontend \
  --image gcr.io/YOUR_PROJECT/serendipity-frontend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=https://your-backend.run.app"
```

---

### 3. Render

**Backend:**

1. Create new Web Service
2. Connect your GitHub repository
3. Root directory: `backend`
4. Build command: `bun install`
5. Start command: `bun server.js`
6. Add environment variables

**Frontend:**

1. Create new Web Service
2. Connect your GitHub repository
3. Root directory: `frontend/apps/web`
4. Build command: `npm ci --legacy-peer-deps && npm run build`
5. Start command: `npm run start`
6. Add environment variables

---

### 4. Docker on VPS

```bash
# On your server
git clone https://github.com/your-repo/serendipity.git
cd serendipity

# Configure environment
cp backend/.env.example backend/.env
cp frontend/apps/web/.env.example frontend/apps/web/.env
nano backend/.env  # Add your production values
nano frontend/apps/web/.env

# Run with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Setup reverse proxy (nginx example)
# See: https://docs.docker.com/samples/nginx/
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (default: 5000) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `SUPABASE_URL` | Yes | Main Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `SELLER_SUPABASE_*` | Yes | Seller database credentials |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret |
| `REDIS_URL` | No | Redis URL for caching |

### Frontend (`frontend/apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_SOCKET_URL` | Yes | Socket.io server URL |
| `AUTH_SECRET` | Yes | Auth.js secret (32+ chars) |

---

## Health Checks

Both services expose health check endpoints:

- **Backend**: `GET /api/health` → `{"status":"ok","timestamp":"...","service":"serendipity-backend"}`
- **Frontend**: `GET /` → Returns HTML (200 OK)

---

## Troubleshooting

### CORS Errors

Ensure `CORS_ORIGINS` in backend includes your frontend URL (with protocol).

### Socket.io Connection Failed

Check `VITE_SOCKET_URL` matches your backend URL and WebSocket connections are allowed.

### Build Failures

```bash
# Frontend: use legacy peer deps
npm ci --legacy-peer-deps

# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```
