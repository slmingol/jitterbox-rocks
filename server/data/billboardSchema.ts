/**
 * Schema for Billboard Hot 100 song data
 * This data structure should be populated from Billboard archives
 */

export interface BillboardSong {
  title: string;
  artist: string;
  peakPosition: number;
  weeksOnChart: number;
  chartDate: string; // YYYY-MM-DD format
  year: number;
  
  // Extended metadata (to be gathered from music databases)
  album?: string;
  recordLabel?: string;
  producers?: string[];
  writers?: string[];
  genre?: string[];
  
  // Interesting facts (from archives/databases)
  facts?: string[];
  
  // Awards and achievements
  grammy?: boolean;
  platinumStatus?: 'Gold' | 'Platinum' | 'Multi-Platinum' | 'Diamond';
  
  // Musical details
  duration?: number; // in seconds
  key?: string;
  tempo?: number; // BPM
  
  // Chart performance
  consecutiveWeeksAtOne?: number;
  yearEndPosition?: number;
}

export interface ArtistInfo {
  name: string;
  realName?: string;
  birthYear?: number;
  birthPlace?: string;
  members?: string[]; // For bands
  formedYear?: number;
  genres?: string[];
  facts?: string[];
  notableAlbums?: string[];
  totalNumberOnes?: number;
  totalTop10s?: number;
}

export interface MusicEra {
  name: string;
  startYear: number;
  endYear: number;
  characteristics: string[];
  notableArtists: string[];
}
