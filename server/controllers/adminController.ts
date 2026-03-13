import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { BillboardSong } from '../data/billboardSchema';
import { GameRepository, IGame } from '../repositories/GameRepository';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay } from 'date-fns';
import { dbPath, reloadDatabase } from '../config/sqlite';

interface StrictDecadeConfig {
  decade: string;
  categoryName: string;
  yearStart: number;
  yearEnd: number;
}

const DECADES: StrictDecadeConfig[] = [
  { decade: '1950s', categoryName: '50s Classics', yearStart: 1950, yearEnd: 1959 },
  { decade: '1960s', categoryName: '60s Legends', yearStart: 1960, yearEnd: 1969 },
  { decade: '1970s', categoryName: '70s Rock', yearStart: 1970, yearEnd: 1979 },
  { decade: '1980s', categoryName: '80s Pop', yearStart: 1980, yearEnd: 1989 },
  { decade: '1990s', categoryName: '90s Classics', yearStart: 1990, yearEnd: 1999 },
  { decade: '2000s', categoryName: '2000s Hits', yearStart: 2000, yearEnd: 2009 },
  { decade: '2010s', categoryName: '2010s Hits', yearStart: 2010, yearEnd: 2019 },
  { decade: '2020s', categoryName: '2020s Hits', yearStart: 2020, yearEnd: 2029 },
];

class StrictDecadeGameGenerator {
  private songs: BillboardSong[];
  private usedQuestions: Set<string> = new Set();

  constructor(songs: BillboardSong[]) {
    this.songs = songs;
  }

  private getSongsForDecade(yearStart: number, yearEnd: number): BillboardSong[] {
    return this.songs.filter(song => song.year >= yearStart && song.year <= yearEnd);
  }

  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private hashQuestion(question: string, answer: string): string {
    return `${question.toLowerCase().trim()}|${answer.toLowerCase().trim()}`;
  }

  private isUnique(question: string, answer: string): boolean {
    const hash = this.hashQuestion(question, answer);
    if (this.usedQuestions.has(hash)) {
      return false;
    }
    this.usedQuestions.add(hash);
    return true;
  }

  private generateWhoSangQuestion(
    song: BillboardSong,
    distractors: string[],
    category: string
  ) {
    const question = `Who sang "${song.title}"?`;
    if (!this.isUnique(question, song.artist)) return null;

    return {
      type: 'multiple-choice' as const,
      question,
      correctAnswer: song.artist,
      category,
      difficulty: 'easy' as const,
      options: this.shuffle([song.artist, ...distractors.slice(0, 3)]),
      points: 10
    };
  }

  private generateWhatYearQuestion(
    song: BillboardSong,
    distractorYears: number[],
    category: string
  ) {
    const question = `What year did "${song.title}" by ${song.artist} reach the charts?`;
    if (!this.isUnique(question, song.year.toString())) return null;

    return {
      type: 'multiple-choice' as const,
      question,
      correctAnswer: song.year.toString(),
      category,
      difficulty: 'medium' as const,
      options: this.shuffle([song.year.toString(), ...distractorYears.map(y => y.toString())]),
      points: 15
    };
  }

  private generateArtistTextQuestion(song: BillboardSong, category: string) {
    const question = `Who performed "${song.title}"?`;
    if (!this.isUnique(question, song.artist)) return null;

    return {
      type: 'text-input' as const,
      question,
      correctAnswer: song.artist,
      category,
      difficulty: 'easy' as const,
      hint: `A hit from the ${category.split(' ')[0]}`,
      points: 10
    };
  }

  private generateAlbumQuestion(
    song: BillboardSong,
    distractors: string[],
    category: string
  ) {
    if (!song.album) return null;
    const question = `Which album featured "${song.title}" by ${song.artist}?`;
    if (!this.isUnique(question, song.album)) return null;

    return {
      type: 'multiple-choice' as const,
      question,
      correctAnswer: song.album,
      category,
      difficulty: 'medium' as const,
      options: this.shuffle([song.album, ...distractors.slice(0, 3)]),
      points: 15
    };
  }

