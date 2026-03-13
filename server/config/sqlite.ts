import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'music-trivia.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
export const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export const initializeDatabase = () => {
  console.log('Initializing SQLite database...');
  
  // Create games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      is_daily INTEGER NOT NULL DEFAULT 1,
      theme TEXT DEFAULT 'mixed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 10,
      correct_answer TEXT NOT NULL,
      options TEXT,
      audio_url TEXT,
      FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
      UNIQUE(game_id, question_index)
    );
  `);

  // Create user_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      total_games_played INTEGER NOT NULL DEFAULT 0,
      total_points INTEGER NOT NULL DEFAULT 0,
      total_correct INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_game_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create category_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS category_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      category TEXT NOT NULL,
      correct INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (username) REFERENCES user_stats(username) ON DELETE CASCADE,
      UNIQUE(username, category)
    );
  `);

  // Create difficulty_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS difficulty_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      correct INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (username) REFERENCES user_stats(username) ON DELETE CASCADE,
      UNIQUE(username, difficulty)
    );
  `);

  // Create question_type_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_type_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      type TEXT NOT NULL,
      correct INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (username) REFERENCES user_stats(username) ON DELETE CASCADE,
      UNIQUE(username, type)
    );
  `);

  // Add theme column to existing games table if it doesn't exist
  try {
    db.exec(`ALTER TABLE games ADD COLUMN theme TEXT DEFAULT 'mixed';`);
    console.log('✅ Added theme column to games table');
  } catch (error) {
    // Column already exists, ignore
  }

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
    CREATE INDEX IF NOT EXISTS idx_games_game_id ON games(game_id);
    CREATE INDEX IF NOT EXISTS idx_questions_game_id ON questions(game_id);
    CREATE INDEX IF NOT EXISTS idx_user_stats_username ON user_stats(username);
  `);

  console.log('✅ Database initialized successfully');
};

// Initialize on import
initializeDatabase();

export default db;
