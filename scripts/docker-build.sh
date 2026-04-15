#!/bin/bash

# Docker build and deploy script

set -e

echo "🐳 Building Docker image..."

# Build the Docker image
docker build -t wholesale-crm:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "To run with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To run standalone:"
echo "  docker run -p 5001:5001 --env-file .env wholesale-crm:latest"
