import { BillboardSong } from './billboardSchema';
import { QuestionGenerator } from './questionGenerator';
import { GameRepository, IGame } from '../repositories/GameRepository';
import { addDays, startOfDay, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export type GameTheme = 'mixed' | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

/**
 * Batch Game Generator
 * Creates thousands of games from Billboard Hot 100 data
 */

export class BatchGameGenerator {
  private questionGenerator: QuestionGenerator;
  private songs: BillboardSong[];

  constructor(songs: BillboardSong[]) {
    this.questionGenerator = new QuestionGenerator();
    this.songs = songs;
  }

  /**
   * Generate a single game with optional theme
   */
  private generateGame(
    gameNumber: number,
    date: Date,
    isDaily: boolean,
    theme: GameTheme = 'mixed'
  ): IGame {
    // Select songs based on theme
    const gameSongs = theme === 'mixed' 
      ? this.selectDiverseSongs(10)
      : this.selectThemedSongs(10, theme);
    
    // Generate questions
    const questions = this.questionGenerator.generateGameQuestions(
      gameSongs,
      this.songs
    );

    // Ensure we have exactly 10 questions
    if (questions.length < 10) {
      console.warn(`Game ${gameNumber} only generated ${questions.length} questions`);
      // Pad with simpler questions if needed
      while (questions.length < 10) {
        const randomSong = gameSongs[questions.length % gameSongs.length];
        const simpleQ = this.questionGenerator.generateArtistTextQuestion(randomSong);
        if (simpleQ) questions.push(simpleQ);
      }
    }

    const title = this.generateGameTitle(gameSongs, theme, gameNumber);
    
    return {
      gameId: uuidv4(),
      date: format(startOfDay(date), 'yyyy-MM-dd'),
      title,
      questions: questions.slice(0, 10),
      isDaily,
      theme
    };
  }

  /**
   * Select songs from a specific decade theme
   */
  private selectThemedSongs(count: number, theme: GameTheme): BillboardSong[] {
    const decadeNum = parseInt(theme);
    const themedSongs = this.songs.filter(song => {
      const songDecade = Math.floor(song.year / 10) * 10;
      return songDecade === decadeNum;
    });

    if (themedSongs.length === 0) {
      console.warn(`No songs found for theme ${theme}, falling back to mixed`);
      return this.selectDiverseSongs(count);
    }

    // Randomly select songs from the themed pool
    const selected: BillboardSong[] = [];
    const shuffled = [...themedSongs].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      selected.push(shuffled[i]);
    }

    return selected;
  }

  /**
   * Select diverse songs across different eras
   */
  private selectDiverseSongs(count: number): BillboardSong[] {
    const selected: BillboardSong[] = [];
    const decades = this.groupByDecade();
    const decadeKeys = Object.keys(decades);

    // Distribute songs across decades
    for (let i = 0; i < count; i++) {
      const decadeKey = decadeKeys[i % decadeKeys.length];
      const decadeSongs = decades[decadeKey];
      
      if (decadeSongs && decadeSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * decadeSongs.length);
        selected.push(decadeSongs[randomIndex]);
      }
    }

    return selected;
  }

  /**
   * Group songs by decade
   */
  private groupByDecade(): Record<string, BillboardSong[]> {
    const grouped: Record<string, BillboardSong[]> = {};
    
    for (const song of this.songs) {
      const decade = Math.floor(song.year / 10) * 10;
      const key = `${decade}s`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(song);
    }

    return grouped;
  }

  /**
   * Generate a descriptive title for the game
   */
  private generateGameTitle(songs: BillboardSong[], theme: GameTheme = 'mixed', gameNumber: number = 0): string {
    const years = songs.map(s => s.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const decade = Math.floor(minYear / 10) * 10;
    
    // Extract artists for themed titles
    const artists = songs.map(s => s.artist);
    const uniqueArtists = [...new Set(artists)];
    
    // Title templates with variations
    const titleTemplates = [
      // Decade-based titles
      `${decade}s Classics Collection`,
      `Hits from the ${decade}s`,
      `${decade}s Music Memories`,
      `Greatest ${decade}s Songs`,
      `${decade}s Chart Toppers`,
      `Best of the ${decade}s`,
      `${decade}s Billboard Countdown`,
      `${decade}s Legends Quiz`,
      
      // Year range titles  
      `Music from ${minYear}-${maxYear}`,
      `Chart Hits ${minYear}-${maxYear}`,
      
      // General titles
      `Billboard Classics Mix`,
      `Chart Topper Challenge`,
      `Music History Quiz`,
      `Hit Songs Collection`,
      `Classic Hits Mashup`,
      `Music Icon Challenge`,
      `Billboard Hot 100 Quiz`,
      `Radio Gold Collection`,
      `All-Time Greats Mix`,
      `Chart Success Stories`,
      
      // Artist-based (if few unique artists)
      ...(uniqueArtists.length <= 3 ? [
        `${uniqueArtists[0]} & Friends`,
        `Featuring ${uniqueArtists[0]}`,
      ] : []),
      
      // Theme-specific
      ...(theme !== 'mixed' ? [
        `${theme} Hits Collection`,
        `${theme} Music Trivia`,
        `${theme} Chart Success`,
      ] : []),
    ];
    
    // Use game number to deterministically pick a template
    // This ensures variety while being reproducible
    const templateIndex = gameNumber % titleTemplates.length;
    return titleTemplates[templateIndex];
  }

  /**
   * Generate multiple games in batch with theme distribution
   */
  async generateGames(
    count: number,
    startDate: Date = new Date(),
    dailyGamesCount: number = 365,
    themeDistribution: Partial<Record<GameTheme, number>> = { 'mixed': 1.0 }
  ): Promise<IGame[]> {
    const games: IGame[] = [];
    const currentDate = startOfDay(startDate);

    // Calculate games per theme
    const themeGames = this.calculateThemeDistribution(count, themeDistribution);

    console.log(`Starting generation of ${count} games...`);
    console.log(`Daily games: ${dailyGamesCount}, Practice games: ${count - dailyGamesCount}`);
    console.log('Theme distribution:', themeGames);

    let gameIndex = 0;

    for (const [theme, themeCount] of Object.entries(themeGames)) {
      console.log(`\nGenerating ${themeCount} ${theme} games...`);

      for (let i = 0; i < themeCount; i++) {
        if (gameIndex % 100 === 0) {
          console.log(`Generated ${gameIndex}/${count} games (${((gameIndex/count)*100).toFixed(1)}%)`);
        }

        const isDaily = gameIndex < dailyGamesCount;
        const gameDate = isDaily ? addDays(currentDate, gameIndex) : currentDate;
        
        const game = this.generateGame(gameIndex + 1, gameDate, isDaily, theme as GameTheme);
        games.push(game);
        gameIndex++;

        // Periodically clear the question cache to allow for some repetition
        // across thousands of games
        if (gameIndex % 1000 === 0 && gameIndex > 0) {
          this.questionGenerator.clearCache();
        }
      }
    }

    console.log(`Generated ${games.length} games successfully!`);
    return games;
  }

  /**
   * Calculate how many games per theme based on distribution
   */
  private calculateThemeDistribution(
    totalGames: number,
    distribution: Partial<Record<GameTheme, number>>
  ): Record<string, number> {
    const result: Record<string, number> = {};
    
    // Normalize distribution
    const total = Object.values(distribution).reduce((sum, val) => sum + (val || 0), 0);
    
    let assigned = 0;
    const themes = Object.keys(distribution);
    
    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];
      const themeValue = distribution[theme as GameTheme] || 0;
      const ratio = themeValue / total;
      
      // For last theme, assign remaining games to avoid rounding errors
      if (i === themes.length - 1) {
        result[theme] = totalGames - assigned;
      } else {
        const count = Math.floor(totalGames * ratio);
        result[theme] = count;
        assigned += count;
      }
    }
    
    return result;
  }

  /**
   * Save games to database in batches
   */
  async saveGamesToDatabase(
    games: IGame[],
    batchSize: number = 100
  ): Promise<void> {
    console.log(`Saving ${games.length} games to database in batches of ${batchSize}...`);

    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      for (const game of batch) {
        try {
          await GameRepository.create(game);
        } catch (error) {
          console.error(`Error saving game ${game.gameId}:`, error);
        }
      }

      console.log(`Saved ${Math.min(i + batchSize, games.length)}/${games.length} games`);
    }

    console.log('All games saved successfully!');
  }

  /**
   * Generate and save games in one operation
   */
  async generateAndSave(
    count: number,
    startDate?: Date
  ): Promise<void> {
    const games = await this.generateGames(count, startDate);
    await this.saveGamesToDatabase(games);
  }
}
