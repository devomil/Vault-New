# syntax=docker/dockerfile:1

# Base stage for shared dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
# COPY .npmrc ./  # Only copy if .npmrc exists

# Install dependencies
RUN npm ci --ignore-scripts --legacy-peer-deps

# Development stage
FROM base AS development

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts --legacy-peer-deps

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose production port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Production command
CMD ["npm", "start"] 