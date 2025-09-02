#!/bin/bash

# Medical Bills Management System - Development Script
# This script starts both the API and UI in development mode

echo "🚀 Starting Medical Bills Management System in development mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "api/node_modules" ] || [ ! -d "ui/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Copy environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
fi

if [ ! -f "api/.env" ]; then
    echo "📄 Creating api/.env file from template..."
    cp api/.env.example api/.env
fi

# Initialize database if it doesn't exist
if [ ! -f "api/database.sqlite" ]; then
    echo "🗄️  Initializing database..."
    cd api && npm run db:migrate && npm run db:seed && cd ..
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize database"
        exit 1
    fi
fi

echo "✅ Setup complete! Starting development servers..."
echo ""
echo "🔗 API will be available at: http://localhost:3001"
echo "🌐 UI will be available at: http://localhost:3000"
echo "🎯 Demo credentials: demo / Demo123!"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both API and UI concurrently
npm run dev