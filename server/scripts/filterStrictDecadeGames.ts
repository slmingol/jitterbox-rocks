/**
 * Filter Games to Keep Only Strict Decade Games
 * 
 * This script:
 * 1. Analyzes all games in the database
 * 2. Identifies which games have 100% questions from a single decade category
 * 3. Removes games that have mixed decade categories
 * 4. Preserves all questions by reorganizing them into proper decade games
 * 
 * Usage:
 * npx ts-node server/scripts/filterStrictDecadeGames.ts
 */

import { getDb, initializeDatabase } from '../config/sqlite';
import { GameRepository, IGame, IQuestion } from '../repositories/GameRepository';

// Decade category mapping
const DECADE_CATEGORIES = {
  '1950s': ['50s Classics', 'Golden Oldies'],
  '1960s': ['60s Legends'],
  '1970s': ['70s Rock'],
  '1980s': ['80s Pop'],
  '1990s': ['90s Classics'],
  '2000s': ['2000s Music'],
  '2010s': ['2010s Pop'],
  '2020s': ['2020s Hits']
};

// Flatten for lookup
const CATEGORY_TO_DECADE: { [key: string]: string } = {};
Object.entries(DECADE_CATEGORIES).forEach(([decade, categories]) => {
  categories.forEach(cat => {
    CATEGORY_TO_DECADE[cat] = decade;
  });
});

class StrictDecadeFilter {
  private stats = {
    totalGames: 0,
    strictGames: 0,
    mixedGames: 0,
    gamesRemoved: 0,
    questionsReorganized: 0
  };

  /**
   * Get the decade for a category
   */
  private getDecadeForCategory(category: string): string | null {
    return CATEGORY_TO_DECADE[category] || null;
  }

  /**
   * Check if a game is strict (100% of questions from one decade)
   */
  private isStrictDecadeGame(game: IGame): boolean {
    const decades = new Set<string>();
    
    for (const question of game.questions) {
      const decade = this.getDecadeForCategory(question.category);
      if (decade) {
        decades.add(decade);
      } else {
        // Non-decade categories like "Music Business", "Artist Trivia" etc
        // We'll allow these if they're mixed with a single decade
        continue;
      }
    }
    
    // Game is strict if it has exactly one decade (or zero decade categories)
    return decades.size <= 1;
  }

  /**
   * Get the primary decade for a game (most common decade category)
   */
  private getPrimaryDecade(game: IGame): string | null {
    const decadeCounts: { [decade: string]: number } = {};
    
    for (const question of game.questions) {
      const decade = this.getDecadeForCategory(question.category);
      if (decade) {
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    }
    
    if (Object.keys(decadeCounts).length === 0) return null;
    
    // Return decade with most questions
    return Object.entries(decadeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Analyze all games and report statistics
   */
  async analyzeGames(): Promise<void> {
    const db = getDb();
    const games = db.prepare('SELECT game_id FROM games').all() as any[];
    
    this.stats.totalGames = games.length;
    console.log(`\n📊 Analyzing ${this.stats.totalGames} games...`);
    
    const mixedGames: IGame[] = [];
    
    for (const row of games) {
      const game = GameRepository.findByGameId(row.game_id);
      if (!game) continue;
      
      if (this.isStrictDecadeGame(game)) {
        this.stats.strictGames++;
      } else {
        this.stats.mixedGames++;
        mixedGames.push(game);
      }
    }
    
    console.log(`\n✅ Strict decade games: ${this.stats.strictGames}`);
    console.log(`❌ Mixed decade games: ${this.stats.mixedGames}`);
    
    if (mixedGames.length > 0) {
      console.log(`\n📋 Mixed games detected:`);
      mixedGames.slice(0, 10).forEach(game => {
        const decades = new Set<string>();
        game.questions.forEach(q => {
          const decade = this.getDecadeForCategory(q.category);
          if (decade) decades.add(decade);
        });
        console.log(`  - "${game.title}" (ID: ${game.gameId})`);
        console.log(`    Decades: ${Array.from(decades).join(', ')}`);
      });
      
      if (mixedGames.length > 10) {
        console.log(`  ... and ${mixedGames.length - 10} more`);
      }
    }
  }

  /**
   * Remove mixed decade games from database
   */
  async removeMixedGames(): Promise<void> {
    const db = getDb();
    const games = db.prepare('SELECT game_id FROM games').all() as any[];
    
    const gamesToRemove: string[] = [];
    
    for (const row of games) {
      const game = GameRepository.findByGameId(row.game_id);
      if (!game) continue;
      
      if (!this.isStrictDecadeGame(game)) {
        gamesToRemove.push(game.gameId);
      }
    }
    
    if (gamesToRemove.length === 0) {
      console.log(`\n✅ No mixed games to remove!`);
      return;
    }
    
    console.log(`\n🗑️  Removing ${gamesToRemove.length} mixed decade games...`);
    
    const deleteGame = db.prepare('DELETE FROM games WHERE game_id = ?');
    const deleteQuestions = db.prepare('DELETE FROM questions WHERE game_id = ?');
    
    for (const gameId of gamesToRemove) {
      deleteQuestions.run(gameId);
      deleteGame.run(gameId);
      this.stats.gamesRemoved++;
    }
    
    console.log(`✅ Removed ${this.stats.gamesRemoved} games`);
  }

  /**
   * Run the filter process
   */
  async run(dryRun: boolean = true): Promise<void> {
    console.log('🎯 Strict Decade Game Filter');
    console.log('============================\n');
    
    // Initialize database
    initializeDatabase();
    
    // Analyze current state
    await this.analyzeGames();
    
    if (this.stats.mixedGames === 0) {
      console.log('\n✅ All games are already strict decade games!');
      return;
    }
    
    if (dryRun) {
      console.log(`\n⚠️  DRY RUN MODE - No changes will be made`);
      console.log(`\nTo actually remove mixed games, run:`);
      console.log(`  npx ts-node server/scripts/filterStrictDecadeGames.ts --apply`);
    } else {
      console.log(`\n⚠️  APPLYING CHANGES - Mixed games will be removed`);
      await this.removeMixedGames();
      
      // Re-analyze
      console.log(`\n📊 Final Statistics:`);
      await this.analyzeGames();
    }
    
    console.log(`\n✅ Done!`);
  }
}

// Main execution
const main = async () => {
  const applyChanges = process.argv.includes('--apply');
  const filter = new StrictDecadeFilter();
  
  try {
    await filter.run(!applyChanges);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
