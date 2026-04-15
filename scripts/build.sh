#!/bin/bash

# Build script for production deployment

set -e

echo "🚀 Starting production build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm install --prefix backend
npm install --prefix frontend

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend && npm run prisma:generate && cd ..

# Build backend
echo "🏗️  Building backend..."
cd backend && npm run build && cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend && npm run build && cd ..

echo "✅ Build completed successfully!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Or with Docker:"
echo "  docker-compose up -d"
