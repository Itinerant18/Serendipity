# Plan: Deploy Frontend to Railway

## Context

- **Backend**: Already deployed at `https://serendipity-backend.up.railway.app`
- **Frontend**: React Router + Hono SSR app at `frontend/apps/web/`
- **Existing Dockerfile**: Multi-stage build with `node:23-alpine` ✅
- **Start command**: `node ./server-runner.js` (imports from `build/server/index.js`)
- **Healthcheck**: `/health` endpoint in Hono server

---

## Architecture Decision: Proxy vs Direct

> [!IMPORTANT]
> **Two options** for how the deployed frontend talks to the deployed backend:

| Approach | How | Pros | Cons |
|---|---|---|---|
| **A) Server-side proxy** | Set `API_PROXY_TARGET` on frontend service → Hono proxies `/api/*` to backend | Single domain, no CORS, cookies just work | Extra hop, slight latency |
| **B) Direct client calls** | Set `VITE_API_URL` to backend URL → browser calls backend directly | No proxy overhead | CORS config needed, cookie domain issues |

**Recommended: Option A (proxy)** — simpler, no CORS headaches. The Hono proxy in `__create/index.ts` already supports this (lines 128-166).

---

## Implementation Steps

### Phase 1: Create `railway.toml` for Frontend

#### [NEW] `frontend/apps/web/railway.toml`

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Phase 2: Fix Dockerfile

The existing Dockerfile is good but needs a minor tweak:
- Add `API_PROXY_TARGET` as a **runtime** env var (NOT build arg)
- Ensure `AUTH_SECRET` is set at runtime
- The `server-runner.js` uses ESM `import`, ensure `"type": "module"` is in package.json ✅

#### [MODIFY] `frontend/apps/web/Dockerfile`

Key changes:
- Add `API_PROXY_TARGET` as runtime ENV (not build ARG since it's used at runtime by Hono)
- Ensure `VITE_API_URL` is set to empty string at build time (relative URLs)

### Phase 3: Set Railway Environment Variables

In Railway Dashboard → Frontend service → Variables:

| Variable | Value | Type |
|---|---|---|
| `VITE_API_URL` | *(empty string)* | Build-time |
| `VITE_SOCKET_URL` | `https://serendipity-frontend.up.railway.app` | Build-time |
| `VITE_SUPABASE_URL` | `https://wosxyoivsiqzyufhcyhy.supabase.co` | Build-time |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Build-time |
| `API_PROXY_TARGET` | `https://serendipity-backend.up.railway.app` | Runtime |
| `AUTH_SECRET` | *(generate: `openssl rand -base64 32`)* | Runtime |
| `NODE_ENV` | `production` | Runtime |
| `PORT` | `8080` | Runtime |

### Phase 4: Update Backend CORS

Add the frontend Railway URL to the backend's `CORS_ORIGINS` env var on Railway:

```
CORS_ORIGINS=http://localhost:4000,http://localhost:5173,https://serendipity-frontend.up.railway.app
```

### Phase 5: Update Supabase & Google OAuth

Add the new frontend URL to:
1. **Supabase Dashboard** → Authentication → URL Configuration → Redirect URLs:
   - `https://serendipity-frontend.up.railway.app/auth/callback`
2. **Google Cloud Console** → OAuth Client:
   - Authorized JavaScript origins: `https://serendipity-frontend.up.railway.app`
   - Authorized redirect URIs: `https://wosxyoivsiqzyufhcyhy.supabase.co/auth/v1/callback`

### Phase 6: Deploy via Railway

1. Create new service in Railway project
2. Connect to GitHub repo: `Itinerant18/Serendipity`
3. Set **Root Directory**: `frontend/apps/web`
4. Set environment variables from Phase 3
5. Deploy

---

## Verification Checklist

- [ ] `railway.toml` created in frontend directory
- [ ] Dockerfile updated with correct ENV vars
- [ ] Railway service created and connected to repo
- [ ] Environment variables set in Railway dashboard
- [ ] Backend CORS updated with frontend URL
- [ ] Healthcheck passes: `curl https://<frontend-url>/health`
- [ ] Products load on homepage
- [ ] Google Auth works on production URL
