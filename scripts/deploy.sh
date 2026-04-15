#!/bin/bash

# Deployment script

set -e

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.production.example to .env and configure it."
    exit 1
fi

# Build the application
echo "📦 Building application..."
./scripts/build.sh

# Run database migrations
echo "🗄️  Pushing database schema..."
cd backend && npm run prisma:push && cd ..

# Start the application
echo "🎯 Starting application..."
npm start
