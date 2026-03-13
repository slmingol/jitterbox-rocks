# Music Trivia Game - Complete Setup Guide

## 🎵 Overview

A comprehensive music trivia game with:
- ✅ Daily unique challenges
- ✅ Practice mode with 25+ games
- ✅ Multiple question types (Multiple choice, Audio clips, Text input)
- ✅ Detailed statistics tracking
- ✅ Leaderboard system
- ✅ Admin panel for game creation
- ✅ No time limits - play at your own pace

---

## 📋 Prerequisites

Before you begin, make sure you have installed:

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (Community Edition)
   - Download: https://www.mongodb.com/try/download/community
   - Alternative: Use MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas
   - Verify: `mongod --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

---

## 🚀 Quick Start

### Option 1: Automated Setup (macOS/Linux)

```bash
# Navigate to the project directory
cd music-trivia-game

# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Start MongoDB (in a separate terminal)
mongod --dbpath ~/data/db

# Seed the database
npm run seed

# Start the application
npm run dev
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Install all dependencies (root and client)
npm run install-all

# Or install separately:
npm install              # Backend dependencies
cd client && npm install # Frontend dependencies
```

#### Step 2: Configure Environment

```bash
# Copy environment example file
cp .env.example .env

# Edit .env with your settings
# Default MongoDB URI: mongodb://localhost:27017/music-trivia
```

#### Step 3: Start MongoDB

```bash
# Create data directory (if not exists)
mkdir -p ~/data/db

# Start MongoDB
mongod --dbpath ~/data/db

# Or if using brew on macOS:
brew services start mongodb-community
```

#### Step 4: Seed the Database

```bash
# Seed with 25 pre-built games
npm run seed
```

#### Step 5: Start the Application

```bash
# Start both backend and frontend
npm run dev

# Backend runs on: http://localhost:5000
# Frontend runs on: http://localhost:3000
```

---

## 📁 Project Structure

```
music-trivia-game/
├── server/                 # Backend (Node.js/Express/TypeScript)
│   ├── config/            # Database configuration
│   ├── models/            # Mongoose models (Game, UserStats)
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic
│   ├── data/              # Seed data
│   ├── scripts/           # Utility scripts
│   └── index.ts           # Server entry point
│
├── client/                # Frontend (React/TypeScript)
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── services/     # API client
│       ├── context/      # React context
│       ├── types/        # TypeScript types
│       └── App.tsx       # Main App component
│
├── uploads/              # Audio files (user uploads)
├── package.json          # Root dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

---

## 🎮 How to Use

### For Players:

1. **Login**: Click "Login" and enter a username
2. **Daily Game**: Play today's unique challenge
3. **Practice Mode**: Access all available games
4. **View Stats**: Track your performance and progress
5. **Leaderboard**: See how you rank against others

### For Admins:

1. **Navigate to Admin Panel**: `/admin`
2. **Create a New Game**:
   - Enter title and description
   - Add 10 questions (mix of types)
   - Set difficulty and points
   - Mark as daily game (optional)
3. **Submit**: Game is immediately available

---

## 🎯 Question Types

### 1. Multiple Choice
- 4 options to choose from
- One correct answer
- Example: "Who sang 'Bohemian Rhapsody'?"

### 2. Audio (Name That Tune)
- Listen to audio clip
- Type in song name or artist
- Audio files stored in `/uploads`

### 3. Text Input
- Free-form text answer
- Case-insensitive matching
- Example: "Who was the lead singer of Queen?"

---

## 📊 Scoring System

- **Easy Questions**: 10 points
- **Medium Questions**: 15 points
- **Hard Questions**: 20 points

### Statistics Tracked:

- Total points earned
- Games played
- Overall accuracy
- Current streak (consecutive days)
- Longest streak
- Performance by difficulty
- Performance by question type
- Performance by category

---

## 🛠️ Available Scripts

### Development

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
```

### Database

```bash
npm run seed         # Seed database with 25 games
```

### Production

```bash
npm run build        # Build frontend for production
npm start           # Start production server
```

---

## 🌐 API Endpoints

### Games

- `GET /api/games/daily` - Get today's daily game
- `GET /api/games/:gameId` - Get specific game
- `GET /api/games` - Get all games
- `GET /api/games/random` - Get random game
- `POST /api/games` - Create new game (admin)
- `PUT /api/games/:gameId` - Update game (admin)
- `DELETE /api/games/:gameId` - Delete game (admin)

### Statistics

- `GET /api/stats/:userId` - Get user stats
- `GET /api/stats/:userId/detailed` - Get detailed stats
- `POST /api/stats/record-question` - Record question answer
- `POST /api/stats/complete-game` - Record game completion
- `GET /api/stats/leaderboard` - Get leaderboard
- `GET /api/stats/:userId/rank` - Get user rank

---

## 🎨 Customization

### Adding Audio Files

1. Place audio files in `/uploads` directory
2. Reference them in questions: `/uploads/filename.mp3`
3. Supported formats: MP3, WAV, OGG

### Changing Theme Colors

Edit `/client/src/App.css`:
- Primary color: `#667eea`
- Secondary color: `#764ba2`

### Adding Categories

Categories are dynamic! Simply use new category names when creating questions.

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Make sure MongoDB is running
mongod --dbpath ~/data/db

# Or check if service is running (macOS)
brew services list
```

### Port Already in Use

```bash
# Change ports in .env files:
# Backend: PORT=5001 (in root .env)
# Frontend: Update package.json proxy
```

### Cannot Find Module Error

```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm run install-all
```

---

## 📝 License

ISC

---

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

---

## 🎵 Game Content

The seed data includes 25 pre-built games covering:
- Classic Rock
- 80s Pop
- Hip Hop
- Country
- Jazz & Blues
- Modern Pop
- British Invasion
- R&B
- 90s Alternative
- Disco
- Latin Music
- Heavy Metal
- One-Hit Wonders
- Movie Soundtracks
- Electronic & Dance
- Folk & Acoustic
- Punk Rock
- Reggae & Ska
- Soul Music
- Indie Rock
- Classical Crossover
- 2000s Nostalgia
- Girl Groups
- Guitar Heroes
- Music Video Icons

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check MongoDB connection
4. Verify all dependencies are installed

---

**Enjoy the game! 🎵🎸🎤**
