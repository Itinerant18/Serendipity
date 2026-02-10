# Fix Railway Frontend Deployment — Healthcheck Failure

## Problem

The frontend Docker build succeeds on Railway, but the container crashes immediately on startup with:

```
SyntaxError: The requested module './build/server/index.js' does not provide an export named 'start'
```

The `server-runner.js` uses `import { start } from './build/server/index.js'`, but the Docker-built `build/server/index.js` doesn't export `start`.

## Root Cause Analysis

The `react-router-hono-server/dev` Vite plugin is responsible for transforming the server build output. During `react-router build`:

1. The plugin reads `config.__reactRouterPluginContext` to detect if it's an SSR build
2. If SSR build is detected, it configures Rollup to bundle the `serverEntryPoint` (`__create/index.ts`) into `build/server/index.js` with `{ default, start }` exports
3. If the SSR build context is missing or misconfigured, the output is a bare module **without** the `start` export

**Why it works locally but not in Docker:**

| Factor | Local | Docker |
|--------|-------|--------|
| `.react-router/` types dir | ✅ Present (pre-generated) | ❌ Excluded by `.dockerignore` |
| `VITE_SUPABASE_URL` | ✅ Set in `.env` | ❌ Not passed as build ARG |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set in `.env` | ❌ Not passed as build ARG |
| `node_modules` | ✅ Full install | ✅ Fresh `npm ci` |
| `.env` files | ✅ Present | ❌ Excluded by `.dockerignore` |

The missing `.react-router/` directory and `.env` files during Docker build likely cause the Vite plugin to fail silently, producing a broken server bundle.

## Proposed Changes

### Strategy: Skip the Docker Build Entirely

Instead of debugging the complex Vite build pipeline inside Docker, **copy the pre-built `build/` directory into the Docker image**. This is simpler and more reliable.

> [!IMPORTANT]
> This means the CI/CD must build locally (or in a CI step) before Docker builds. Railway can still build the Docker image, but the Dockerfile will use a simpler approach.

---

### Option A: Pre-build approach (Recommended)

#### [MODIFY] [.dockerignore](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/.dockerignore)
- Remove `build` from the ignore list so the pre-built output is included
- Remove `.react-router` from the ignore list

#### [MODIFY] [Dockerfile](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/Dockerfile)
- Simplify to a single-stage Dockerfile that just copies the pre-built app and installs production dependencies
- Remove the builder stage entirely (no `npm run build` inside Docker)

#### [MODIFY] [railway.toml](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/railway.toml)
- Add a build command that runs `npm run build` before the Dockerfile is built

---

### Option B: Fix the Docker Build (Alternative)

#### [MODIFY] [.dockerignore](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/.dockerignore)
- Remove `build` and `.react-router` from ignore list

#### [MODIFY] [Dockerfile](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/Dockerfile)
- Add `.env` vars as build ARGs with defaults for VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Ensure the `.react-router` types are generated before `npm run build` (run `npx react-router typegen` first)
- Pass all needed VITE_ env vars as Railway build variables

#### [MODIFY] [server-runner.js](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/server-runner.js)
- Add a fallback: if `start` is not exported, try `default` export  
- Add better error logging to diagnose future issues

---

### Option C: Switch to Nixpacks (Simplest)

#### [MODIFY] [railway.toml](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/railway.toml)
- Remove the `builder = "dockerfile"` and let Railway use Nixpacks (which already has a `nixpacks.toml`)
- Nixpacks runs the build in the same environment as runtime, avoiding the Docker multi-stage issue entirely

#### [DELETE] [Dockerfile](file:///home/aniket-karmakar/project/Serendipity/frontend/apps/web/Dockerfile)
- Not needed if using Nixpacks

---

## Recommendation

**Option C (Nixpacks)** is the simplest and most reliable path because:

1. `nixpacks.toml` already exists and is correctly configured
2. No Docker multi-stage build complexity
3. Build and runtime share the same environment (no mis-matched env vars or missing files)
4. Railway natively supports Nixpacks — it's their default builder
5. The `server-runner.js` fix (from Option B) should still be done as a safety net

## Implementation Steps

1. Update `railway.toml` to use Nixpacks builder (remove `dockerfilePath`)
2. Update `nixpacks.toml` to ensure correct Node.js version and env handling
3. Update `server-runner.js` with a resilient import (fallback for `default` export)
4. Commit and push
5. Set Railway env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, AUTH_SECRET, API_PROXY_TARGET, etc.)
6. Redeploy on Railway

## Verification Plan

### Automated
- Run `npm run build && node server-runner.js` locally to confirm server starts
- Verify `/health` endpoint responds with 200

### On Railway
- Check build logs for successful `npm run build`
- Check deploy logs for `🚀 Server started on port` message
- Verify healthcheck passes within 5-minute window
- Test the deployed URL responds
