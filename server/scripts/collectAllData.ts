#!/usr/bin/env ts-node

/**
 * Automated Billboard Data Collection Script
 * 
 * This script orchestrates the complete data collection pipeline:
 * 1. Load Billboard chart data (from JSON files or APIs)
 * 2. Enrich with metadata from multiple sources
 * 3. Validate and clean the data
 * 4. Save to structured JSON files
 * 
 * Usage:
 *   npm run collect-data
 */

import { BillboardSong } from '../data/billboardSchema';
import { loadAllBillboardData } from './fetchBillboardData';
import { enrichSongBatch } from './enrichSongData';
import * as fs from 'fs';
import * as path from 'path';

async function collectAllData() {
  console.log('=================================================');
  console.log('Billboard Data Collection & Enrichment');
  console.log('=================================================\n');

  // Step 1: Load base Billboard data
  console.log('Step 1: Loading Billboard chart data...\n');
  
  let songs: BillboardSong[] = [];
  
  // Try to load from JSON files first
  try {
    songs = loadAllBillboardData();
  } catch (error) {
    console.error('Could not load Billboard data from JSON files');
    console.error('Please download Billboard datasets and place in server/data/json/');
    console.error('\nRecommended sources:');
    console.error('- Kaggle: https://www.kaggle.com/search?q=billboard+hot+100');
    console.error('- GitHub: Search for "billboard-hot-100-dataset"');
    console.error('- Academic: Million Song Dataset\n');
    process.exit(1);
  }

  if (songs.length === 0) {
    console.error('No songs loaded! Please populate data files.');
    process.exit(1);
  }

  console.log(`Loaded ${songs.length} base songs\n`);

  // Step 2: Data validation
  console.log('Step 2: Validating data...\n');
  
  const validSongs = songs.filter(song => {
    return song.title && 
           song.artist && 
           song.year >= 1940 && 
           song.year <= 2025;
  });

  console.log(`Valid songs: ${validSongs.length}/${songs.length}\n`);

  // Step 3: Enrich with metadata
  console.log('Step 3: Enriching with metadata...\n');
  console.log('This may take several hours depending on the number of songs\n');

  const apiKeysPresent = {
    genius: !!process.env.GENIUS_API_TOKEN,
    lastfm: !!process.env.LASTFM_API_KEY,
  };

  console.log('API Keys status:');
  console.log(`- Genius: ${apiKeysPresent.genius ? '✓' : '✗'}`);
  console.log(`- Last.fm: ${apiKeysPresent.lastfm ? '✓' : '✗'}`);
  console.log(`- MusicBrainz: ✓ (no key required)`);
  console.log(`- Wikipedia: ✓ (no key required)\n`);

  if (!apiKeysPresent.genius && !apiKeysPresent.lastfm) {
    console.warn('WARNING: No API keys configured. Enrichment will be limited.\n');
  }

  // Enrich in batches
  const sources: ('genius' | 'musicbrainz' | 'lastfm' | 'wikipedia')[] = [
    'musicbrainz',
    'wikipedia'
  ];

  if (apiKeysPresent.genius) sources.push('genius');
  if (apiKeysPresent.lastfm) sources.push('lastfm');

  const enrichedSongs = await enrichSongBatch(validSongs, {
    batchSize: 20,
    delayMs: 1500,
    sources
  });

  console.log(`\nEnriched ${enrichedSongs.length} songs\n`);

  // Step 4: Calculate statistics
  console.log('Step 4: Data statistics...\n');
  
  const stats = {
    total: enrichedSongs.length,
    withAlbum: enrichedSongs.filter(s => s.album).length,
    withFacts: enrichedSongs.filter(s => s.facts && s.facts.length > 0).length,
    withGenre: enrichedSongs.filter(s => s.genre && s.genre.length > 0).length,
    withLabel: enrichedSongs.filter(s => s.recordLabel).length,
    withDuration: enrichedSongs.filter(s => s.duration).length,
    numberOnes: enrichedSongs.filter(s => s.peakPosition === 1).length,
  };

  console.log('Statistics:');
  console.log(`- Total songs: ${stats.total}`);
  console.log(`- With album info: ${stats.withAlbum} (${(stats.withAlbum/stats.total*100).toFixed(1)}%)`);
  console.log(`- With facts: ${stats.withFacts} (${(stats.withFacts/stats.total*100).toFixed(1)}%)`);
  console.log(`- With genre: ${stats.withGenre} (${(stats.withGenre/stats.total*100).toFixed(1)}%)`);
  console.log(`- With label: ${stats.withLabel} (${(stats.withLabel/stats.total*100).toFixed(1)}%)`);
  console.log(`- With duration: ${stats.withDuration} (${(stats.withDuration/stats.total*100).toFixed(1)}%)`);
  console.log(`- Number ones: ${stats.numberOnes}\n`);

  // Step 5: Save data
  console.log('Step 5: Saving enriched data...\n');

  const dataDir = path.join(__dirname, '../data');
  
  // Save complete dataset
  const completePath = path.join(dataDir, 'billboard_complete.json');
  fs.writeFileSync(completePath, JSON.stringify(enrichedSongs, null, 2));
  console.log(`Saved complete dataset to: ${completePath}`);

  // Save by decade for easier management
  const decades = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  for (const decade of decades) {
    const decadeSongs = enrichedSongs.filter(s => 
      s.year >= decade && s.year < decade + 10
    );
    
    if (decadeSongs.length > 0) {
      const decadePath = path.join(dataDir, `billboard_${decade}s.json`);
      fs.writeFileSync(decadePath, JSON.stringify(decadeSongs, null, 2));
      console.log(`Saved ${decade}s: ${decadeSongs.length} songs`);
    }
  }

  // Step 6: Update billboardData.ts
  console.log('\nStep 6: Updating billboardData.ts...\n');

  const importStatement = `import { BillboardSong } from './billboardSchema';\n\n`;
  const dataExport = `export const billboardData: BillboardSong[] = ${JSON.stringify(enrichedSongs, null, 2)};\n`;
  
  const billboardDataPath = path.join(dataDir, 'billboardData.ts');
  fs.writeFileSync(billboardDataPath, importStatement + dataExport);
  
  console.log('Updated billboardData.ts with enriched data\n');

  // Summary
  console.log('=================================================');
  console.log('Data Collection Complete!');
  console.log('=================================================');
  console.log(`Total songs collected: ${enrichedSongs.length}`);
  console.log(`Estimated games possible: ${Math.floor(enrichedSongs.length / 10) * 10}`);
  console.log('\nNext steps:');
  console.log('1. Review the enriched data in server/data/');
  console.log('2. Run: npm run generate-billboard-games');
  console.log('3. Start the server and play!\n');
}

// Run the collection
collectAllData().catch(error => {
  console.error('\n=================================================');
  console.error('ERROR OCCURRED');
  console.error('=================================================');
  console.error(error);
  process.exit(1);
});
