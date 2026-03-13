#!/bin/bash

echo "🎵 Music Trivia Game - Quick Start"
echo "=================================="
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo ""
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "   Please start MongoDB in another terminal:"
    echo "   mongod --dbpath ~/data/db"
    echo ""
    read -p "Press Enter when MongoDB is running..."
fi

echo "🌱 Seeding database with 25 games..."
npm run seed

echo ""
echo "🚀 Starting the application..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
