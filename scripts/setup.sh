#!/bin/bash

# Medical Bills Management System - Setup Script
# This script sets up the entire project for development

echo "🔧 Setting up Medical Bills Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install root dependencies"
    exit 1
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api && npm install && cd ..
if [ $? -ne 0 ]; then
    echo "❌ Failed to install API dependencies"
    exit 1
fi

# Install UI dependencies
echo "📦 Installing UI dependencies..."
cd ui && npm install && cd ..
if [ $? -ne 0 ]; then
    echo "❌ Failed to install UI dependencies"
    exit 1
fi

# Copy environment files
echo "📄 Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "ℹ️  .env file already exists"
fi

if [ ! -f "api/.env" ]; then
    cp api/.env.example api/.env
    echo "✅ Created api/.env file"
else
    echo "ℹ️  api/.env file already exists"
fi

# Initialize database
echo "🗄️  Initializing database..."
cd api && npm run db:migrate
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

# Seed database with demo data
echo "🌱 Seeding database with demo data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to seed database (this is optional)"
fi

cd ..

# Make scripts executable
chmod +x scripts/dev.sh
chmod +x scripts/setup.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Run 'npm run dev' or './scripts/dev.sh' to start development servers"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Login with demo credentials: demo / Demo123!"
echo ""
echo "🔗 Useful URLs:"
echo "   • UI: http://localhost:3000"
echo "   • API: http://localhost:3001"
echo "   • API Health: http://localhost:3001/health"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Project overview and setup"
echo "   • ARCHITECTURE.md - System architecture"
echo "   • DEVELOPMENT_PLAN.md - Implementation details"
echo ""