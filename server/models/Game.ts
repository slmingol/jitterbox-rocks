// TypeScript interfaces for SQLite-based music trivia game

export interface IQuestion {
  type: 'multiple-choice';
  question: string;
  correctAnswer: string;
  options: string[]; // Multiple choice options (required)
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string; // e.g., 'Rock', 'Pop', '80s', 'Artist Name', etc.
  points: number;
}

export interface IGame {
  gameId: string;
  date: Date | string;
  title: string;
  description?: string;
  questions: IQuestion[];
  isDaily: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
