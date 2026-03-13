// TypeScript interfaces for SQLite-based music trivia game

export interface IQuestion {
  type: 'multiple-choice' | 'audio' | 'text-input';
  question: string;
  correctAnswer: string;
  options?: string[]; // For multiple choice
  audioUrl?: string; // For audio questions
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
