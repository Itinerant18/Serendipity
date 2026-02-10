# Debug Plan: Fix Products Not Loading
> Status: PROPOSED
> Priority: HIGH
> Owner: @project-planner

## 🔍 Context
- **Symptom**: Products are not visible on the deployed frontend (`https://serendipity-e.up.railway.app`).
- **Environment**: Railway (Docker/Nixpacks).
- **Recent Changes**: Updated environment variables for deployed frontend/backend.
- **Current State**: Frontend loads, but API calls seem to fail or return empty.

## 🧠 Hypotheses
1.  **CORS Mismatch**: Browser blocks request because `Access-Control-Allow-Origin` doesn't match `Origin` header exactly.
2.  **Proxy Failure**: The Hono server proxy isn't forwarding requests correctly, or the backend rejects the spoofed Host/Origin.
3.  **Database Connection**: Backend fails to connect to Supabase/Redis in production (silent crash or 500 error).
4.  **Frontend URL**: The frontend might be using a hardcoded or wrong API URL despite `VITE_API_URL=""`.

## 🛠️ Action Plan

### Phase 1: Verification (User Action Required)
- [ ] **Check Network Tab**: Identify the status code of `/api/products` request.
  - **404**: Proxy not matching path or Backend route missing.
  - **500**: Backend internal error (Database?).
  - **CORS Error**: Browser blocking response.
- [ ] **Check Railway Logs**:
  - **Frontend Logs**: Does it show `✅ Proxying /api/*`? Does it show errors?
  - **Backend Logs**: Does it show incoming requests? Does it show DB errors?
- [ ] **Verify `VITE_API_URL`**: Ensure it is strictly empty in Railway dashboard.

### Phase 2: Implementation (Code Changes if needed)
- [ ] **Add Logging**: Add request logging to Backend entry point to confirm receipt.
- [ ] **Force CORS**: Temporarily allow `*` in Backend to rule out CORS.
- [ ] **Hardcode URL**: Temporarily set `VITE_API_URL` to backend URL (bypass proxy) to isolate proxy issues.

### Phase 3: Validation
- [ ] Products load on `https://serendipity-e.up.railway.app`.
- [ ] Network requests show `200 OK`.

## 🤖 Agent Assignments
- **@debugger**: Analyze logs and network output.
- **@backend-specialist**: Fix CORS or DB connection issues.
- **@frontend-specialist**: Verify API client configuration.
