#!/bin/bash

echo "🎵 Music Trivia Game - Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please install MongoDB: https://www.mongodb.com/try/download/community"
    echo "   Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB is installed"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install-all

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running:"
echo "   mongod --dbpath ~/data/db"
echo ""
echo "2. Seed the database with initial games:"
echo "   npm run seed"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
