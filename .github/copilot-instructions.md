# Jitterbox Rocks - Copilot Agent Onboarding

## Repository Overview

**Purpose**: Music trivia game web application with daily challenges, practice mode, user statistics, and admin management interface. Uses Billboard Hot 100 chart data for trivia questions.

**Type**: Full-stack web application (React + Node.js + SQLite)  
**Size**: ~63MB total, 43 TypeScript files  
**Runtime**: Node.js 18.x (tested on v25.6.1), npm 11.x  
**Database**: SQLite 3 (file-based, no server required)

### Tech Stack
- **Frontend**: React 18.2 + TypeScript 4.9 + React Router 6 + date-fns
- **Backend**: Node.js + Express 4 + TypeScript 5.2 + better-sqlite3
- **Build Tools**: react-scripts 5.0.1, ts-node, nodemon, concurrently
- **Deployment**: Docker (multi-stage builds), Nginx (production frontend), GitHub Container Registry
- **CI/CD**: GitHub Actions (version bumping, Docker builds, image cleanup)

## Build & Development Commands

### Critical: Always Run In Order

1. **Initial Setup** (first time only):
```bash
npm install                    # Install root dependencies (takes ~30s)
cd client && npm install       # Install frontend dependencies (takes ~45s)
cd ..
```
OR use the helper: `npm run install-all`

2. **Development Server** (both frontend + backend with hot reload):
```bash
npm run dev
# Runs concurrently: backend on :5000, frontend on :3000
# Backend uses nodemon (watches server/*.ts)
# Frontend uses react-scripts (watches client/src/*.tsx)
# Takes ~10s to start both servers
```

3. **Build for Production**:
```bash
cd client && npm run build     # Creates optimized build in client/build/
# Takes ~45-60s, outputs to client/build/
# Warnings about React Hooks dependencies are EXPECTED and safe to ignore
```

4. **Backend Only**:
```bash
npm run server                 # Starts backend with nodemon on :5000
```

5. **Frontend Only**:
```bash
npm run client                 # Starts React dev server on :3000
```

### Database Management

**IMPORTANT**: SQLite database files are in `data/` and are `.gitignore`d. The database is created automatically on first run.

- **Location**: `data/music-trivia.db` (created automatically)
- **Seed Data**: `npm run generate-billboard-games` (generates games from Billboard data)
- **Migration**: Database schema is initialized in `server/config/sqlite.ts` on startup
- **Backup**: Admin panel has export/import functionality (100MB file upload limit)

### Docker Commands

**Production** (Recommended for testing deployments):
```bash
./docker-start.sh              # Interactive menu, choose option 1 for production
# OR manually:
docker compose up --build -d   # Builds images, starts containers
docker compose logs -f         # View logs
docker compose down            # Stop and remove containers
```

**Development** (Hot reload):
```bash
./docker-start.sh              # Choose option 2 for development mode
# OR manually:
docker compose -f docker-compose.dev.yml up --build -d
```

**IMPORTANT Docker Notes**:
- Production uses `docker-compose.yml` (optimized builds, Nginx serves frontend)
- Development uses `docker-compose.dev.yml` (volume mounts, dev servers)
- ARM builds only run for version tags (v*) to speed up CI - regular commits build amd64 only
- Images are pushed to `ghcr.io/slmingol/jitterbox-rocks-{backend|frontend}:latest`

## Project Architecture

### Directory Structure
```
/
├── .github/workflows/          # CI/CD pipelines
│   ├── docker-build.yml       # Builds/pushes Docker images on push to main or tags
│   ├── version-bump.yml       # Auto-bumps version based on commit messages
│   └── cleanup-images.yml     # Cleans old container images
├── client/                    # React frontend (TypeScript)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Header, ThemeToggle, VersionDisplay
│   │   ├── context/          # UserContext, ThemeContext
│   │   ├── pages/            # AdminPanel, DailyGame, GamePlay, Home, Leaderboard, PracticeMode, Statistics
│   │   ├── services/         # API calls (api.ts)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main app component with routing
│   │   └── index.tsx         # Entry point
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # Frontend TypeScript config (React JSX, ES5 target)
├── server/                    # Node.js backend (TypeScript)
│   ├── config/               # sqlite.ts - database initialization
│   ├── controllers/          # adminController, gamesController, statsController
│   ├── data/                 # Billboard song data (JSON)
│   ├── models/               # Database models
│   ├── repositories/         # GameRepository (uses getDb() for hot-reload support)
│   ├── routes/               # admin, games, stats routes
│   ├── scripts/              # Data generation scripts
│   ├── services/             # autocompleteService (29,680 songs indexed)
│   └── index.ts              # Express server entry point
├── data/                      # SQLite database storage (gitignored)
├── uploads/temp/              # Temporary file uploads (database imports)
├── package.json               # Root package (backend dependencies + scripts)
├── tsconfig.json              # Backend TypeScript config (CommonJS, ES2020)
├── tsconfig.server.json       # Server-specific TS config
├── nodemon.json               # Nodemon config (watches server/*.ts)
├── nginx.conf                 # Production Nginx config (100MB upload limit)
├── Dockerfile.backend         # Multi-stage backend build
├── Dockerfile.frontend        # Multi-stage frontend build (React + Nginx)
└── docker-compose*.yml        # Docker Compose configurations
```

