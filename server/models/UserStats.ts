// TypeScript interfaces for SQLite-based user statistics

export interface IQuestionStats {
  gameId: string;
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  timeSpent: number; // in seconds
  answeredAt: Date;
}

export interface IGameStats {
  gameId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  timeTaken: number; // in seconds
}

export interface IUserStats {
  userId?: string;
  username: string;
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalPoints: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate?: Date | string;
  gameHistory?: IGameStats[];
  questionHistory?: IQuestionStats[];
  categoryStats: Map<string, {
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyStats: {
    easy: { attempted: number; correct: number; accuracy: number };
    medium: { attempted: number; correct: number; accuracy: number };
    hard: { attempted: number; correct: number; accuracy: number };
  };
  questionTypeStats: {
    'multiple-choice': { attempted: number; correct: number; accuracy: number };
    'audio': { attempted: number; correct: number; accuracy: number };
    'text-input': { attempted: number; correct: number; accuracy: number };
  };
  createdAt?: Date;
  updatedAt?: Date;
}
