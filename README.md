<p align="center">
  <img src="logo.png" alt="Jitterbox Rocks Logo" width="600"/>
</p>

# Jitterbox Rocks

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/slmingol/jitterbox-rocks)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node.js-18.x-green.svg)](https://nodejs.org/)

A comprehensive music trivia game featuring daily challenges, practice mode, and detailed user statistics.

## Features

- **Multiple Question Types**: Multiple choice, name that tune (audio samples), and text input
- **Daily Games**: Unique 10-question game each day
- **Practice Mode**: Access to all previous games
- **User Statistics**: Comprehensive tracking of performance
- **Admin Interface**: Create and manage games
- **No Time Limits**: Take as long as you need to answer
- **⌨️ Keyboard Navigation**: Full keyboard support for faster gameplay (see [KEYBOARD_SHORTCUTS.md](KEYBOARD_SHORTCUTS.md))

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express with TypeScript
- **Database**: SQLite (better-sqlite3)
- **Audio**: MP3/WAV support

## Getting Started

📖 **[See DOCKER_GUIDE.md for detailed Docker documentation](DOCKER_GUIDE.md)**

### Option 1: Docker (Recommended)

The easiest way to run the application with all dependencies:

```bash
./docker-start.sh
```

Choose production mode (1) for optimized builds or development mode (2) for hot reload.

**Docker Commands:**
- Start: `docker compose up -d` (production) or `docker compose -f docker-compose.dev.yml up -d` (dev)
- Stop: `docker compose down`
- View logs: `docker compose logs -f`
- Rebuild: `docker compose up --build`

**What's included:**
- SQLite database (file-based, no server required)
- Backend API server
- Frontend React app
- 250 pre-generated games with Billboard Hot 100 data

### Option 2: Local Development

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Generate games (first time only):
   ```bash
   npm run generate-billboard-games
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

7. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Project Structure

```
music-trivia-game/
├── server/              # Backend code
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── controllers/    # Route controllers
│   ├── services/       # Business logic
│   └── index.ts        # Server entry point
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API calls
│   │   └── types/      # TypeScript types
└── uploads/            # Audio files storage
```

## Game Structure

Each game consists of 10 questions with three types:
1. **Multiple Choice**: Choose from 4 options
2. **Name That Tune**: Listen to audio and identify the song/artist
3. **Text Input**: Type in the answer

## Admin Features

- Create new games
- Upload audio files
- Edit existing questions
- View game statistics
