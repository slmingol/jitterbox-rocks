/**
 * Database Status and Management Script
 * 
 * Check database contents and manage games
 * 
 * Usage:
 *   npx ts-node server/scripts/dbStatus.ts
 */

import { getDb, initializeDatabase } from '../config/sqlite';
import { GameRepository } from '../repositories/GameRepository';

const checkDatabase = () => {
  console.log('🎮 Jitterbox Rocks - Database Status\n');
  console.log('=====================================\n');
  
  // Initialize database
  initializeDatabase();
  
  const db = getDb();
  
  // Count games
  const gamesCount = db.prepare('SELECT COUNT(*) as count FROM games').get() as any;
  console.log(`📊 Total Games: ${gamesCount.count}`);
  
  if (gamesCount.count === 0) {
    console.log('\n⚠️  Database is empty!\n');
    console.log('To generate strict decade games, run:');
    console.log('  npx ts-node server/scripts/generateStrictDecadeGames.ts\n');
    return;
  }
  
  // Count questions
  const questionsCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as any;
  console.log(`❓ Total Questions: ${questionsCount.count}\n`);
  
  // Show game breakdown by theme
  const themes = db.prepare(`
    SELECT theme, COUNT(*) as count 
    FROM games 
    GROUP BY theme 
    ORDER BY count DESC
  `).all() as any[];
  
  console.log('📁 Games by Theme:');
  themes.forEach(t => {
    console.log(`  - ${t.theme}: ${t.count} games`);
  });
  
  // Check for daily games
  const dailyCount = db.prepare('SELECT COUNT(*) as count FROM games WHERE is_daily = 1').get() as any;
  console.log(`\n📅 Daily Games: ${dailyCount.count}`);
  
  // Sample games
  const sampleGames = db.prepare(`
    SELECT game_id, title, date, theme 
    FROM games 
    LIMIT 5
  `).all() as any[];
  
  if (sampleGames.length > 0) {
    console.log('\n📋 Sample Games:');
    sampleGames.forEach(g => {
      console.log(`  - "${g.title}" (${g.theme}) [${g.date}]`);
    });
  }
  
  // Analyze question categories
  const categories = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM questions 
    GROUP BY category 
    ORDER BY count DESC 
    LIMIT 15
  `).all() as any[];
  
  if (categories.length > 0) {
    console.log('\n🏷️  Top Question Categories:');
    categories.forEach(c => {
      console.log(`  - ${c.category}: ${c.count} questions`);
    });
  }
  
  console.log('\n=====================================');
  console.log('\n💡 Available Commands:');
  console.log('  • Check for mixed games:');
  console.log('    npx ts-node server/scripts/filterStrictDecadeGames.ts');
  console.log('  • Remove mixed games:');
  console.log('    npx ts-node server/scripts/filterStrictDecadeGames.ts --apply');
  console.log('  • Generate new decade games:');
  console.log('    npx ts-node server/scripts/generateStrictDecadeGames.ts\n');
};

// Run the check
try {
  checkDatabase();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
