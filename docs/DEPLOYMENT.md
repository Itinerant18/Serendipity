# Deployment Guide

The Serendipity application is designed to be easily deployed, with specific configurations included for **Railway**.

## Recommended: Railway

We recommend deploying to [Railway](https://railway.app/) because the project is already pre-configured with `railway.toml` files for both the backend and frontend. Railway supports both the Node.js/Bun backend and the React Router frontend (SSR) in a monorepo structure.

### Prerequisites

1.  A Railway account.
2.  A GitHub repository containing this code.
3.  A Supabase project (for the database).

### Steps

1.  **Create a New Project on Railway:**
    - Go to your Railway dashboard.
    - Click "New Project" > "Deploy from GitHub repo".
    - Select your Serendipity repository.

2.  **Configure Services:**
    Railway should automatically detect the multiple directories (monorepo). If not, or to ensure correct setup, you may need to add two services linking to the same repo but different root directories.

    *   **Backend Service:**
        -   Root Directory: `backend`
        -   The `railway.toml` in `backend/` will handle the build (using Nixpacks) and start command (`bun server.js`).

    *   **Frontend Service:**
        -   Root Directory: `frontend/apps/web`
        -   The `railway.toml` in `frontend/apps/web/` will handle the build (`npm ci` & `npm run build`) and start command (`npm run start`).

3.  **Environment Variables:**
    You need to set the environment variables for each service in the Railway dashboard. Refer to `.env.example` in each directory.

    **Backend Variables:**
    -   `PORT`: (Railway sets this automatically)
    -   `MONGO_URI` (if used) or Supabase connection details.
    -   `SUPABASE_URL`: Your Supabase URL.
    -   `SUPABASE_KEY`: Your Supabase Key.
    -   Other keys from `backend/.env.example`.

    **Frontend Variables:**
    -   `VITE_API_URL`: The URL of your deployed Backend service (e.g., `https://backend-production.up.railway.app`).
    -   `VITE_SUPABASE_URL`: Your Supabase URL.
    -   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    -   Other keys from `frontend/apps/web/.env.example`.

4.  **Deploy:**
    -   Once variables are set, Railway will trigger a deployment.
    -   Monitor the deployment logs for any errors.

## Alternatives

### Frontend: Vercel / Netlify
The frontend uses React Router 7 with Server-Side Rendering (SSR).

*   **Vercel:**
    -   Import the `frontend/apps/web` directory.
    -   Framework Preset: Remix / React Router (if available) or "Other".
    -   Build Command: `npm run build`
    -   Install Command: `npm ci --legacy-peer-deps`
    -   Output Directory: `build/client` (Usually Vercel detects Remix/RR7, but you might need to configure the output settings or use a Vercel adapter if one isn't built-in).
    -   Environment Variables: Set `VITE_API_URL`, etc.

*   **Netlify:**
    -   Similar setup. You may need a `netlify.toml` or configure the build settings to run the server.

### Backend: AWS / Google Cloud / Render

*   **Render:**
    -   Create a "Web Service".
    -   Connect GitHub repo.
    -   Root Directory: `backend`.
    -   Build Command: `npm install` (or `bun install`).
    -   Start Command: `node server.js` (or `bun server.js`).
    -   Add Environment Variables.

*   **AWS (EC2):**
    -   Launch an EC2 instance (Ubuntu/Amazon Linux).
    -   Install Node.js/Bun.
    -   Clone repo.
    -   Setup PM2 or Systemd to keep `server.js` running.
    -   Use Nginx as a reverse proxy.

*   **Google Cloud (App Engine):**
    -   Create `app.yaml` in `backend/` with `runtime: nodejs18` (or similar).
    -   Deploy using `gcloud app deploy`.

## Database

This project uses **Supabase** (PostgreSQL) and **MongoDB** (optionally).
-   **Supabase:** Managed service, no deployment needed, just configuration.
-   **MongoDB:** Use **MongoDB Atlas** for a managed cloud database.
