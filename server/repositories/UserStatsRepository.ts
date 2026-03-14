import { getDb } from '../config/sqlite';

export interface IUserStats {
  username: string;
  totalGamesPlayed: number;
  totalPoints: number;
  totalCorrect: number;
  totalQuestions: number;
  currentStreak: number;
  longestStreak: number;
  lastGameDate?: string;
  categoryStats: Map<string, { correct: number; total: number }>;
  difficultyStats: Map<string, { correct: number; total: number }>;
  questionTypeStats: Map<string, { correct: number; total: number }>;
}

export class UserStatsRepository {
  // Create or get user stats
  static findOrCreate(username: string): IUserStats {
    let user = getDb().prepare(`
      SELECT * FROM user_stats WHERE username = ?
    `).get(username) as any;
    
    if (!user) {
      getDb().prepare(`
        INSERT INTO user_stats (username) VALUES (?)
      `).run(username);
      
      user = getDb().prepare(`
        SELECT * FROM user_stats WHERE username = ?
      `).get(username) as any;
    }
    
    // Get category stats
    const categoryStats = new Map();
    const categories = getDb().prepare(`
      SELECT category, correct, total FROM category_stats WHERE username = ?
    `).all(username) as any[];
    categories.forEach(c => {
      categoryStats.set(c.category, { correct: c.correct, total: c.total });
    });
    
    // Get difficulty stats
    const difficultyStats = new Map();
    const difficulties = getDb().prepare(`
      SELECT difficulty, correct, total FROM difficulty_stats WHERE username = ?
    `).all(username) as any[];
    difficulties.forEach(d => {
      difficultyStats.set(d.difficulty, { correct: d.correct, total: d.total });
    });
    
    // Get question type stats
    const questionTypeStats = new Map();
    const types = getDb().prepare(`
      SELECT type, correct, total FROM question_type_stats WHERE username = ?
    `).all(username) as any[];
    types.forEach(t => {
      questionTypeStats.set(t.type, { correct: t.correct, total: t.total });
    });
    
    return {
      username: user.username,
      totalGamesPlayed: user.total_games_played,
      totalPoints: user.total_points,
      totalCorrect: user.total_correct,
      totalQuestions: user.total_questions,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      lastGameDate: user.last_game_date || undefined,
      categoryStats,
      difficultyStats,
      questionTypeStats
    };
  }

  // Update user stats
  static update(username: string, updates: Partial<IUserStats>): void {
    const fields = [];
    const values = [];
    
    if (updates.totalGamesPlayed !== undefined) {
      fields.push('total_games_played = ?');
      values.push(updates.totalGamesPlayed);
    }
    if (updates.totalPoints !== undefined) {
      fields.push('total_points = ?');
      values.push(updates.totalPoints);
    }
    if (updates.totalCorrect !== undefined) {
      fields.push('total_correct = ?');
      values.push(updates.totalCorrect);
    }
    if (updates.totalQuestions !== undefined) {
      fields.push('total_questions = ?');
      values.push(updates.totalQuestions);
    }
    if (updates.currentStreak !== undefined) {
      fields.push('current_streak = ?');
      values.push(updates.currentStreak);
    }
    if (updates.longestStreak !== undefined) {
      fields.push('longest_streak = ?');
      values.push(updates.longestStreak);
    }
    if (updates.lastGameDate !== undefined) {
      fields.push('last_game_date = ?');
      values.push(updates.lastGameDate);
    }
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(username);
      
      getDb().prepare(`
        UPDATE user_stats SET ${fields.join(', ')} WHERE username = ?
      `).run(...values);
    }
    
    // Update category stats
    if (updates.categoryStats) {
      updates.categoryStats.forEach((stats, category) => {
        getDb().prepare(`
          INSERT INTO category_stats (username, category, correct, total)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(username, category) DO UPDATE SET
            correct = excluded.correct,
            total = excluded.total
        `).run(username, category, stats.correct, stats.total);
      });
    }
    
    // Update difficulty stats
    if (updates.difficultyStats) {
      updates.difficultyStats.forEach((stats, difficulty) => {
        getDb().prepare(`
          INSERT INTO difficulty_stats (username, difficulty, correct, total)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(username, difficulty) DO UPDATE SET
            correct = excluded.correct,
            total = excluded.total
        `).run(username, difficulty, stats.correct, stats.total);
      });
    }
    
    // Update question type stats
    if (updates.questionTypeStats) {
      updates.questionTypeStats.forEach((stats, type) => {
        getDb().prepare(`
          INSERT INTO question_type_stats (username, type, correct, total)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(username, type) DO UPDATE SET
            correct = excluded.correct,
            total = excluded.total
        `).run(username, type, stats.correct, stats.total);
      });
    }
  }

  // Get leaderboard
  static getLeaderboard(limit: number = 10): Array<{ username: string; totalPoints: number; totalGamesPlayed: number }> {
    const users = getDb().prepare(`
      SELECT username, total_points, total_games_played
      FROM user_stats
      ORDER BY total_points DESC
      LIMIT ?
    `).all(limit) as any[];
    
    return users.map(u => ({
      username: u.username,
      totalPoints: u.total_points,
      totalGamesPlayed: u.total_games_played
    }));
  }
}
