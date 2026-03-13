import db from '../config/sqlite';

export interface IQuestion {
  type: 'multiple-choice' | 'audio' | 'text-input';
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  correctAnswer: string;
  options?: string[];
  audioUrl?: string;
}

export interface IGame {
  gameId: string;
  title: string;
  description?: string;
  date: string;
  questions: IQuestion[];
  isDaily: boolean;
  theme?: string;
}

export class GameRepository {
  // Create a new game
  static create(game: IGame): IGame {
    const insert = db.prepare(`
      INSERT INTO games (game_id, title, description, date, is_daily, theme)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(
      game.gameId, 
      game.title,
      game.description || null, 
      game.date, 
      game.isDaily ? 1 : 0,
      game.theme || 'mixed'
    );
    
    // Insert questions
    const insertQuestion = db.prepare(`
      INSERT INTO questions (game_id, question_index, type, question, category, difficulty, points, correct_answer, options, audio_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    game.questions.forEach((q, index) => {
      insertQuestion.run(
        game.gameId,
        index,
        q.type,
        q.question,
        q.category,
        q.difficulty,
        q.points,
        q.correctAnswer,
        q.options ? JSON.stringify(q.options) : null,
        q.audioUrl || null
      );
    });
    
    return game;
  }

  // Find game by gameId
  static findByGameId(gameId: string): IGame | null {
    const game = db.prepare(`
      SELECT * FROM games WHERE game_id = ?
    `).get(gameId) as any;
    
    if (!game) return null;
    
    const questions = db.prepare(`
      SELECT * FROM questions WHERE game_id = ? ORDER BY question_index
    `).all(gameId) as any[];
    
    return {
      gameId: game.game_id,
      title: game.title,
      description: game.description || undefined,
      date: game.date,
      isDaily: game.is_daily === 1,
      theme: game.theme || 'mixed',
      questions: questions.map(q => ({
        type: q.type,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        points: q.points,
        correctAnswer: q.correct_answer,
        options: q.options ? JSON.parse(q.options) : undefined,
        audioUrl: q.audio_url || undefined
      }))
    };
  }

  // Find game by date
  static findByDate(date: string): IGame | null {
    const game = db.prepare(`
      SELECT * FROM games WHERE date = ? AND is_daily = 1
    `).get(date) as any;
    
    if (!game) return null;
    
    return this.findByGameId(game.game_id);
  }

  // Get all games
  static findAll(): IGame[] {
    const games = db.prepare(`
      SELECT * FROM games ORDER BY date DESC
    `).all() as any[];
    
    return games.map(g => this.findByGameId(g.game_id)!).filter(Boolean);
  }

  // Get random game
  static findRandom(): IGame | null {
    const game = db.prepare(`
      SELECT * FROM games ORDER BY RANDOM() LIMIT 1
    `).get() as any;
    
    if (!game) return null;
    
    return this.findByGameId(game.game_id);
  }

  // Delete all games (for testing/seeding)
  static deleteAll(): void {
    db.prepare('DELETE FROM questions').run();
    db.prepare('DELETE FROM games').run();
  }

  // Delete a specific game by gameId
  static delete(gameId: string): void {
    db.prepare('DELETE FROM questions WHERE game_id = ?').run(gameId);
    db.prepare('DELETE FROM games WHERE game_id = ?').run(gameId);
  }

  // Delete all games for a specific theme
  static deleteByTheme(theme: string): number {
    const games = this.findByTheme(theme);
    games.forEach(game => this.delete(game.gameId));
    return games.length;
  }

  // Count games
  static count(): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };
    return result.count;
  }

  // Get games by theme
  static findByTheme(theme: string): IGame[] {
    const games = db.prepare(`
      SELECT * FROM games WHERE theme = ? ORDER BY date DESC
    `).all(theme) as any[];
    
    return games.map(g => this.findByGameId(g.game_id)!).filter(Boolean);
  }

  // Get all distinct themes
  static getAllThemes(): string[] {
    const themes = db.prepare(`
      SELECT DISTINCT theme FROM games ORDER BY theme
    `).all() as { theme: string }[];
    
    return themes.map(t => t.theme);
  }
}
