/**
 * Generate Strict Decade Games
 * Creates 100 games per decade (1950s-1990s) where ALL questions belong to that decade's category
 * 
 * Usage:
 * npx ts-node server/scripts/generateStrictDecadeGames.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { BillboardSong } from '../data/billboardSchema';
import { GameRepository, IGame } from '../repositories/GameRepository';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay } from 'date-fns';

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
];

class StrictDecadeGameGenerator {
  private songs: BillboardSong[];
  private usedQuestions: Set<string> = new Set();

  constructor(songs: BillboardSong[]) {
    this.songs = songs;
  }

  /**
   * Get songs for a specific decade
   */
  private getSongsForDecade(yearStart: number, yearEnd: number): BillboardSong[] {
    return this.songs.filter(song => song.year >= yearStart && song.year <= yearEnd);
  }

  /**
   * Shuffle array
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Create a question hash to avoid duplicates
   */
  private hashQuestion(question: string, answer: string): string {
    return `${question.toLowerCase().trim()}|${answer.toLowerCase().trim()}`;
  }

  /**
   * Check if question is unique
   */
  private isUnique(question: string, answer: string): boolean {
    const hash = this.hashQuestion(question, answer);
    if (this.usedQuestions.has(hash)) {
      return false;
    }
    this.usedQuestions.add(hash);
    return true;
  }

  /**
   * Generate "Who sang" question
   */
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

  /**
   * Generate "What year" question
   */
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

  /**
   * Generate artist text input question
   */
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

  /**
   * Generate album question
   */
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

  /**
   * Generate peak position question
   */
  private generatePeakPositionQuestion(song: BillboardSong, category: string) {
    if (song.peakPosition > 10) return null; // Only for top 10 hits
    
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

  /**
   * Generate questions for a single game
   */
  private generateGameQuestions(
    songs: BillboardSong[],
    allDecadeSongs: BillboardSong[],
    category: string
  ) {
    const questions: any[] = [];
    const targetCount = 10;

    // Select 10 random songs
    const selectedSongs = this.shuffle([...songs]).slice(0, targetCount);

    for (const song of selectedSongs) {
      if (questions.length >= targetCount) break;

      // Get potential distractors from the same decade
      const sameDecade = allDecadeSongs.filter(s => s.artist !== song.artist);
      const artistDistractors = this.shuffle(sameDecade.map(s => s.artist)).slice(0, 3);
      const yearDistractors = this.shuffle([...new Set(sameDecade.map(s => s.year))]).slice(0, 3);
      const albumDistractors = this.shuffle(
        sameDecade.filter(s => s.album).map(s => s.album!)
      ).slice(0, 3);

      // Try different question types
      const generators = [
        () => this.generateWhoSangQuestion(song, artistDistractors, category),
        () => this.generateArtistTextQuestion(song, category),
        () => this.generateWhatYearQuestion(song, yearDistractors, category),
        () => this.generateAlbumQuestion(song, albumDistractors, category),
        () => this.generatePeakPositionQuestion(song, category),
      ];

      // Randomly select a generator
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

  /**
   * Generate a single game for a decade
   */
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

  /**
   * Generate games for all decades
   */
  async generateAllDecadeGames() {
    const allGames: IGame[] = [];

    for (const decadeConfig of DECADES) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Generating ${decadeConfig.decade} Games`);
      console.log(`${'='.repeat(50)}`);

      const decadeSongs = this.getSongsForDecade(
        decadeConfig.yearStart,
        decadeConfig.yearEnd
      );

      console.log(`Found ${decadeSongs.length} songs from ${decadeConfig.yearStart}-${decadeConfig.yearEnd}`);

      if (decadeSongs.length < 10) {
        console.warn(`Not enough songs for ${decadeConfig.decade}. Skipping...`);
        continue;
      }

      // Generate 100 games for this decade
      const gamesPerDecade = 100;
      console.log(`Generating ${gamesPerDecade} games...`);

      for (let i = 1; i <= gamesPerDecade; i++) {
        this.usedQuestions.clear(); // Clear for each game to allow question reuse across games
        const game = this.generateGame(decadeConfig, i, decadeSongs);
        allGames.push(game);

        if (i % 10 === 0) {
          process.stdout.write(`  Generated ${i}/${gamesPerDecade} games\r`);
        }
      }

      console.log(`  Generated ${gamesPerDecade}/${gamesPerDecade} games ✓`);
    }

    return allGames;
  }

  /**
   * Save games to database
   */
  async saveGamesToDatabase(games: IGame[]) {
    console.log(`\nSaving ${games.length} games to database...`);

    let saved = 0;
    for (const game of games) {
      GameRepository.create(game);
      saved++;
      if (saved % 10 === 0) {
        process.stdout.write(`  Saved ${saved}/${games.length} games\r`);
      }
    }

    console.log(`  Saved ${saved}/${games.length} games ✓`);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Strict Decade Game Generator');
  console.log('='.repeat(50));
  console.log();

  // Load Billboard data
  const dataPath = path.join(__dirname, '../data/json/billboard_complete.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('Error: Billboard data not found!');
    console.error('Please ensure billboard_complete.json exists in server/data/json/');
    process.exit(1);
  }

  console.log('Loading Billboard data...');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const songs: BillboardSong[] = JSON.parse(rawData);
  console.log(`Loaded ${songs.length} Billboard songs`);

  const startTime = Date.now();
  
  const generator = new StrictDecadeGameGenerator(songs);
  const games = await generator.generateAllDecadeGames();

  console.log(`\n${'='.repeat(50)}`);
  console.log('Saving to database...');
  console.log(`${'='.repeat(50)}`);
  
  await generator.saveGamesToDatabase(games);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  console.log();
  console.log('='.repeat(50));
  console.log('Generation Complete!');
  console.log('='.repeat(50));
  console.log(`Total games generated: ${games.length}`);
  console.log(`Total time: ${totalTime} seconds`);
  console.log();
  console.log('Games per decade:');
  
  const byDecade: Record<string, number> = {};
  for (const game of games) {
    byDecade[game.theme || 'unknown'] = (byDecade[game.theme || 'unknown'] || 0) + 1;
  }
  
  Object.entries(byDecade).sort().forEach(([decade, count]) => {
    console.log(`  ${decade}: ${count} games`);
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
