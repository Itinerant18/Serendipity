# Serendipity (Amazon Clone)

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) and Supabase.

## Project Structure

- `backend/`: Node.js/Express backend server.
- `frontensd/apps/web/`: React frontend application using Vite.

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Git

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
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontensd/apps/web
   npm install
   ```

## Configuration

### Backend
1. Navigate to the `backend` directory.
2. Create a `.env` file based on `.env.example`.
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env`)*
3. Update the `.env` file with your credentials (MongoDB URI, Supabase keys, Razorpay secret, etc.).

### Frontend
1. Navigate to the `frontensd/apps/web` directory.
2. Create a `.env` file based on `.env.example`.
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env`)*
3. Update the `.env` file with your configuration (Supabase URL/Anon Key, API endpoints, etc.).

## Running the Application

### Development Mode (Concurrent)

The backend `package.json` includes a script to run both servers concurrently.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the development script:
   ```bash
   npm run dev
   ```

This command uses `concurrently` to start:
- Backend server (typically on port 5000)
- Frontend client (typically on port 5173)

### Running Separately

**Backend:**
```bash
cd backend
npm run server
```

**Frontend:**
```bash
cd frontensd/apps/web
npm run dev
```

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, React Router 7, Supabase Client.
- **Backend**: Node.js, Express, Socket.io, Mongoose.
- **Database**: MongoDB, Supabase (PostgreSQL).
- **Payments**: Razorpay / Stripe.
