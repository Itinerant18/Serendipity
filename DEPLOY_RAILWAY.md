# Deploying Serendipity to Railway

This guide outlines the steps to deploy the Serendipity application (Backend and Frontend) to Railway.

## Prerequisites

- A [Railway](https://railway.app/) account.
- The [Railway CLI](https://docs.railway.app/guides/cli) (optional, but useful).

## Repository Setup

Since this is a monorepo, you will deploy two separate services in Railway from the same repository.

## 1. Deploying the Backend

1.  **Create a New Service**:
    -   In your Railway project, click "New" -> "GitHub Repo".
    -   Select the `Serendipity` repository.
2.  **Configure the Service**:
    -   Go to the service "Settings".
    -   **Root Directory**: Set this to `backend`.
    -   **Watch Paths**: Set this to `backend/**`.
3.  **Environment Variables**:
    -   Go to the "Variables" tab.
    -   Add the following variables (refer to `backend/.env.example`):
        -   `NODE_ENV`: `production`
        -   `PORT`: `5000` (Railway provides this automatically, but good to be explicit or use `PORT` in code)
        -   `SUPABASE_URL`: Your Supabase URL.
        -   `SUPABASE_KEY`: Your Supabase Anon Key.
        -   `SUPABASE_SERVICE_KEY`: Your Supabase Service Key.
        -   `SELLER_SUPABASE_URL`: Seller Supabase URL.
        -   `SELLER_SUPABASE_KEY`: Seller Supabase Anon Key.
        -   `SELLER_SUPABASE_SERVICE_KEY`: Seller Supabase Service Key.
        -   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
        -   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
        -   `CORS_ORIGINS`: `https://your-frontend-url.up.railway.app` (You will get this URL after deploying the frontend).

## 2. Deploying the Frontend

1.  **Create a New Service**:
    -   In the same Railway project, click "New" -> "GitHub Repo".
    -   Select the `Serendipity` repository *again*.
2.  **Configure the Service**:
    -   Go to the service "Settings".
    -   **Root Directory**: Set this to `frontend/apps/web`.
    -   **Watch Paths**: Set this to `frontend/apps/web/**`.
3.  **Environment Variables**:
    -   Go to the "Variables" tab.
    -   Add the following variables (refer to `frontend/apps/web/.env.example`):
        -   `VITE_API_URL`: `https://your-backend-url.up.railway.app` (The URL of the backend service you just deployed).
        -   `VITE_SOCKET_URL`: `https://your-backend-url.up.railway.app` (Same as API URL).
        -   `VITE_SUPABASE_URL`: Your Supabase URL.
        -   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
        -   `AUTH_SECRET`: Generate a secure secret (e.g., `openssl rand -base64 32`).

## 3. Linking the Services

1.  **Get the Backend URL**:
    -   Go to the Backend service settings.
    -   Under "Networking", verify a domain is generated (e.g., `xxx.up.railway.app`).
    -   Copy this URL.
2.  **Update Frontend Variables**:
    -   Go to the Frontend service variables.
    -   Update `VITE_API_URL` and `VITE_SOCKET_URL` with the Backend URL.
    -   Redeploy the Frontend.
3.  **Get the Frontend URL**:
    -   Go to the Frontend service settings.
    -   Under "Networking", verify a domain is generated.
    -   Copy this URL.
4.  **Update Backend Variables**:
    -   Go to the Backend service variables.
    -   Update `CORS_ORIGINS` with the Frontend URL.
    -   Redeploy the Backend.

## Troubleshooting

-   **Build Errors**: Check the "Build Logs" in Railway.
    -   Ensure `frontend/apps/web` installs dependencies with `npm ci --legacy-peer-deps` (configured in `railway.toml`).
    -   Ensure `backend` installs dependencies with `bun install` (configured in `nixpacks.toml`).
-   **Connection Issues**:
    -   Check the browser console for CORS errors. Ensure `CORS_ORIGINS` in backend matches the frontend URL exactly (no trailing slash usually).
    -   Verify `VITE_API_URL` is correct.

## Configuration Files

-   `backend/railway.toml`: Configures health checks and restart policy for backend.
-   `backend/nixpacks.toml`: Configures build environment (Bun) for backend.
-   `frontend/apps/web/railway.toml`: Configures build/start commands and health checks for frontend.
-   `frontend/apps/web/nixpacks.toml`: Configures build environment for frontend.