  private generatePeakPositionQuestion(song: BillboardSong, category: string) {
    if (song.peakPosition > 10) return null;
    
    const question = `What was the peak position of "${song.title}" on the Billboard Hot 100?`;
    if (!this.isUnique(question, song.peakPosition.toString())) return null;

    const options = [song.peakPosition.toString(), '1', '5', '10']
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4);
    
    while (options.length < 4) {
      const random = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(random.toString())) {
        options.push(random.toString());
      }
    }

    return {
      type: 'multiple-choice' as const,
      question,
      correctAnswer: song.peakPosition.toString(),
      category,
      difficulty: 'hard' as const,
      options: this.shuffle(options),
      points: 20
    };
  }

  private generateGameQuestions(
    songs: BillboardSong[],
    allDecadeSongs: BillboardSong[],
    category: string
  ) {
    const questions: any[] = [];
    const targetCount = 10;

    const selectedSongs = this.shuffle([...songs]).slice(0, targetCount);

    for (const song of selectedSongs) {
      if (questions.length >= targetCount) break;

      const sameDecade = allDecadeSongs.filter(s => s.artist !== song.artist);
      const artistDistractors = this.shuffle(sameDecade.map(s => s.artist)).slice(0, 3);
      const yearDistractors = this.shuffle([...new Set(sameDecade.map(s => s.year))]).slice(0, 3);
      const albumDistractors = this.shuffle(
        sameDecade.filter(s => s.album).map(s => s.album!)
      ).slice(0, 3);

      const generators = [
        () => this.generateWhoSangQuestion(song, artistDistractors, category),
        () => this.generateArtistTextQuestion(song, category),
        () => this.generateWhatYearQuestion(song, yearDistractors, category),
        () => this.generateAlbumQuestion(song, albumDistractors, category),
        () => this.generatePeakPositionQuestion(song, category),
      ];

      for (const generator of this.shuffle(generators)) {
        const question = generator();
        if (question) {
          questions.push(question);
          break;
        }
      }
    }

    return questions.slice(0, targetCount);
  }

  private generateGame(
    decadeConfig: StrictDecadeConfig,
    gameNumber: number,
    songs: BillboardSong[]
  ): IGame {
    const questions = this.generateGameQuestions(songs, songs, decadeConfig.categoryName);

    const title = `${decadeConfig.decade} Classics ${gameNumber}`;
    const description = `10 questions about hits from the ${decadeConfig.decade}`;

    return {
      gameId: uuidv4(),
      date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
      title,
      description,
      questions,
      isDaily: false,
      theme: decadeConfig.decade as any
    };
  }

  async generateDecadeGames(decade: string, count: number = 10): Promise<IGame[]> {
    const decadeConfig = DECADES.find(d => d.decade === decade);
    if (!decadeConfig) {
      throw new Error(`Invalid decade: ${decade}`);
    }

    const decadeSongs = this.getSongsForDecade(
      decadeConfig.yearStart,
      decadeConfig.yearEnd
    );

    if (decadeSongs.length < 10) {
      throw new Error(`Not enough songs for ${decade}. Found ${decadeSongs.length}, need at least 10.`);
    }

    const games: IGame[] = [];
    const existingGames = GameRepository.findByTheme(decade as any);
    const startNumber = existingGames.length + 1;

    for (let i = 0; i < count; i++) {
      this.usedQuestions.clear();
      const game = this.generateGame(decadeConfig, startNumber + i, decadeSongs);
      games.push(game);
    }

    return games;
  }
}

