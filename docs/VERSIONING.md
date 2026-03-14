# Music Trivia Game - Versioning Guide

## Current Version

The application version is managed in [package.json](package.json) using semantic versioning (semver).

**Current Version:** `1.0.0`

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): Add functionality in a backward compatible manner
- **PATCH** version (0.0.X): Backward compatible bug fixes

## Version Display

The version number is displayed in:

1. **Web UI**: Lower right corner of all pages (translucent text)
2. **API Health Check**: `GET /api/health` includes version
3. **API Version Endpoint**: `GET /api/version` returns `{ "version": "1.0.0" }`
4. **Docker Images**: Tagged with version number

## How to Update Version

### 1. Update package.json

```bash
# Update manually or use npm version command
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Rebuild and Deploy

The version is automatically picked up from `package.json` by:

- Backend API (`/api/version` endpoint)
- Frontend UI (version display component)
- Docker images (tagged with version)

```bash
# Docker will automatically use the new version
./scripts/docker-start.sh
```

### 3. Docker Image Tags

Docker images are automatically tagged with the version:

**Production:**
- `jitterbox-rocks-backend:1.0.0`
- `jitterbox-rocks-frontend:1.0.0`

**Development:**
- `jitterbox-rocks-backend:1.0.0-dev`
- `jitterbox-rocks-frontend:1.0.0-dev`

### 4. Override Version (Optional)

You can override the version for Docker builds:

```bash
VERSION=2.0.0 docker compose up --build
```

## Version History

### 1.0.0 (Initial Release)
- ✅ SQLite database implementation
- ✅ 25 pre-seeded trivia games
- ✅ Daily game mode
- ✅ Practice mode
- ✅ User statistics tracking
- ✅ Leaderboard
- ✅ Admin panel
- ✅ Docker containerization
- ✅ Version display in UI

## Release Checklist

When preparing a new release:

1. [ ] Update version in `package.json`
2. [ ] Update version history in this file
3. [ ] Test all features
4. [ ] Build Docker images: `docker compose build`
5. [ ] Tag git commit: `git tag v1.0.0`
6. [ ] Push tag: `git push origin v1.0.0`
7. [ ] Create GitHub release (if applicable)
8. [ ] Deploy to production

## Version Display Component

Location: [client/src/components/VersionDisplay.tsx](client/src/components/VersionDisplay.tsx)

The version is fetched from the backend API and displayed as translucent text in the lower right corner of all pages.

## Backend Version Endpoint

Location: [server/index.ts](server/index.ts)

```typescript
// Version is read from package.json
const VERSION = require('../package.json').version;

// Endpoint
app.get('/api/version', (req, res) => {
  res.json({ version: VERSION });
});
```
