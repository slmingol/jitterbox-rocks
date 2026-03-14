#!/bin/bash

echo "🐳 Music Trivia Game - Docker Setup & Start"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is available"
echo ""

# Read version from package.json
export VERSION=$(node -p "require('./package.json').version")
echo "📦 Version: $VERSION"
echo ""

# Create data directory if it doesn't exist
mkdir -p data

# Ask for mode
echo "Select mode:"
echo "1) Production (optimized builds)"
echo "2) Development (hot reload)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting in PRODUCTION mode..."
        echo ""
        
        # Build and start services
        docker compose up --build -d
        
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        
        # Seed the database (run inside backend container)
        echo "🌱 Seeding database with 25 games..."
        docker compose exec backend npm run seed
        
        echo ""
        echo "✅ Music Trivia Game is running!"
        echo ""
        echo "🌐 Access the application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5000"
        echo "   Database: SQLite (./data/music-trivia.db)"
        echo ""
        echo "📊 View logs:"
        echo "   docker compose logs -f"
        echo ""
        echo "🛑 Stop the application:"
        echo "   docker compose down"
        echo ""
        ;;
    2)
        echo ""
        echo "🔧 Starting in DEVELOPMENT mode..."
        echo ""
        
        # Build and start services
        docker compose -f docker-compose.dev.yml up --build -d
        
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        
        # Seed the database
        echo "🌱 Seeding database with 25 games..."
        docker compose -f docker-compose.dev.yml exec backend npm run seed
        
        echo ""
        echo "✅ Music Trivia Game is running in DEV mode!"
        echo ""
        echo "🌐 Access the application:"
        echo "   Frontend: http://localhost:3000 (with hot reload)"
        echo "   Backend:  http://localhost:5000 (with auto-restart)"
        echo "   Database: SQLite (./data/music-trivia.db)"
        echo ""
        echo "📊 View logs:"
        echo "   docker compose -f docker-compose.dev.yml logs -f"
        echo ""
        echo "🛑 Stop the application:"
        echo "   docker compose -f docker-compose.dev.yml down"
        echo ""
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Show container status
echo "📦 Container Status:"
docker compose ps