### Key Configuration Files

- **tsconfig.json**: Backend compilation (target ES2020, CommonJS modules, outputs to `dist/`)
- **client/tsconfig.json**: Frontend compilation (React JSX, ES5 target, no emit - handled by react-scripts)
- **nodemon.json**: Watches `server/**/*.ts`, ignores `*.spec.ts`, runs via ts-node
- **nginx.conf**: Frontend proxy, sets `client_max_body_size 100M` for database imports
- **.env.example**: Required env vars (PORT, NODE_ENV - MONGODB_URI is legacy, not used)

### Database Architecture

**CRITICAL**: Uses SQLite via `better-sqlite3` (synchronous), NOT MongoDB despite .env.example legacy entries.

- **Connection**: `server/config/sqlite.ts` exports `getDb()` for hot-reload support
- **Repository Pattern**: `server/repositories/GameRepository.ts` uses `getDb().prepare()` for all queries
- **Schema**: Auto-initialized on startup (games, questions, user_stats tables)
- **Hot Reload**: Database can be swapped via admin panel import without restart using `reloadDatabase()`

## CI/CD & Validation

### Automatic Version Bumping

**IMPORTANT**: Version bumps trigger automatically on push to `main` based on commit message prefixes:

- **MAJOR** (1.0.0 → 2.0.0): `BREAKING CHANGE:` or `major:`
- **MINOR** (1.0.0 → 1.1.0): `feat:`, `feature:`, or keywords like "Add", "Created"
- **PATCH** (1.0.0 → 1.0.1): `fix:`, `perf:`, `docs:`, `chore:`, or any other prefix

**Workflow**: `.github/workflows/version-bump.yml` (runs on main push, skips if package.json changed)
- Updates `package.json` version
- Creates git tag (e.g., `v1.2.0`)
- Conditionally adds package-lock.json only if it exists

### Docker Build Pipeline

**Workflow**: `.github/workflows/docker-build.yml` (runs on main push, tags, PRs)
- Builds backend and frontend in parallel (matrix strategy)
- **Platform-specific**: amd64 for all commits, arm64 ONLY for version tags (v*)
- Pushes to `ghcr.io/slmingol/jitterbox-rocks-{backend|frontend}:latest`
- Uses GitHub Actions cache (GHA) for layer caching
- Takes ~3-5 minutes for amd64-only, ~15-20 minutes with arm64

### Pre-Commit Checks

**NO pre-commit hooks are configured** - validation happens in CI only.

### Known Issues & Workarounds

1. **ESLint Warnings**: React Hook dependency warnings are EXPECTED in GamePlay.tsx (uses refs pattern for keyboard shortcuts)
2. **TODO Comments**: Authentication middleware is planned but not required for functionality (see `server/routes/admin.ts`)
3. **Multer Deprecation**: Multer 1.x has known vulnerabilities but is stable for this use case (database file uploads)
4. **Database Hot Reload**: GameRepository MUST use `getDb()` not direct `db` import to support hot-reload after database import

## Common Tasks

### Adding a New Page
1. Create component in `client/src/pages/YourPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `client/src/components/Header.tsx` (if needed)
4. Follow theme-aware styling pattern: `import { useTheme } from '../context/ThemeContext'`

### Adding a New API Endpoint
1. Add route handler in `server/routes/` (games.ts, stats.ts, or admin.ts)
2. If complex logic, create controller in `server/controllers/`
3. Update `server/index.ts` if creating new route file
4. Use `getDb()` from `server/config/sqlite.ts` for database queries

### Database Schema Changes
1. Edit initialization in `server/config/sqlite.ts` (initializeDatabase function)
2. No migration system - database is recreated on first run or can be exported/imported

### Docker Changes
1. **Backend**: Edit `Dockerfile.backend`, rebuild with `docker compose build backend`
2. **Frontend**: Edit `Dockerfile.frontend`, rebuild with `docker compose build frontend`
3. **Always test locally before pushing**: `docker compose up --build`

## Validation Steps

Before pushing changes, ALWAYS:

1. **Run build**: `cd client && npm run build` (should complete without errors in ~60s)
2. **Test backend**: `npm run server` (should start on :5000, check `/api/health`)
3. **Test frontend**: `npm run client` (should start on :3000, loads without console errors)
4. **Check Docker**: `docker compose up --build` (both containers should start and be healthy)
5. **Verify version commit**: Use proper prefix (feat:, fix:, etc.) for automatic version bumping

## Trust These Instructions

These instructions have been validated by running commands in fresh environments. If you encounter discrepancies:
1. Check if you're in the correct directory (root vs client/)
2. Verify Node.js version matches (18.x minimum)
3. Ensure dependencies are installed (`npm install` in both root and client/)
4. Only search for additional information if these instructions are incomplete or produce errors

## Quick Reference

**Start Development**: `npm run dev` (both servers)  
**Build Production**: `cd client && npm run build`  
**Docker Production**: `./docker-start.sh` → option 1  
**Docker Dev**: `./docker-start.sh` → option 2  
**Backend Port**: 5000  
**Frontend Port**: 3000 (dev), 5432 (production Docker)  
**Database**: SQLite at `data/music-trivia.db`  
**Logs**: `docker compose logs -f` or check terminal for dev servers
