import { Request, Response } from 'express';
import gameService from '../services/gameService';
import { IQuestion } from '../models/Game';

export class GameController {
  /**
   * GET /api/games/daily
   * Get today's daily game
   */
  async getDailyGame(req: Request, res: Response) {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const game = await gameService.getDailyGame(date);
      
      if (!game) {
        return res.status(404).json({ message: 'No daily game found for this date' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching daily game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/games/:gameId
   * Get a specific game by ID
   */
  async getGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const game = await gameService.getGameById(gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/games
   * Get all games for practice mode
   * Query params: limit (number), theme (string - optional filter by theme)
   */
  async getAllGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const theme = req.query.theme as string | undefined;
      const games = await gameService.getAllGames(limit, theme);
      res.json(games);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/games/themes
   * Get all available themes
   */
  async getAllThemes(req: Request, res: Response) {
    try {
      const themes = await gameService.getAllThemes();
      res.json(themes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/games/random
   * Get a random game for practice
   */
  async getRandomGame(req: Request, res: Response) {
    try {
      const game = await gameService.getRandomGame();
      
      if (!game) {
        return res.status(404).json({ message: 'No games available' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching random game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * POST /api/games
   * Create a new game (admin only)
   */
  async createGame(req: Request, res: Response) {
    try {
      const { title, description, questions, isDaily, date } = req.body;

      if (!title || !questions || questions.length !== 10) {
        return res.status(400).json({ 
          message: 'Title and exactly 10 questions are required' 
        });
      }

      const game = await gameService.createGame(
        title,
        description,
        questions as IQuestion[],
        isDaily,
        date ? new Date(date) : undefined,
        req.body.createdBy || 'admin'
      );

      res.status(201).json(game);
    } catch (error: any) {
      console.error('Error creating game:', error);
      res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  /**
   * PUT /api/games/:gameId
   * Update a game (admin only)
   */
  async updateGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const updates = req.body;

      const game = await gameService.updateGame(gameId, updates);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * DELETE /api/games/:gameId
   * Delete a game (admin only)
   */
  async deleteGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const deleted = await gameService.deleteGame(gameId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json({ message: 'Game deleted successfully' });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * POST /api/games/:gameId/check-answer
   * Check if an answer is correct
   */
  async checkAnswer(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { questionIndex, userAnswer } = req.body;

      const game = await gameService.getGameById(gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      const question = game.questions[questionIndex];
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const isCorrect = gameService.checkAnswer(userAnswer, question.correctAnswer);
      
      res.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        points: isCorrect ? question.points : 0
      });
    } catch (error) {
      console.error('Error checking answer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new GameController();
