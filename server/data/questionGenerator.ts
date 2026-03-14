import { IQuestion } from '../models/Game';
import { BillboardSong, ArtistInfo } from './billboardSchema';

/**
 * Question Generator for Billboard Hot 100 data
 * Creates diverse, interesting questions from song and artist metadata
 */

export class QuestionGenerator {
  private usedQuestions: Set<string> = new Set();

  /**
   * Generate a unique hash for a question to avoid duplicates
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
   * Create question object
   */
  private createQuestion(
    type: 'multiple-choice',
    question: string,
    correctAnswer: string,
    category: string,
    difficulty: 'easy' | 'medium' | 'hard',
    options: string[],
    hint?: string
  ): IQuestion | null {
    if (!this.isUnique(question, correctAnswer)) {
      return null;
    }

    return {
      type,
      question,
      correctAnswer,
      category,
      difficulty,
      options,
      hint,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
    };
  }

  /**
   * Generate "Who sang" questions
   */
  generateWhoSangQuestion(song: BillboardSong, distractors: string[]): IQuestion | null {
    return this.createQuestion(
      'multiple-choice',
      `Who sang "${song.title}"?`,
      song.artist,
      this.getCategoryForYear(song.year),
      'easy',
      [song.artist, ...distractors.slice(0, 3)]
    );
  }

  /**
   * Generate "What year" questions
   */
  generateWhatYearQuestion(song: BillboardSong, distractorYears: number[]): IQuestion | null {
    return this.createQuestion(
      'multiple-choice',
      `What year did "${song.title}" by ${song.artist} reach the charts?`,
      song.year.toString(),
      this.getCategoryForYear(song.year),
      'medium',
      [song.year.toString(), ...distractorYears.map(y => y.toString())]
    );
  }

  /**
   * Generate "Peak position" questions
   */
  generatePeakPositionQuestion(song: BillboardSong): IQuestion | null {
    if (song.peakPosition > 10) return null; // Only for top 10 hits
    
    const options = [song.peakPosition.toString(), '1', '5', '10']
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4);
    
