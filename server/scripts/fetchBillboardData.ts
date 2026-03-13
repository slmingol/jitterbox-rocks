/**
 * Billboard Data Scraper
 * Fetches chart data from Billboard.com
 * 
 * NOTE: Web scraping may violate Billboard's Terms of Service.
 * Consider using official APIs or pre-built datasets instead.
 */

import axios from 'axios';
import { BillboardSong } from '../data/billboardSchema';

export async function fetchBillboardChart(
  chartType: 'hot-100' | 'billboard-200' = 'hot-100',
  date?: string
): Promise<BillboardSong[]> {
  const songs: BillboardSong[] = [];
  
  // This is a placeholder - actual Billboard scraping would require:
  // 1. Proper HTML parsing with cheerio
  // 2. Handling of dynamic content (may need Puppeteer)
  // 3. Rate limiting to avoid IP bans
  // 4. Proper error handling and retries
  
  console.warn('Billboard scraping not implemented - use alternative data sources');
  console.warn('Recommended: Download pre-built datasets from Kaggle or academic sources');
  
  return songs;
}

/**
 * Alternative: Load from pre-downloaded JSON files
 */
export function loadBillboardFromJSON(decade: number): BillboardSong[] {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const filePath = path.join(__dirname, `../data/json/billboard_${decade}s.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as BillboardSong[];
  } catch (error) {
    console.error(`Error loading billboard_${decade}s.json:`, error);
    return [];
  }
}

/**
 * Load all decades
 */
export function loadAllBillboardData(): BillboardSong[] {
  const decades = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  let allSongs: BillboardSong[] = [];
  
  for (const decade of decades) {
    const songs = loadBillboardFromJSON(decade);
    allSongs = allSongs.concat(songs);
  }
  
  console.log(`Loaded ${allSongs.length} songs from JSON files`);
  return allSongs;
}
