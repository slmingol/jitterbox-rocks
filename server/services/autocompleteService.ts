import { promises as fs, existsSync, readFileSync } from 'fs';
import path from 'path';
import { BillboardSong } from '../data/billboardSchema';

interface AutocompleteResult {
  artists: string[];
  songs: string[];
}

export class AutocompleteService {
  private songs: BillboardSong[] = [];
  private artistSet: Set<string> = new Set();
  private songTitles: Set<string> = new Set();
  private initialized = false;

  /**
   * Initialize the autocomplete service by loading all songs
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const jsonPath = path.join(process.cwd(), 'server/data/json/billboard_complete.json');
      
      if (existsSync(jsonPath)) {
        const data = readFileSync(jsonPath, 'utf-8');
        this.songs = JSON.parse(data);
        
        // Build artist and song sets for fast lookup
        this.songs.forEach(song => {
          if (song.artist) {
            this.artistSet.add(song.artist);
          }
          if (song.title) {
            this.songTitles.add(song.title);
          }
        });

        console.log(`✅ Autocomplete initialized with ${this.songs.length} songs`);
        console.log(`   - ${this.artistSet.size} unique artists`);
        console.log(`   - ${this.songTitles.size} unique song titles`);
        this.initialized = true;
      } else {
        console.warn('⚠️ Billboard data file not found, autocomplete will be limited');
      }
    } catch (error) {
      console.error('Error initializing autocomplete service:', error);
    }
  }

  /**
   * Get autocomplete suggestions for a given query
   */
  getSuggestions(query: string, limit: number = 10): AutocompleteResult {
    if (!query || query.length < 2) {
      return { artists: [], songs: [] };
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Find matching artists
    const matchingArtists = Array.from(this.artistSet)
      .filter(artist => artist.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        // Prioritize matches at the start of the string
        const aStarts = a.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.toLowerCase().startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, limit);

    // Find matching songs
    const matchingSongs = Array.from(this.songTitles)
      .filter(title => title.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        // Prioritize matches at the start of the string
        const aStarts = a.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.toLowerCase().startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, limit);

    return {
      artists: matchingArtists,
      songs: matchingSongs
    };
  }

  /**
   * Get suggestions based on question type
   * - If question asks about artist, only return artist suggestions
   * - If question asks about song, only return song suggestions
   */
  getSmartSuggestions(query: string, questionText: string, limit: number = 10): string[] {
    if (!query || query.length < 2) {
      return [];
    }

    const questionLower = questionText.toLowerCase();
    const isArtistQuestion = questionLower.includes('who performed') || 
                            questionLower.includes('who sang') ||
                            questionLower.includes('artist');
    
    const isSongQuestion = questionLower.includes('what song') || 
                          questionLower.includes('which song') ||
                          questionLower.includes('name the song');

    const suggestions = this.getSuggestions(query, limit);

    if (isArtistQuestion) {
      return suggestions.artists;
    } else if (isSongQuestion) {
      return suggestions.songs;
    } else {
      // Return both, artists first
      return [...suggestions.artists, ...suggestions.songs].slice(0, limit);
    }
  }
}

export default new AutocompleteService();
