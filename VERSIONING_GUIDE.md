# Automatic Versioning Guide

## How It Works

Every push to `main` triggers automatic version bumping based on commit messages. The version is displayed in the lower right corner of the web UI.

## Commit Message Conventions

### 🔴 MAJOR Version Bump (Breaking Changes)
**Current:** `1.0.0` → **New:** `2.0.0`

```bash
# Examples
git commit -m "BREAKING CHANGE: remove deprecated API endpoints"
git commit -m "major: redesign database schema"
```

### 🟡 MINOR Version Bump (New Features)
**Current:** `1.0.0` → **New:** `1.1.0`

```bash
# Examples
git commit -m "feat: add admin panel with game generation"
git commit -m "feature: implement strict decade filtering"
git commit -m "Add user authentication feature"
git commit -m "Created new statistics dashboard"
```

### 🟢 PATCH Version Bump (Fixes & Other)
**Current:** `1.0.0` → **New:** `1.0.1`

```bash
# Examples (default for most commits)
git commit -m "fix: resolve dark mode background issues"
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
git commit -m "style: improve admin panel spacing"
git commit -m "refactor: clean up game repository code"
```

## Workflow

1. **Make changes** → Code your feature/fix
2. **Commit with convention** → Use appropriate prefix
3. **Push to main** → `git push origin main`
4. **Automatic process:**
   - GitHub Action analyzes commit messages
   - Bumps version in `package.json`
   - Creates git tag (e.g., `v1.1.0`)
   - Triggers Docker build with new version
   - Version appears in UI

## Quick Commands

```bash
# Feature (MINOR bump)
git add -A
git commit -m "feat: add new game mode"
git push origin main

# Fix (PATCH bump)
git add -A
git commit -m "fix: correct leaderboard sorting"
git push origin main

# Breaking change (MAJOR bump)
git add -A
git commit -m "BREAKING CHANGE: change API response format"
git push origin main
```

## Make Commands (if using Makefile)

```makefile
# In your Makefile, add:

.PHONY: release-patch release-minor release-major

release-patch:
	@echo "🔧 Creating patch release (bug fixes)"
	git add -A
	@read -p "Commit message: " msg; \
	git commit -m "fix: $$msg" && git push origin main

release-minor:
	@echo "✨ Creating minor release (new features)"
	git add -A
	@read -p "Commit message: " msg; \
	git commit -m "feat: $$msg" && git push origin main

release-major:
	@echo "💥 Creating major release (breaking changes)"
	git add -A
	@read -p "Commit message: " msg; \
	git commit -m "BREAKING CHANGE: $$msg" && git push origin main
```

## Usage with Make

```bash
# Patch release (1.0.0 → 1.0.1)
make release-patch
# Enter: "resolve admin panel input bug"

# Minor release (1.0.0 → 1.1.0)
make release-minor
# Enter: "add decade-based game filtering"

# Major release (1.0.0 → 2.0.0)
make release-major
# Enter: "redesign game API"
```

## Checking Version

```bash
# View current version
cat package.json | grep version

# View version in UI
# Look at lower right corner: v1.1.0

# View git tags
git tag -l

# View latest tag
git describe --tags --abbrev=0
```

## Skip Auto-Versioning

If you need to push without triggering version bump:

```bash
git commit -m "docs: update README [skip ci]"
git push origin main
```

The `[skip ci]` flag prevents the workflow from running.