export class AdminController {
  /**
   * GET /api/admin/stats
   * Get database statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const allGames = GameRepository.findAll();
      const gamesByDecade: Record<string, number> = {};
      
      allGames.forEach(game => {
        const theme = game.theme || 'Unknown';
        gamesByDecade[theme] = (gamesByDecade[theme] || 0) + 1;
      });

      const totalQuestions = allGames.reduce((sum, game) => sum + game.questions.length, 0);

      res.json({
        totalGames: allGames.length,
        totalQuestions,
        gamesByDecade: Object.entries(gamesByDecade).map(([decade, count]) => ({
          decade,
          count
        })).sort((a, b) => a.decade.localeCompare(b.decade))
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/admin/decades
   * Get available decades for generation
   */
  async getDecades(req: Request, res: Response) {
    try {
      const dataPath = path.join(__dirname, '../data/json/billboard_complete.json');
      
      if (!fs.existsSync(dataPath)) {
        return res.status(500).json({ 
          message: 'Billboard data not found',
          decades: []
        });
      }

      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const songs: BillboardSong[] = JSON.parse(rawData);

      const decadesWithCounts = DECADES.map(decade => {
        const songCount = songs.filter(
          song => song.year >= decade.yearStart && song.year <= decade.yearEnd
        ).length;

        const existingGames = GameRepository.findByTheme(decade.decade as any);

        return {
          decade: decade.decade,
          categoryName: decade.categoryName,
          yearRange: `${decade.yearStart}-${decade.yearEnd}`,
          availableSongs: songCount,
          existingGames: existingGames.length,
          canGenerate: songCount >= 10
        };
      });

      res.json(decadesWithCounts);
    } catch (error) {
      console.error('Error fetching decades:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * POST /api/admin/generate
   * Generate games for a specific decade
   */
  async generateGames(req: Request, res: Response) {
    try {
      const { decade, count = 10 } = req.body;

      if (!decade) {
        return res.status(400).json({ message: 'Decade is required' });
      }

      if (count < 1 || count > 100) {
        return res.status(400).json({ message: 'Count must be between 1 and 100' });
      }

      const dataPath = path.join(__dirname, '../data/json/billboard_complete.json');
      
      if (!fs.existsSync(dataPath)) {
        return res.status(500).json({ message: 'Billboard data not found' });
      }

      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const songs: BillboardSong[] = JSON.parse(rawData);

      const generator = new StrictDecadeGameGenerator(songs);
      const games = await generator.generateDecadeGames(decade, count);

      let saved = 0;
      for (const game of games) {
        GameRepository.create(game);
        saved++;
      }

      res.json({
        message: `Successfully generated ${saved} games for ${decade}`,
        generated: saved,
        decade
      });
    } catch (error: any) {
      console.error('Error generating games:', error);
      res.status(500).json({ 
        message: error.message || 'Server error'
      });
    }
  }

  /**
   * DELETE /api/admin/games/:theme
   * Delete all games for a specific theme/decade
   */
  async deleteGamesByTheme(req: Request, res: Response) {
    try {
      const { theme } = req.params;

      const deleted = GameRepository.deleteByTheme(theme as any);

      res.json({
        message: `Successfully deleted ${deleted} games for ${theme}`,
        deleted,
        theme
      });
    } catch (error) {
      console.error('Error deleting games:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * GET /api/admin/database/export
   * Export the database file
   */
  async exportDatabase(req: Request, res: Response) {
    try {
      if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ message: 'Database file not found' });
      }

      const stats = fs.statSync(dbPath);
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `jitterbox-rocks-${timestamp}.db`;

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);

      const fileStream = fs.createReadStream(dbPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error exporting database:', error);
      res.status(500).json({ message: 'Error exporting database' });
    }
  }

  /**
   * POST /api/admin/database/import
   * Import a database file (requires multer middleware)
   */
  async importDatabase(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const uploadedFile = req.file.path;
      const backupPath = `${dbPath}.backup-${Date.now()}`;

      // Create backup of current database
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ Created backup at ${backupPath}`);
      }

      try {
        // Replace database file
        fs.copyFileSync(uploadedFile, dbPath);
        console.log(`✅ Imported new database from ${uploadedFile}`);

        // Reload database connection
        const reloaded = reloadDatabase();
        
        if (!reloaded) {
          throw new Error('Failed to reload database connection');
        }

        // Clean up uploaded file
        fs.unlinkSync(uploadedFile);

        // Verify new database by trying to read games
        const games = GameRepository.findAll();
        
        res.json({
          message: 'Database imported successfully',
          games: games.length,
          backup: backupPath
        });
      } catch (error) {
        // Restore from backup on error
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, dbPath);
          reloadDatabase();
          console.log('❌ Import failed, restored from backup');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error importing database:', error);
      res.status(500).json({ 
        message: error.message || 'Error importing database' 
      });
    }
  }
}

const adminController = new AdminController();
export default adminController;
