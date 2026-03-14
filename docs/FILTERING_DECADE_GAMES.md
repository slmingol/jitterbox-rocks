# Filtering Games to Keep Only Strict Decade Games

This guide explains how to filter your games to keep only those where 100% of questions match their decade category.

## What This Does

The filtering process will:
1. **Analyze** all games in your database
2. **Identify** games where all questions belong to one decade category
3. **Remove** games that have mixed decades
4. **Preserve** all questions by keeping strict decade games

## Prerequisites

1. You must first have games in your database. If your database is empty, run:
   ```bash
   npm run generate:strict-decade-games
   ```
   Or:
   ```bash
   npx ts-node --project tsconfig.server.json server/scripts/generateStrictDecadeGames.ts
   ```

2. Make sure your server dependencies are installed:
   ```bash
   npm install
   ```

## Step-by-Step Process

### Step 1: Check Current Database Status

First, let's see what's currently in your database:

```bash
npx ts-node --project tsconfig.server.json server/scripts/dbStatus.ts
```

This will show:
- Total number of games
- Games by theme
- Sample games
- Question categories

### Step 2: Analyze Games (Dry Run)

Run the filter in dry-run mode to see what would be removed WITHOUT making any changes:

```bash
npx ts-node --project tsconfig.server.json server/scripts/filterStrictDecadeGames.ts
```

This will show you:
- How many games are "strict" (100% questions from one decade)
- How many games are "mixed" (questions from multiple decades)
- Which specific games would be removed
- What decades each mixed game contains

### Step 3: Apply the Filter

If you're happy with the changes, run it again with the `--apply` flag:

```bash
npx ts-node --project tsconfig.server.json server/scripts/filterStrictDecadeGames.ts --apply
```

This will:
- Remove all mixed decade games from the database
- Keep only strict decade games
- Show before/after statistics

### Step 4: Verify Results

Check the database again to confirm:

```bash
npx ts-node --project tsconfig.server.json server/scripts/dbStatus.ts
```

## What Counts as a "Strict Decade Game"?

A game is considered "strict" if:
- **ALL** questions in the game belong to the same decade category
- Decade categories include:
  - `50s Classics` / `Golden Oldies` → 1950s
  - `60s Legends` → 1960s
  - `70s Rock` → 1970s
  - `80s Pop` → 1980s
  - `90s Classics` → 1990s
  - `2000s Music` → 2000s
  - `2010s Pop` → 2010s
  - `2020s Hits` → 2020s

**Note:** Games can have non-decade categories like "Music Business" or "Artist Trivia" mixed in and still be considered strict, as long as all decade-specific categories are from the same decade.

## Example Output

When you run the filter, you might see something like:

```
🎯 Strict Decade Game Filter
============================

📊 Analyzing 150 games...

✅ Strict decade games: 120
❌ Mixed decade games: 30

📋 Mixed games detected:
  - "Billboard Hits Mix" (ID: abc-123)
    Decades: 1980s, 1990s
  - "Rock Through the Ages" (ID: def-456)
    Decades: 1970s, 1980s, 1990s
  ... and 28 more

⚠️  DRY RUN MODE - No changes will be made

To actually remove mixed games, run:
  npx ts-node --project tsconfig.server.json server/scripts/filterStrictDecadeGames.ts --apply
```

## Important Notes

1. **Backup First**: Before applying changes, consider backing up your database:
   ```bash
   cp data/music-trivia.db data/music-trivia.db.backup
   ```

2. **Questions Are Preserved**: Mixed games are removed, but all questions in strict games are kept. If you want to keep questions from mixed games, you'd need to regenerate them into proper decade-specific games first.

3. **Reversible**: If you have a backup, you can always restore it:
   ```bash
   cp data/music-trivia.db.backup data/music-trivia.db
   ```

## Troubleshooting

### "Database is empty"
- Run the game generation scripts first (see Prerequisites)

### "TypeScript errors"
- Make sure you're using `--project tsconfig.server.json`
- Run `npm install` to ensure all dependencies are installed

### "No mixed games found"
- Great! All your games are already strict decade games

## Advanced: Generating Only Strict Games

To avoid mixed games in the future, use the strict decade game generator:

```bash
npx ts-node --project tsconfig.server.json server/scripts/generateStrictDecadeGames.ts
```

This generator creates games where 100% of questions are guaranteed to match the decade category.

## Summary of Commands

```bash
# 1. Check database status
npx ts-node --project tsconfig.server.json server/scripts/dbStatus.ts

# 2. See what would be removed (dry run)
npx ts-node --project tsconfig.server.json server/scripts/filterStrictDecadeGames.ts

# 3. Actually remove mixed games
npx ts-node --project tsconfig.server.json server/scripts/filterStrictDecadeGames.ts --apply

# 4. Check results
npx ts-node --project tsconfig.server.json server/scripts/dbStatus.ts
```

That's it! Your database will now contain only games where all questions perfectly match their respective decade categories.
