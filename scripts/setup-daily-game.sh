#!/bin/bash

# Setup script for daily game automation

echo "🎮 Jitterbox Rocks - Daily Game Automation Setup"
echo "================================================"
echo ""

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$PROJECT_DIR/server/scripts/pickDailyGame.js"

echo "Project directory: $PROJECT_DIR"
echo ""

# Check if podman is installed
if ! command -v podman &> /dev/null; then
    echo "❌ Error: podman is not installed or not in PATH"
    exit 1
fi

echo "✅ Podman found"

# Check if the container is running
if ! podman ps | grep -q jitterbox-rocks-backend-dev; then
    echo "⚠️  Warning: Backend container is not running"
    echo "   Please start it first with: podman-compose up -d"
    exit 1
fi

echo "✅ Backend container is running"
echo ""

# Test the script
echo "Testing the daily game picker script..."
if podman exec jitterbox-rocks-backend-dev node /app/server/scripts/pickDailyGame.js 2026-03-16; then
    echo ""
    echo "✅ Script test successful!"
else
    echo ""
    echo "❌ Script test failed"
    exit 1
fi

echo ""
echo "================================================"
echo "Setup Options:"
echo "================================================"
echo ""
echo "Option 1: Add to crontab (runs at midnight daily)"
echo "   Run: crontab -e"
echo "   Add: 0 0 * * * cd $PROJECT_DIR && podman exec jitterbox-rocks-backend-dev node /app/server/scripts/pickDailyGame.js >> /tmp/daily-game-picker.log 2>&1"
echo ""
echo "Option 2: Create a Launch Agent (macOS)"
echo "   See DAILY_GAME_SETUP.md for detailed instructions"
echo ""
echo "Manual run:"
echo "   podman exec jitterbox-rocks-backend-dev node /app/server/scripts/pickDailyGame.js"
echo ""
