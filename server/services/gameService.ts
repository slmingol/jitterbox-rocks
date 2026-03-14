import { GameRepository, IGame, IQuestion } from '../repositories/GameRepository';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, format } from 'date-fns';

export class GameService {
  /**
   * Get the daily game for a specific date
   */
  async getDailyGame(date: Date = new Date()): Promise<IGame | null> {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    return GameRepository.findByDate(dateStr);
  }

  /**
   * Get daily games for the last N days
   */
  async getPastDailyGames(days: number = 7): Promise<Array<{date: string, game: IGame | null}>> {
    const results: Array<{date: string, game: IGame | null}> = [];
    const today = startOfDay(new Date());
    
    for (let i = 1; i <= days; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateStr = format(pastDate, 'yyyy-MM-dd');
      const game = await GameRepository.findByDate(dateStr);
      results.push({ date: dateStr, game });
    }
    
    return results;
  }

  /**
   * Get a game by ID
   */
  async getGameById(gameId: string): Promise<IGame | null> {
    return GameRepository.findByGameId(gameId);
  }

  /**
   * Get all games for practice mode
   */
  async getAllGames(limit: number = 50, theme?: string): Promise<IGame[]> {
    if (theme && theme !== 'all') {
      return GameRepository.findByTheme(theme);
    }
    return GameRepository.findAll();
  }

  /**
   * Get all available themes
   */
  async getAllThemes(): Promise<string[]> {
    return GameRepository.getAllThemes();
  }

  /**
   * Create a new game
   */
  async createGame(
    title: string,
    description: string,
    questions: IQuestion[],
    isDaily: boolean = false,
    date?: Date,
    createdBy: string = 'admin'
  ): Promise<IGame> {
    if (questions.length !== 10) {
      throw new Error('A game must have exactly 10 questions');
    }

    const gameDate = date ? startOfDay(date) : startOfDay(new Date());
    const gameId = uuidv4();

    const game: IGame = {
      gameId,
      date: format(gameDate, 'yyyy-MM-dd'),
      title,
      questions,
      isDaily
    };

    return GameRepository.create(game);
  }

  /**
   * Update an existing game
   */
  async updateGame(
    gameId: string,
    updates: Partial<{
      title: string;
      description: string;
      questions: IQuestion[];
    }>
  ): Promise<IGame | null> {
    // For SQLite, we'd need to implement an update method
    // For now, throw an error
    throw new Error('Update not implemented for SQLite backend');
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<boolean> {
    // For SQLite, we'd need to implement a delete method
    // For now, throw an error
    throw new Error('Delete not implemented for SQLite backend');
  }

  /**
   * Check if answer is correct (case-insensitive, trimmed)
   * For names, accepts either full name or last name only
   */
  checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (str: string) => str.trim().toLowerCase();
    const normalizedUserAnswer = normalize(userAnswer);
    const normalizedCorrectAnswer = normalize(correctAnswer);
    
    // Direct match
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return true;
    }
    
    // Check if user answer matches the last word (last name) of the correct answer
    const correctAnswerParts = normalizedCorrectAnswer.split(/\s+/);
    const lastName = correctAnswerParts[correctAnswerParts.length - 1];
    
    if (normalizedUserAnswer === lastName) {
      return true;
    }
    
    // Check if user answer matches the first word (first name) of the correct answer
    // This helps with single-name artists or when someone types first name
    const firstName = correctAnswerParts[0];
    if (normalizedUserAnswer === firstName && correctAnswerParts.length === 1) {
      return true;
    }
    
    return false;
  }

  /**
   * Get games by date range
   */
  async getGamesByDateRange(startDate: Date, endDate: Date): Promise<IGame[]> {
    // For now, just get all games and filter in memory
    const allGames = GameRepository.findAll();
    const start = format(startOfDay(startDate), 'yyyy-MM-dd');
    const end = format(startOfDay(endDate), 'yyyy-MM-dd');
    return allGames.filter(g => g.date >= start && g.date <= end);
  }

  /**
   * Get random practice game
   */
  async getRandomGame(): Promise<IGame | null> {
    return GameRepository.findRandom();
  }

  /**
   * Seed initial games (for development)
   */
  async seedGames(games: Array<{
    title: string;
    description: string;
    questions: IQuestion[];
    date: Date;
    isDaily: boolean;
  }>): Promise<IGame[]> {
    const createdGames: IGame[] = [];
    
    for (const gameData of games) {
      try {
        const game = await this.createGame(
          gameData.title,
          gameData.description,
          gameData.questions,
          gameData.isDaily,
          gameData.date,
          'system'
        );
        createdGames.push(game);
      } catch (error) {
        console.error(`Error seeding game: ${gameData.title}`, error);
      }
    }
    
    return createdGames;
  }
}

export default new GameService();
