# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source files
COPY --chown=nodejs:nodejs . .

# Remove dev files and sensitive data
RUN rm -rf .env .env.* *.log

# Switch to non-root user
USER nodejs

# Cloud platforms use PORT environment variable
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

# Health check using the new /api/health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server with Bun
CMD ["bun", "server.js"]
