#!/bin/bash

# Docker deployment script
echo "Setting up Docker environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Copy docker environment file
echo "Setting up Docker environment configuration..."
cp "./backend/config/.env.docker" "./backend/config/.env"

# Build and start services
echo "Building and starting Docker services..."
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker-compose ps

# Show logs
echo "Recent logs:"
docker-compose logs --tail=20

echo "Docker environment is ready!"
echo "Access your application at:"
echo "   - Backend API: http://localhost:5000"
echo "   - Frontend: http://localhost:3000"
echo "   - MongoDB: localhost:27017"
