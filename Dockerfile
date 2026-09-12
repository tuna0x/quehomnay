# Multi-stage Production Dockerfile for Quẻ Hôm Nay
# Stage 1: Build Frontend Client
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist

# Copy backend server code and configuration
COPY server ./server
COPY index.html ./index.html
COPY .env.example ./.env.example

# Expose backend port
EXPOSE 5001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/stats || exit 1

# Start the application
CMD ["node", "server/index.js"]
