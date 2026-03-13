#!/usr/bin/env ts-node

/**
 * Script to generate 10,000 games from Billboard Hot 100 data
 * 
 * Usage:
 *   npm run generate-billboard-games
 * 
 * Or directly:
 *   ts-node server/scripts/generateBillboardGames.ts
 */

import { BatchGameGenerator } from '../data/batchGameGenerator';
import { BillboardSong } from '../data/billboardSchema';
import { startOfDay, addDays } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('=================================================');
  console.log('Billboard Hot 100 Game Generator');
  console.log('=================================================\n');

  // Load Billboard data from JSON
  const jsonPath = path.join(__dirname, '../data/json/billboard_complete.json');
  let billboardData: BillboardSong[] = [];

  if (fs.existsSync(jsonPath)) {
    console.log(`Loading data from: ${jsonPath}`);
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    billboardData = JSON.parse(jsonContent);
    console.log(`✅ Loaded ${billboardData.length} songs from JSON\n`);
  } else {
    console.error('ERROR: billboard_complete.json not found!');
    console.error(`Expected path: ${jsonPath}`);
    console.error('\nPlease run the Kaggle downloader first:\n');
    console.error('  docker compose -f docker-compose.kaggle.yml up\n');
    process.exit(1);
  }

  // Validate data
  if (billboardData.length < 10) {
    console.error('ERROR: Not enough Billboard data loaded!');
    console.error(`Current data: ${billboardData.length} songs`);
    console.error('Need at least 10 songs minimum\n');
    process.exit(1);
  }

  console.log(`Loaded ${billboardData.length} Billboard songs`);
  console.log('\nConfiguration:');
  console.log('- Total games to generate: 250');
  console.log('- Daily games: 250');
  console.log('- Practice games: 0');
  console.log('- Questions per game: 10');
  console.log('- Total questions: 2,500\n');

  if (billboardData.length < 5000) {
    console.warn('⚠️  WARNING: Limited song data detected!');
    console.warn(`   You have ${billboardData.length} songs, but 5,000-10,000 recommended for best variety.`);
    console.warn('   Games will reuse songs and questions may be repetitive.\n');
  }

  // Auto-proceed for smaller datasets
  if (billboardData.length < 100) {
    console.log('Running in TEST MODE with sample data (auto-proceeding)\n');
  }

  console.log('\nStarting generation...\n');

  // Initialize generator
  const generator = new BatchGameGenerator(billboardData);

  try {
    // Start date for daily games (today)
    const startDate = startOfDay(new Date());

    // Generate and save games
    const startTime = Date.now();
    
    await generator.generateAndSave(250, startDate);

    const endTime = Date.now();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n=================================================');
    console.log('Generation Complete!');
    console.log('=================================================');
    console.log(`Total time: ${durationSeconds} seconds`);
    console.log(`Games per second: ${(250 / parseFloat(durationSeconds)).toFixed(2)}`);
    console.log('\nYou can now:');
    console.log('1. Start the server: docker compose up -d');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Play 365 daily games or 9,635 practice games');
    console.log('\n');

  } catch (error) {
    console.error('\n=================================================');
    console.error('ERROR OCCURRED');
    console.error('=================================================');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
