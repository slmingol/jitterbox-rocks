export interface Question {
  type: 'multiple-choice' | 'audio' | 'text-input';
  question: string;
  correctAnswer: string;
  options?: string[];
  audioUrl?: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

export interface Game {
  _id: string;
  gameId: string;
  date: Date;
  title: string;
  description: string;
  questions: Question[];
  isDaily: boolean;
  theme?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionStats {
  gameId: string;
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  timeSpent: number;
  answeredAt: Date;
}

export interface GameStats {
  gameId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  timeTaken: number;
}

export interface UserStats {
  userId: string;
  username: string;
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalPoints: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date;
  gameHistory: GameStats[];
  questionHistory: QuestionStats[];
  categoryStats: Record<string, {
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
}

export interface DetailedUserStats extends UserStats {
  rank: number;
  recentPerformance: number;
  bestCategory: {
    category: string;
    attempted: number;
    correct: number;
    accuracy: number;
  };
  worstCategory: {
    category: string;
    attempted: number;
    correct: number;
    accuracy: number;
  };
  overallAccuracy: number;
}
