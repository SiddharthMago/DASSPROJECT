#!/bin/bash

# Development setup script
echo "Setting up local development environment..."

# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
    echo "Starting MongoDB service..."
    sudo systemctl start mongod
fi

# Copy local environment file
if [ ! -f "./backend/config/.env" ]; then
    echo "Creating local environment file..."
    cp "./backend/config/.env.local" "./backend/config/.env"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Local development environment ready!"
echo "You can now run:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