    while (options.length < 4) {
      const random = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(random.toString())) {
        options.push(random.toString());
      }
    }

    return this.createQuestion(
      'multiple-choice',
      `What was the peak position of "${song.title}" on the Billboard Hot 100?`,
      song.peakPosition.toString(),
      this.getCategoryForYear(song.year),
      'hard',
      options
    );
  }

  /**
   * Generate album questions
   */
  generateAlbumQuestion(song: BillboardSong, distractors: string[]): IQuestion | null {
    if (!song.album) return null;

    return this.createQuestion(
      'multiple-choice',
      `Which album featured "${song.title}" by ${song.artist}?`,
      song.album,
      this.getCategoryForYear(song.year),
      'medium',
      [song.album, ...distractors.slice(0, 3)]
    );
  }

  /**
   * Generate alternative who sang question (removed text-input version)
   */
  generateArtistTextQuestion(song: BillboardSong): IQuestion | null {
    // Convert to multiple-choice with similar artists as distractors
    return null; // Handled by generateWhoSangQuestion instead
  }

  /**
   * Generate songwriter questions
   */
  generateSongwriterQuestion(song: BillboardSong, distractors: string[]): IQuestion | null {
    if (!song.writers || song.writers.length === 0) return null;

    const mainWriter = song.writers[0];
    return this.createQuestion(
      'multiple-choice',
      `Who wrote "${song.title}"?`,
      mainWriter,
      this.getCategoryForYear(song.year),
      'hard',
      [mainWriter, ...distractors.slice(0, 3)]
    );
  }

  /**
   * Generate record label questions
   */
  generateRecordLabelQuestion(song: BillboardSong, distractors: string[]): IQuestion | null {
    if (!song.recordLabel) return null;

    return this.createQuestion(
      'multiple-choice',
      `Which record label released "${song.title}" by ${song.artist}?`,
      song.recordLabel,
      'Music Business',
      'hard',
      [song.recordLabel, ...distractors.slice(0, 3)]
    );
  }

  /**
   * Generate fact-based questions (removed - text-input not supported)
   */
  generateFactQuestion(song: BillboardSong): IQuestion | null {
    // Removed text-input question type
    return null;
  }

  /**
   * Generate "number one hit" questions
   */
  generateNumberOneQuestion(song: BillboardSong, otherSongs: string[]): IQuestion | null {
    if (song.peakPosition !== 1) return null;

    return this.createQuestion(
      'multiple-choice',
      `Which of these songs by ${song.artist} reached #1 on the Billboard Hot 100?`,
      song.title,
      this.getCategoryForYear(song.year),
      'medium',
      [song.title, ...otherSongs.slice(0, 3)]
    );
  }

  /**
   * Generate decade identification questions
   */
  generateDecadeQuestion(song: BillboardSong): IQuestion | null {
    const decade = Math.floor(song.year / 10) * 10;
    const decades = ['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    const correctDecade = `${decade}s`;
    
    const options = [correctDecade];
    const correctIndex = decades.indexOf(correctDecade);
    
    // Add nearby decades as distractors
    if (correctIndex > 0) options.push(decades[correctIndex - 1]);
    if (correctIndex < decades.length - 1) options.push(decades[correctIndex + 1]);
    if (correctIndex > 1) options.push(decades[correctIndex - 2]);
    
    return this.createQuestion(
      'multiple-choice',
      `In which decade was "${song.title}" by ${song.artist} released?`,
      correctDecade,
      'Music History',
      'easy',
      options.slice(0, 4)
    );
  }

  /**
   * Generate artist trivia from artist info (removed - text-input not supported)
   */
  generateArtistTriviaQuestion(artist: ArtistInfo, songs: BillboardSong[]): IQuestion | null {
    // Removed text-input question type
    return null;
  }

  /**
   * Get category based on year/era
   */
  private getCategoryForYear(year: number): string {
    if (year >= 2020) return '2020s Hits';
    if (year >= 2010) return '2010s Pop';
    if (year >= 2000) return '2000s Music';
    if (year >= 1990) return '90s Classics';
    if (year >= 1980) return '80s Pop';
    if (year >= 1970) return '70s Rock';
    if (year >= 1960) return '60s Legends';
    if (year >= 1950) return '50s Classics';
    return 'Golden Oldies';
  }

  /**
   * Generate a complete set of questions for one game
   */
  generateGameQuestions(
    songs: BillboardSong[],
    allSongs: BillboardSong[],
    artistInfo?: ArtistInfo[]
  ): IQuestion[] {
    const questions: IQuestion[] = [];
    const targetCount = 10;

    // Select 10 random songs from the provided set
    const selectedSongs = this.shuffle([...songs]).slice(0, targetCount);

    for (const song of selectedSongs) {
      if (questions.length >= targetCount) break;

      // Get potential distractors from same era
      const sameEra = allSongs.filter(s => 
        Math.abs(s.year - song.year) <= 5 && 
        s.artist !== song.artist
      );

      // Try different question types (all multiple-choice)
      const generators = [
        () => this.generateWhoSangQuestion(song, this.shuffle(sameEra.map(s => s.artist)).slice(0, 3)),
        () => this.generateDecadeQuestion(song),
        () => song.peakPosition === 1 ? this.generateNumberOneQuestion(song, this.shuffle(sameEra.map(s => s.title)).slice(0, 3)) : null,
        () => this.generateAlbumQuestion(song, this.shuffle(allSongs.filter(s => s.album).map(s => s.album!)).slice(0, 3)),
        () => this.generatePeakPositionQuestion(song),
      ];

      // Randomly select a generator
      const shuffledGenerators = this.shuffle(generators);
      
      for (const generator of shuffledGenerators) {
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
   * Shuffle array helper
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
   * Clear used questions cache
   */
  clearCache() {
    this.usedQuestions.clear();
  }
}
