# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production && \
    cd backend && npm ci --only=production && \
    cd ../frontend && npm ci --only=production

# Build backend
FROM base AS backend-builder
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend ./backend
RUN cd backend && npm run build

# Build frontend
FROM base AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy backend production files
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/prisma ./backend/prisma

# Copy frontend production files
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/dist ./frontend/dist

# Copy node_modules from deps stage
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:nodejs /app/backend/node_modules ./backend/node_modules

# Copy root package.json
COPY --chown=appuser:nodejs package*.json ./

# Create uploads directory
RUN mkdir -p backend/uploads && chown -R appuser:nodejs backend/uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/v1/dashboard/summary', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
