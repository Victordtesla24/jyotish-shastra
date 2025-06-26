#!/bin/bash

# Jyotish Shastra Project Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Jyotish Shastra Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (to be configured)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jyotish_shastra
DB_USER=postgres
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# API Configuration
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# Astrological Settings
DEFAULT_AYANAMSA=23.85
EPHEMERIS_PATH=./ephemeris
EOF
    echo "✅ .env file created"
fi

# Create ephemeris directory
echo "📁 Creating ephemeris directory..."
mkdir -p ephemeris

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your database settings in .env"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Run 'cd client && npm start' to start the frontend"
echo ""
echo "📚 Documentation: ./docs/"
echo "🧪 Tests: npm test"
echo "🔍 Linting: npm run lint"
