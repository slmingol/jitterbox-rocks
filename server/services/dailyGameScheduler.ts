import * as cron from 'node-cron';
import Database from 'better-sqlite3';
import { getDb } from '../config/sqlite';

interface GameRow {
  game_id: string;
  title: string;
  theme: string;
  description?: string;
}

interface StatsRow {
  total: number;
  used_daily: number;
}

/**
 * Daily Game Scheduler Service
 * Automatically picks a daily game at midnight each day
 */
class DailyGameScheduler {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Get tomorrow's date in YYYY-MM-DD format
   */
  private getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Pick and assign a daily game for the specified date
   */
  pickDailyGame(dateStr: string | null = null): { success: boolean; game?: any; message: string } {
    try {
      const db = getDb();
      const targetDate = dateStr || this.getTomorrowDate();
      
      console.log(`[DailyGameScheduler] Picking daily game for ${targetDate}`);

      // Check if a daily game already exists for this date
      const existing = db.prepare(`
        SELECT game_id, title, theme 
        FROM games 
        WHERE is_daily = 1 AND date = ?
      `).get(targetDate) as GameRow | undefined;

      if (existing) {
        console.log(`[DailyGameScheduler] Daily game already exists for ${targetDate}: ${existing.title}`);
        return {
          success: true,
          game: existing,
          message: 'Daily game already exists for this date'
        };
      }

      // Count available games
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_daily = 1 THEN 1 ELSE 0 END) as used_daily
        FROM games
      `).get() as StatsRow;

      console.log(`[DailyGameScheduler] Available games: ${stats.total - stats.used_daily} / ${stats.total}`);

      if (stats.used_daily >= stats.total) {
        console.error('[DailyGameScheduler] ERROR: All games have been used as daily games!');
        return {
          success: false,
          message: 'All games have been used as daily games'
        };
      }

      // Pick a random game that hasn't been used as a daily game yet
      const selectedGame = db.prepare(`
        SELECT game_id, title, theme, description
        FROM games 
        WHERE is_daily = 0 
        ORDER BY RANDOM() 
        LIMIT 1
      `).get() as GameRow | undefined;

      if (!selectedGame) {
        console.error('[DailyGameScheduler] ERROR: Could not find an available game');
        return {
          success: false,
          message: 'Could not find an available game'
        };
      }

      // Update the game to be the daily game for the target date
      db.prepare(`
        UPDATE games 
        SET is_daily = 1, date = ? 
        WHERE game_id = ?
      `).run(targetDate, selectedGame.game_id);

      console.log(`[DailyGameScheduler] ✅ Successfully picked daily game for ${targetDate}:`);
      console.log(`[DailyGameScheduler]    Title: ${selectedGame.title}`);
      console.log(`[DailyGameScheduler]    Theme: ${selectedGame.theme}`);

      return {
        success: true,
        game: selectedGame,
        message: 'Daily game set successfully'
      };
    } catch (error) {
      console.error('[DailyGameScheduler] Error picking daily game:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check and fill the next 7 days of daily games
   * This ensures we have games scheduled even if the server was down
   */
  ensureNextWeekGames(): void {
    console.log('[DailyGameScheduler] Checking next 7 days for missing daily games...');
    
    const today = new Date();
    let gamesAdded = 0;
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      const result = this.pickDailyGame(dateStr);
      if (result.success && result.message === 'Daily game set successfully') {
        gamesAdded++;
      }
    }
    
    if (gamesAdded > 0) {
      console.log(`[DailyGameScheduler] ✅ Filled in ${gamesAdded} missing daily game(s)`);
    } else {
      console.log('[DailyGameScheduler] ✅ All games for the next 7 days are already set');
    }
  }

  /**
   * Start the scheduler - runs at midnight every day
   */
  start(): void {
    if (this.cronJob) {
      console.log('[DailyGameScheduler] Scheduler is already running');
      return;
    }

    // Schedule to run at midnight every day (0 0 * * *)
    this.cronJob = cron.schedule('0 0 * * *', () => {
      console.log('[DailyGameScheduler] Running scheduled daily game picker...');
      this.ensureNextWeekGames();
    }, {
      timezone: 'America/New_York' // Adjust to your timezone
    });

    console.log('[DailyGameScheduler] ✅ Daily game scheduler started (runs at midnight)');

    // Also check the next week immediately on startup
    console.log('[DailyGameScheduler] Checking next week\'s games on startup...');
    this.ensureNextWeekGames();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('[DailyGameScheduler] Scheduler stopped');
    }
  }

  /**
   * Check scheduler status
   */
  isRunning(): boolean {
    return this.cronJob !== null;
  }
}

// Export singleton instance
export const dailyGameScheduler = new DailyGameScheduler();
