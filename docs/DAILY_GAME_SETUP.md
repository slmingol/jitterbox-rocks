# Daily Game Automation

## Overview

The daily game picker runs **automatically within the application** - no system cron jobs needed! When the backend server starts, it automatically:

1. **Looks ahead 7 days** and fills in any missing daily games
2. Schedules a task to run at midnight every day
3. Each day at midnight, it checks the next 7 days again
4. If the server was down for a few days, it automatically backfills when it restarts

## Current Status

✅ **Scheduler**: Running in-app (automatic)
✅ **Next 7 days**: All games scheduled
✅ **Backfill**: Automatically fills gaps when server restarts

## How It Works

**On Startup:**
- Checks the next 7 days (today + 6 more days)
- Fills in any missing dates with random unused games
- Example: If server was down Monday-Wednesday, it fills those in on Thursday

**Daily at Midnight:**
- Runs the same 7-day check
- Ensures you always have a week of games scheduled ahead

**Benefits:**
- ✅ No manual intervention needed
- ✅ Resilient to server downtime
- ✅ Always have games scheduled a week in advance
- ✅ Each date gets a unique game that stays with that date forever

## Manual Game Selection

If you want to manually pick a game for a specific date:

```bash
# Pick tomorrow's game manually
podman exec jitterbox-rocks-backend-dev node /app/server/scripts/pickDailyGame.js

# Pick a game for a specific date (YYYY-MM-DD)
podman exec jitterbox-rocks-backend-dev node /app/server/scripts/pickDailyGame.js 2026-12-25
```

## Troubleshooting

### Check if script ran successfully
```bash
tail -f /tmp/daily-game-picker.log
```

### Verify daily games are set
```bash
podman exec jitterbox-rocks-backend-dev node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/music-trivia.db');
const games = db.prepare('SELECT date, title, theme FROM games WHERE is_daily = 1 ORDER BY date DESC LIMIT 10').all();
console.log('Recent daily games:');
games.forEach(g => console.log(\`  \${g.date}: \${g.title} (\${g.theme})\`));
"
```

### Check how many games are still available
```bash
podman exec jitterbox-rocks-backend-dev node -e "
const Database = require('better-sqlite3');
const db = new Database('/app/data/music-trivia.db');
const stats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_daily = 1 THEN 1 ELSE 0 END) as used FROM games').get();
console.log('Total games:', stats.total);
console.log('Used as daily:', stats.used);
console.log('Available:', stats.total - stats.used);
"
```

## Important Notes

- **Game Pool**: You have 1,500 games, enough for over 4 years of daily games
- **No Reuse**: Each game can only be used once as a daily game
- **Permanent Association**: Once a date has a game assigned, it cannot be changed
- **Container Must Be Running**: The Podman container must be running for the script to work

## Future Considerations

When you're running low on games (< 100 remaining), you may want to:
1. Generate more games
2. Reset old games to be reusable (update `is_daily = 0` for games older than a certain date)
