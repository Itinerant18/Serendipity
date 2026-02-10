# Local Frontend + Deployed Backend Configuration

## Problem Statement

Running the local frontend (`localhost:4000`) with the deployed backend (`serendipity-backend.up.railway.app`) fails with CORS and connectivity errors. The current setup has multiple configuration conflicts.

---

## Root Cause Analysis

### Issue 1: Vite Proxy Conflict
**File**: `vite.config.ts` (lines 105-111)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',  // ❌ Always proxies to local backend
    changeOrigin: true,
    secure: false,
  },
},
```
**Problem**: The proxy intercepts all `/api` requests and sends them to localhost:5000, ignoring `VITE_API_URL`.

### Issue 2: Local Backend CORS Origins
**File**: `backend/server.js` (lines 43-50)
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',') 
        : ["http://localhost:4000", "http://localhost:5173", "http://127.0.0.1:4000"],
    // ...
}));
```
**Problem**: The deployed backend needs `CORS_ORIGINS` env var set on Railway to include `http://localhost:4000` for local development.

### Issue 3: Dev Server Start Error (FIXED)
**File**: `__create/route-builder.ts`
**Status**: ✅ Already fixed - removed duplicate route registration.

---

## Proposed Changes

### Phase 1: Remove Vite Proxy for External Backend

#### [MODIFY] vite.config.ts

Remove or conditionally disable the proxy when using external backend:

```diff
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 4000,
    hmr: {
      overlay: false,
    },
-   proxy: {
-     '/api': {
-       target: 'http://localhost:5000',
-       changeOrigin: true,
-       secure: false,
-     },
-   },
+   // Proxy removed - frontend now directly calls VITE_API_URL
+   // For local backend dev, set VITE_API_URL=http://localhost:5000
  },
```

---

### Phase 2: Configure Deployed Backend CORS

#### [USER ACTION] Railway Backend Environment

Add `http://localhost:4000` to the allowed CORS origins on Railway:

1. Go to **Railway Dashboard** → `serendipity-backend` service
2. Navigate to **Variables** tab
3. Set or update:
   ```
   CORS_ORIGINS=http://localhost:4000,http://localhost:5173,https://serendipity-e.up.railway.app
   ```
4. Trigger redeploy

---

### Phase 3: Update Local .env (Already Done)

Current configuration is correct:
```env
VITE_API_URL="https://serendipity-backend.up.railway.app"
VITE_SOCKET_URL="https://serendipity-backend.up.railway.app"
VITE_SUPABASE_URL="https://wosxyoivsiqzyufhcyhy.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
```

---

## Configuration Summary

| Environment | VITE_API_URL | Backend Location |
|-------------|--------------|------------------|
| **Local Frontend + Deployed Backend** | `https://serendipity-backend.up.railway.app` | Railway |
| **Local Frontend + Local Backend** | `http://localhost:5000` | Local |
| **Production** | Set in Railway | Railway |

---

## Verification Plan

### Automated Tests
```bash
cd frontend/apps/web && npm run test -- --run
```

### Manual Verification

#### Step 1: Verify Backend CORS (after Railway update)
```bash
curl -X OPTIONS https://serendipity-backend.up.railway.app/api/products \
  -H "Origin: http://localhost:4000" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep "Access-Control-Allow-Origin"
# Expected: Access-Control-Allow-Origin: http://localhost:4000
```

#### Step 2: Start Local Frontend
```bash
cd frontend/apps/web && npm run dev
```

#### Step 3: Browser Verification
1. Open `http://localhost:4000`
2. Open DevTools → Network tab
3. Check API requests go to `serendipity-backend.up.railway.app` (not localhost:5000)
4. No CORS errors in Console

#### Step 4: Login Flow Test
1. Click Sign In → Enter credentials
2. Verify login succeeds without CORS errors

---

## Task Sequence

- [ ] Phase 1: Remove vite proxy from vite.config.ts
- [ ] Phase 2: User sets CORS_ORIGINS on Railway backend
- [ ] Phase 3: Run automated tests
- [ ] Phase 4: Start dev server and verify manually
- [ ] Phase 5: Test login flow
- [ ] Phase 6: Commit and push changes
