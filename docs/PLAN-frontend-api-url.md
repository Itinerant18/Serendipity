# Frontend API URL Configuration Fix

Fix the frontend production deployment to properly connect with the deployed backend at `https://serendipity-backend.up.railway.app/`.

---

## Problem Analysis

The frontend is deployed on Railway but cannot communicate with the backend because:

1. **Hardcoded localhost URLs**: 37+ occurrences of `http://localhost:5000` across 25+ source files
2. **Missing environment variable**: `VITE_API_URL` is not configured in Railway's deployment environment
3. **Inconsistent patterns**: Some files use env vars with fallback, others have completely hardcoded URLs

### Issue Categories

| Category | Files Affected | Example |
|----------|---------------|---------|
| **Type A**: Env var with localhost fallback | 20+ files | `import.meta.env.VITE_API_URL \|\| 'http://localhost:5000'` |
| **Type B**: Completely hardcoded URLs | ~5 files | `'http://localhost:5000/api/seller/register'` |
| **Type C**: Dev-only proxy config | 1 file | `vite.config.ts` proxy settings |

---

## User Review Required

> [!IMPORTANT]
> **Railway Environment Variable Configuration**  
> You must set the `VITE_API_URL` environment variable in your Railway frontend service settings to:
> ```
> VITE_API_URL=https://serendipity-backend.up.railway.app
> ```
> This is a **build-time variable** for Vite, so the frontend must be redeployed after setting it.

> [!WARNING]
> **Socket.io Configuration**  
> If your app uses Socket.io for real-time features, also set:
> ```
> VITE_SOCKET_URL=https://serendipity-backend.up.railway.app
> ```

---

## Proposed Changes

### Component 1: Create Centralized API Configuration

The codebase already has `src/lib/api.js` and `src/lib/apiClient.js` that properly use environment variables. We'll leverage these and ensure all files import from them.

#### [MODIFY] [api.js](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/lib/api.js)
- Add JSDoc comments explaining the configuration
- Export `API_URL` and `getApiUrl()` helper for dynamic usage
- No hardcoded fallback change needed (env var will be set in production)

---

### Component 2: Fix Completely Hardcoded URLs (Type B)

These files have directly hardcoded URLs that bypass environment variables entirely.

#### [MODIFY] [seller/signup/page.jsx](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/app/seller/signup/page.jsx)
- **Line 114-115**: Replace hardcoded `'http://localhost:5000/api/seller/register'` and `'http://localhost:5000/api/seller/signup'` with `${API_URL}/api/seller/register` and `${API_URL}/api/seller/signup`
- **Line 157**: Replace `'http://localhost:5000/api/seller/sync-status'` with `${API_URL}/api/seller/sync-status`
- **Line 167**: Replace `'http://localhost:5000/api/profile'` with `${API_URL}/api/profile`
- Import `API_URL` from `@/lib/api`

#### [MODIFY] [seller/inventory/edit/[id]/page.jsx](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/app/seller/inventory/edit/[id]/page.jsx)
- **Line 360**: Replace hardcoded `'http://localhost:5000/api/upload/product-images'` with `${API_URL}/api/upload/product-images`

---

### Component 3: Standardize API URL Usage (Type A Files)

These files already use env vars but define `API_URL` locally. We should import from the central module for consistency. **This is optional but recommended for maintainability.**

Files to update (import `API_URL` from `@/lib/api` instead of local definition):

| File | Current Local Definition |
|------|-------------------------|
| [apiClient.js](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/lib/apiClient.js#L10) | Line 10 |
| [useAuth.js](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/utils/useAuth.js#L6) | Line 6 |
| [useSocket.js](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/utils/useSocket.js#L5) | Line 5 |
| [ProductCard.jsx](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/components/ProductCard.jsx#L77) | Line 77 |
| [ActivityDashboard.jsx](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/src/components/profile/ActivityDashboard.jsx#L8) | Line 8 |
| Multiple page files | Various lines |

> [!NOTE]
> This refactor is **Phase 2** (optional). The critical fix is ensuring `VITE_API_URL` is set in Railway and fixing Type B hardcoded URLs.

---

### Component 4: Vite Proxy Configuration

#### [MODIFY] [vite.config.ts](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/vite.config.ts#L105-L111)
- Add comment explaining this proxy is **development-only**
- In production, requests go directly to `VITE_API_URL`

---

### Component 5: Railway Environment Configuration

#### [NEW] [.env.production.example](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/.env.production.example)
Create a reference file showing required production environment variables:
```env
# Production Environment Variables (set in Railway)
VITE_API_URL=https://serendipity-backend.up.railway.app
VITE_SOCKET_URL=https://serendipity-backend.up.railway.app
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## Implementation Summary

### Phase 1: Critical Fixes (Required)
1. Set `VITE_API_URL` in Railway frontend service environment
2. Fix hardcoded URLs in `seller/signup/page.jsx` (4 occurrences)
3. Fix hardcoded URL in `seller/inventory/edit/[id]/page.jsx` (1 occurrence)
4. Redeploy frontend on Railway

### Phase 2: Code Cleanup (Optional)
1. Centralize all `API_URL` imports to use `@/lib/api`
2. Remove duplicate local `API_URL` definitions
3. Add documentation comments to `vite.config.ts`

---

## Verification Plan

### Automated Tests

Run existing tests to ensure no regressions:
```bash
cd /home/aniket-karmakar/project/Serendipity/frontend/apps/web
npm run test
```

The `test/api.test.ts` file tests the API request functionality and will validate that `API_URL` is properly exported.

### Build Verification

Verify the build succeeds:
```bash
cd /home/aniket-karmakar/project/Serendipity/frontend/apps/web
npm run build
```

### Manual Verification (After Railway Deployment)

1. **Set Railway Environment Variable**:
   - Go to Railway dashboard → Frontend service → Variables
   - Add: `VITE_API_URL=https://serendipity-backend.up.railway.app`
   - Trigger a new deployment

2. **Test API Connectivity**:
   - Open deployed frontend URL in browser
   - Open browser DevTools → Network tab
   - Navigate to home page and verify API calls go to `serendipity-backend.up.railway.app` not `localhost`

3. **Test Key Flows**:
   - [ ] Home page loads products
   - [ ] User login works
   - [ ] Seller signup works (previously broken due to hardcoded URLs)
   - [ ] Product listing/detail pages load

4. **Verify Socket Connection** (if applicable):
   - Check browser console for WebSocket connection to production URL

---

## Files Changed Summary

| File | Change Type | Priority |
|------|-------------|----------|
| `src/app/seller/signup/page.jsx` | MODIFY | 🔴 Critical |
| `src/app/seller/inventory/edit/[id]/page.jsx` | MODIFY | 🔴 Critical |
| `.env.production.example` | NEW | 🟡 Documentation |
| `vite.config.ts` | MODIFY | 🟢 Optional |
| Multiple `API_URL` files | MODIFY | 🟢 Optional (Phase 2) |

---

## Agent Assignments

| Task | Agent |
|------|-------|
| Fix hardcoded URLs | `frontend-specialist` |
| Railway configuration | User (manual) |
| Verification | `frontend-specialist` + User |
