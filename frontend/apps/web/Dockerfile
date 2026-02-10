# =============================================
# Stage 1: Build the React Router + Hono app
# =============================================
FROM node:23-alpine AS builder

WORKDIR /app

# Install build tools for native modules (argon2, etc.)
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files
COPY package*.json ./

# Install dependencies (including native modules)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for Vite (baked into client bundle at build time)
ARG VITE_API_URL=""
ARG VITE_SOCKET_URL=""
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables for the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build the application
RUN npm run build

# =============================================
# Stage 2: Production runtime
# =============================================
FROM node:23-alpine AS production

WORKDIR /app

# Install runtime dependencies for native modules
RUN apk add --no-cache libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built assets and runtime files from builder
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/server-runner.js ./server-runner.js

# Switch to non-root user
USER nodejs

# Expose the port Railway will use
EXPOSE 8080

# Runtime environment variables (set in Railway dashboard)
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
# API_PROXY_TARGET is set at runtime via Railway env vars
# AUTH_SECRET is required for @hono/auth-js

# Start the server
CMD ["npm", "run", "start"]
