# Serendipity (Finding something good unintentionaly)

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) and Supabase.

## Project Structure

- `backend/`: Node.js/Express backend server.
- `frontensd/apps/web/`: React frontend application using Vite.

## Prerequisites

- Node.js (v16+ recommended)
- Node.js (v16+ recommended)
- npm, yarn, or bun
- Git
- Git

## Bun Setup (Windows PowerShell)

If you prefer using **Bun** (faster than npm), follow these steps:

1. **Install Bun (PowerShell):**

    ```powershell
    irm https://bun.sh/install.ps1 | iex
    ```

2. **Verify Installation:**

    ```powershell
    bun --version
    ```

3. **Restart IDE:** Close and reopen VS Code to ensure the terminal recognizes `bun`.

4. **Backend Setup:**

    ```powershell
    cd backend
    bun install
    bun run server
    ```

5. **Frontend Setup:** (Open a new terminal)

    ```powershell
    cd frontensd/apps/web
    bun install
    bun run dev
    ```

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Itinerant18/Serendipity.git
   cd Serendipity
   ```

2. **Install Backend Dependencies:**

   ```bash
   cd backend
   npm install
   # OR
   bun install
   ```

3. **Install Frontend Dependencies:**

   ```bash
   cd frontensd/apps/web
   npm install
   # OR
   bun install
   ```

## Configuration

### Quick Setup (Recommended)

Use the automated setup script:

**Windows PowerShell:**

```powershell
.\setup-env.ps1
```

**Manual Setup:**

### Database Migration (If you have existing seller data)

If you have existing seller profiles and products in your main database and want to migrate them to the seller database:

```bash
cd backend
npm run migrate:seller
```

This will:

- Copy all `seller_profiles` from main database → seller database
- Copy all seller `products` from main database → seller database
- Verify the migration was successful

**⚠️ Important**: The migration script **copies** data (doesn't delete). Your original data remains in the main database as a backup.

For detailed migration instructions, see [`backend/migrations/README_MIGRATION.md`](backend/migrations/README_MIGRATION.md)

### Backend

1. Navigate to the `backend` directory.
2. Create a `.env` file and add the required environment variables (see `ENV_SETUP.md` for details).
3. Update the `.env` file with your credentials:
   - Main Supabase database credentials
   - Seller Supabase database credentials
   - Payment gateway keys (Razorpay, Stripe)
   - JWT secret (optional)

### Frontend

1. Navigate to the `frontensd/apps/web` directory.
2. Create a `.env` file and add the required environment variables (see `ENV_SETUP.md` for details).
3. Update the `.env` file with your configuration:
   - Main Supabase URL and Anon Key
   - Backend API URL
   - Socket.IO URL

**For detailed environment setup instructions, see [`ENV_SETUP.md`](ENV_SETUP.md)**

## Running the Application

### Development Mode (Concurrent)

The backend `package.json` includes a script to run both servers concurrently.

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Run the development script:

   ```bash
   ```bash
   npm run dev
   # OR
   bun run dev
   ```

This command uses `concurrently` to start:

- Backend server (typically on port 5000)
- Frontend client (typically on port 4000)

### Running Separately

**Backend:**

```bash
cd backend
npm run server
# OR
bun run server
```

**Frontend:**

```bash
cd frontensd/apps/web
npm run dev
# OR
bun run dev
```

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, React Router 7, Supabase Client.
- **Backend**: Node.js, Express, Socket.io, Mongoose.
- **Database**: MongoDB, Supabase (PostgreSQL).
- **Payments**: Razorpay / Stripe.

## Troubleshooting & Common Commands

If you encounter issues with "module not found" or package installation errors, try performing a clean install.

### Backend Troubleshooting

1. **Re-install Dependencies (Clean Install):**

   **Windows (PowerShell):**

   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

   **Mac/Linux/Git Bash:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Run Backend Server Manually:**

   ```bash
   cd backend
   node server.js
   # OR
   npm run server
   ```

### Frontend Troubleshooting

1. **Re-install Dependencies (Clean Install):**

   **Windows (PowerShell):**

   ```powershell
   cd frontensd/apps/web
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

   **Mac/Linux/Git Bash:**

   ```bash
   cd frontensd/apps/web
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Run Frontend Web App:**

   ```bash
   cd frontensd/apps/web
   npm run dev / node node_modules/vite/bin/vite.js
   ```
1