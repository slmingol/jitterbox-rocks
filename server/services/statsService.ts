import { UserStatsRepository, IUserStats } from '../repositories/UserStatsRepository';
import { IQuestion } from '../repositories/GameRepository';
import { startOfDay, differenceInDays, format } from 'date-fns';

export class StatsService {
  /**
   * Get or create user stats
   */
  async getUserStats(userId: string, username: string): Promise<IUserStats> {
    return UserStatsRepository.findOrCreate(username);
  }

  /**
   * Record a question answer
   */
  async recordQuestionAnswer(
    userId: string,
    username: string,
    gameId: string,
    questionIndex: number,
    question: IQuestion,
    userAnswer: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<void> {
    const stats = await this.getUserStats(userId, username);

    // Update totals
    stats.totalQuestions += 1;
    if (isCorrect) {
      stats.totalCorrect += 1;
      stats.totalPoints += question.points;
    }

    // Update category stats
    const categoryStats = stats.categoryStats.get(question.category) || { correct: 0, total: 0 };
    categoryStats.total += 1;
    if (isCorrect) categoryStats.correct += 1;
    stats.categoryStats.set(question.category, categoryStats);

    // Update difficulty stats
    const diffStats = stats.difficultyStats.get(question.difficulty) || { correct: 0, total: 0 };
    diffStats.total += 1;
    if (isCorrect) diffStats.correct += 1;
    stats.difficultyStats.set(question.difficulty, diffStats);

    // Update question type stats
    const typeStats = stats.questionTypeStats.get(question.type) || { correct: 0, total: 0 };
    typeStats.total += 1;
    if (isCorrect) typeStats.correct += 1;
    stats.questionTypeStats.set(question.type, typeStats);

    UserStatsRepository.update(username, stats);
  }

  /**
   * Complete a game and update stats
   */
  async completeGame(
    userId: string,
    username: string,
    gameId: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    timeTaken: number
  ): Promise<void> {
    const stats = await this.getUserStats(userId, username);

    stats.totalGamesPlayed += 1;
    
    // Update streak
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastPlayed = stats.lastGameDate;

    if (!lastPlayed) {
      stats.currentStreak = 1;
    } else {
      const daysDiff = differenceInDays(
        startOfDay(new Date(today)),
        startOfDay(new Date(lastPlayed))
      );
      
      if (daysDiff === 0) {
        // Same day, no change to streak
      } else if (daysDiff === 1) {
        // Consecutive day
        stats.currentStreak += 1;
      } else {
        // Streak broken
        stats.currentStreak = 1;
      }
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastGameDate = today;
    
    UserStatsRepository.update(username, stats);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{ username: string; totalPoints: number; totalGamesPlayed: number }>> {
    return UserStatsRepository.getLeaderboard(limit);
  }

  /**
   * Get user rank
   */
  async getUserRank(userId: string): Promise<number> {
    // Get all users sorted by points
    const leaderboard = UserStatsRepository.getLeaderboard(1000);
    const userIndex = leaderboard.findIndex(u => u.username === userId);
    return userIndex >= 0 ? userIndex + 1 : 0;
  }

  /**
   * Get detailed user statistics
   */
  async getDetailedStats(userId: string): Promise<any> {
    const stats = await this.getUserStats(userId, userId);
    const rank = await this.getUserRank(userId);

    // Convert Maps to plain objects for JSON serialization
    const categoryStatsObj: Record<string, { attempted: number; correct: number; accuracy: number }> = {};
    stats.categoryStats.forEach((data, name) => {
      categoryStatsObj[name] = {
        attempted: data.total,
        correct: data.correct,
        accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
      };
    });

    const difficultyStatsObj = {
      easy: { attempted: 0, correct: 0, accuracy: 0 },
      medium: { attempted: 0, correct: 0, accuracy: 0 },
      hard: { attempted: 0, correct: 0, accuracy: 0 }
    };
    stats.difficultyStats.forEach((data, difficulty) => {
      if (difficulty in difficultyStatsObj) {
        difficultyStatsObj[difficulty as keyof typeof difficultyStatsObj] = {
          attempted: data.total,
          correct: data.correct,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        };
      }
    });

    const questionTypeStatsObj = {
      'multiple-choice': { attempted: 0, correct: 0, accuracy: 0 },
      'audio': { attempted: 0, correct: 0, accuracy: 0 },
      'text-input': { attempted: 0, correct: 0, accuracy: 0 }
    };
    stats.questionTypeStats.forEach((data, type) => {
      if (type in questionTypeStatsObj) {
        questionTypeStatsObj[type as keyof typeof questionTypeStatsObj] = {
          attempted: data.total,
          correct: data.correct,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        };
      }
    });

    // Calculate additional insights
    const categoryArray = Object.entries(categoryStatsObj).map(([name, data]) => ({
      category: name,
      attempted: data.attempted,
      correct: data.correct,
      accuracy: data.accuracy
    }));
    
    const bestCategory = categoryArray.length > 0
      ? categoryArray.reduce((best, curr) => curr.accuracy > best.accuracy ? curr : best)
      : { category: 'N/A', attempted: 0, correct: 0, accuracy: 0 };
    
    const worstCategory = categoryArray.length > 0
      ? categoryArray.reduce((worst, curr) => curr.accuracy < worst.accuracy ? curr : worst)
      : { category: 'N/A', attempted: 0, correct: 0, accuracy: 0 };

    return {
      username: stats.username,
      userId,
      totalGamesPlayed: stats.totalGamesPlayed,
      totalQuestionsAnswered: stats.totalQuestions,
      totalCorrectAnswers: stats.totalCorrect,
      totalPoints: stats.totalPoints,
      averageScore: stats.totalGamesPlayed > 0 ? stats.totalPoints / stats.totalGamesPlayed : 0,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastPlayedDate: stats.lastGameDate,
      gameHistory: [],  // Empty for now, can be populated later if needed
      questionHistory: [],  // Empty for now
      categoryStats: categoryStatsObj,
      difficultyStats: difficultyStatsObj,
      questionTypeStats: questionTypeStatsObj,
      rank,
      recentPerformance: 0,  // Can calculate this later
      bestCategory,
      worstCategory,
      overallAccuracy: stats.totalQuestions > 0 ? (stats.totalCorrect / stats.totalQuestions) * 100 : 0
    };
  }

  /**
   * Get overall system statistics
   */
  async getSystemStats(): Promise<any> {
    const db = require('../config/sqlite').default;
    const fs = require('fs');
    const path = require('path');

    // Get total games count
    const totalGamesResult = db.prepare('SELECT COUNT(*) as count FROM games').get();
    const totalGames = totalGamesResult?.count || 0;

    // Get total questions count
    const totalQuestionsResult = db.prepare('SELECT COUNT(*) as count FROM questions').get();
    const totalQuestions = totalQuestionsResult?.count || 0;

    // Count total songs from Billboard JSON
    let totalSongs = 0;
    try {
      const jsonPath = path.join(__dirname, '../data/json/billboard_complete.json');
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const billboardData = JSON.parse(jsonContent);
        totalSongs = billboardData.length;
      }
    } catch (error) {
      console.error('Error counting songs:', error);
    }

    // Get total players
    const allUsers = UserStatsRepository.getLeaderboard(10000); // Get all users
    const totalPlayers = allUsers.length;

    // Get total questions answered across all users
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    allUsers.forEach(user => {
      const stats = UserStatsRepository.findOrCreate(user.username);
      totalQuestionsAnswered += stats.totalQuestions;
      totalCorrectAnswers += stats.totalCorrect;
    });

    // Get daily games count (is_daily = 1)
    const dailyGamesResult = db.prepare('SELECT COUNT(*) as count FROM games WHERE is_daily = 1').get();
    const dailyGames = dailyGamesResult?.count || 0;

    const practiceGames = totalGames - dailyGames;

    return {
      totalGames,
      dailyGames,
      practiceGames,
      totalQuestions,
      totalSongs,
      totalPlayers,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      globalAccuracy: totalQuestionsAnswered > 0 
        ? ((totalCorrectAnswers / totalQuestionsAnswered) * 100).toFixed(1)
        : 0,
      averageQuestionsPerGame: totalGames > 0 
        ? (totalQuestions / totalGames).toFixed(1)
        : 0
    };
  }
}

export default new StatsService();
