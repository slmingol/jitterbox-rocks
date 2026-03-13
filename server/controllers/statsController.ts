import { Request, Response } from 'express';
import statsService from '../services/statsService';
import gameService from '../services/gameService';

export class StatsController {
  /**
   * GET /api/stats/:userId
   * Get user statistics
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const username = req.query.username as string || userId;
      
      const stats = await statsService.getUserStats(userId, username);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/stats/:userId/detailed
   * Get detailed user statistics with insights
   */
  async getDetailedStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const stats = await statsService.getDetailedStats(userId);
      
      if (!stats) {
        return res.status(404).json({ message: 'User stats not found' });
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * POST /api/stats/record-question
   * Record a question answer
   */
  async recordQuestion(req: Request, res: Response) {
    try {
      const {
        userId,
        username,
        gameId,
        questionIndex,
        userAnswer,
        timeSpent
      } = req.body;

      // Get the game and question
      const game = await gameService.getGameById(gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      const question = game.questions[questionIndex];
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Check if answer is correct
      const isCorrect = gameService.checkAnswer(userAnswer, question.correctAnswer);

      // Record the answer
      await statsService.recordQuestionAnswer(
        userId,
        username,
        gameId,
        questionIndex,
        question,
        userAnswer,
        isCorrect,
        timeSpent
      );

      res.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        points: isCorrect ? question.points : 0
      });
    } catch (error) {
      console.error('Error recording question:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * POST /api/stats/complete-game
   * Record game completion
   */
  async completeGame(req: Request, res: Response) {
    try {
      const {
        userId,
        username,
        gameId,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken
      } = req.body;

      await statsService.completeGame(
        userId,
        username,
        gameId,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken
      );

      const updatedStats = await statsService.getDetailedStats(userId);
      res.json(updatedStats);
    } catch (error) {
      console.error('Error completing game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/stats/leaderboard
   * Get top players leaderboard
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await statsService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/stats/:userId/rank
   * Get user's rank
   */
  async getUserRank(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const rank = await statsService.getUserRank(userId);
      res.json({ rank });
    } catch (error) {
      console.error('Error fetching user rank:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/stats/system/overview
   * Get overall system statistics
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      const stats = await statsService.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new StatsController();
