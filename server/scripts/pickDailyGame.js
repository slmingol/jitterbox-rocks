#!/usr/bin/env node

/**
 * Daily Game Picker
 * 
 * This script picks a random game from the pool of unused games
 * and assigns it as the daily game for tomorrow.
 * 
 * Run this script daily at midnight via cron:
 * 0 0 * * * cd /path/to/jitterbox-rocks && node server/scripts/pickDailyGame.js
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path - adjust if needed
const dbPath = process.env.DB_PATH || '/app/data/music-trivia.db';
const db = new Database(dbPath);

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Pick and assign a daily game for the specified date
 */
function pickDailyGame(dateStr = null) {
  const targetDate = dateStr || getTomorrowDate();
  
  console.log('🎯 Daily Game Picker');
  console.log('===================');
  console.log(`Target date: ${targetDate}\n`);

  // Check if a daily game already exists for this date
  const existing = db.prepare(`
    SELECT game_id, title, theme 
    FROM games 
    WHERE is_daily = 1 AND date = ?
  `).get(targetDate);

  if (existing) {
    console.log('✅ Daily game already exists for this date:');
    console.log(`   Title: ${existing.title}`);
    console.log(`   Theme: ${existing.theme}`);
    console.log('\nNo action needed.');
    return existing;
  }

  // Count total games and how many are already used as daily games
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_daily = 1 THEN 1 ELSE 0 END) as used_daily
    FROM games
  `).get();

  console.log(`Total games: ${stats.total}`);
  console.log(`Already used as daily: ${stats.used_daily}`);
  console.log(`Available: ${stats.total - stats.used_daily}\n`);

  if (stats.used_daily >= stats.total) {
    console.error('❌ ERROR: All games have been used as daily games!');
    console.error('   You need to either:');
    console.error('   1. Generate more games');
    console.error('   2. Reset some games to be reusable');
    process.exit(1);
  }

  // Pick a random game that hasn't been used as a daily game yet
  const selectedGame = db.prepare(`
    SELECT game_id, title, theme, description
    FROM games 
    WHERE is_daily = 0 
    ORDER BY RANDOM() 
    LIMIT 1
  `).get();

  if (!selectedGame) {
    console.error('❌ ERROR: Could not find an available game');
    process.exit(1);
  }

  // Update the game to be the daily game for the target date
  db.prepare(`
    UPDATE games 
    SET is_daily = 1, date = ? 
    WHERE game_id = ?
  `).run(targetDate, selectedGame.game_id);

  console.log('✅ Successfully picked daily game:');
  console.log(`   Game ID: ${selectedGame.game_id}`);
  console.log(`   Title: ${selectedGame.title}`);
  console.log(`   Theme: ${selectedGame.theme}`);
  console.log(`   Date: ${targetDate}`);
  console.log('\n🎉 Daily game set successfully!');

  return selectedGame;
}

// Main execution
try {
  // Check if a specific date was provided as argument
  const targetDate = process.argv[2];
  pickDailyGame(targetDate);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
