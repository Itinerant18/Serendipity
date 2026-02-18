# PLAN: Fix 401 Auth Token Errors

## Problem

All authenticated endpoints (`/api/orders/history`, `/api/addresses`, `/api/wishlist`) return **401 "Not authorized, token failed"** on the deployed Railway backend.

## Root Cause

| # | Issue | Detail |
|---|---|---|
| 1 | **Token expiry (1h)** | Supabase access tokens expire in 1 hour. Backend returns only `access_token`, discards `refresh_token`. No client-side refresh mechanism exists. |
| 2 | **Railway env vars** | May not match the `wosxyoivsiqzyufhcyhy` Supabase project used by the frontend — needs manual verification. |

## Task Breakdown

### Phase 1: Backend — Return Refresh Token
- [ ] Return `refreshToken: session.refresh_token` from login, register, seller-login in `authRoutes.js`
- [ ] Add `POST /api/auth/refresh` endpoint that calls `supabase.auth.refreshSession()`

### Phase 2: Frontend — Silent Token Refresh
- [ ] Add `refreshToken` to `authStore.js` persisted state
- [ ] Save `refreshToken` from login/register responses in `useAuth.js`
- [ ] In `apiClient.js`: on token expiry, silently call `/api/auth/refresh` instead of logout
- [ ] In `api.js` (`apiRequest`): same refresh-before-logout logic

### Phase 3: Railway Env Verification
- [ ] Verify `SUPABASE_URL` = `https://wosxyoivsiqzyufhcyhy.supabase.co`
- [ ] Verify `SUPABASE_KEY` = anon key for same project
- [ ] Verify `SUPABASE_SERVICE_KEY` = service role key for same project

### Phase 4: Test & Deploy
- [ ] Test login → protected endpoint → 200
- [ ] Test token expiry → auto-refresh → 200
- [ ] Push to GitHub → Railway redeploy
- [ ] Manual verification on deployed site

## Agent Assignments

| Phase | Agent |
|---|---|
| Phase 1-2 | `backend-specialist` + `frontend-specialist` |
| Phase 3 | Manual (user verifies Railway dashboard) |
| Phase 4 | `debugger` |
