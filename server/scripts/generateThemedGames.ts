/**
 * Generate Themed Billboard Games
 * Creates games focused on specific decades
 * 
 * Usage:
 * npx ts-node server/scripts/generateThemedGames.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { BatchGameGenerator, GameTheme } from '../data/batchGameGenerator';
import { BillboardSong } from '../data/billboardSchema';

async function main() {
  console.log('='.repeat(50));
  console.log('Billboard Themed Game Generator');
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

  // Analyze decade distribution
  const decadeStats: Record<string, number> = {};
  for (const song of songs) {
    const decade = Math.floor(song.year / 10) * 10;
    const key = `${decade}s`;
    decadeStats[key] = (decadeStats[key] || 0) + 1;
  }

  console.log('\nSongs per decade:');
  Object.entries(decadeStats).sort().forEach(([decade, count]) => {
    console.log(`  ${decade}: ${count} songs`);
  });

  // Theme distribution - equal distribution: 100 games per theme
  const themeDistribution: Record<GameTheme, number> = {
    'mixed': 1.0,   // 100 mixed decade games
    '1950s': 1.0,   // 100 1950s games
    '1960s': 1.0,   // 100 1960s games
    '1970s': 1.0,   // 100 1970s games
    '1980s': 1.0,   // 100 1980s games
    '1990s': 1.0,   // 100 1990s games
    '2000s': 1.0,   // 100 2000s games
    '2010s': 1.0,   // 100 2010s games
    '2020s': 1.0,   // 100 2020s games
  };

  console.log('\nTheme distribution:');
  Object.entries(themeDistribution).forEach(([theme, ratio]) => {
    console.log(`  ${theme}: Equal (100 games each)`);
  });

  // Generate 900 themed games (100 per theme × 9 themes)
  const gamesToGenerate = 900;
  const dailyGames = 900; // All are daily games

  console.log(`\nGenerating ${gamesToGenerate} themed games...`);
  console.log();

  const startTime = Date.now();
  
  const generator = new BatchGameGenerator(songs);
  const games = await generator.generateGames(
    gamesToGenerate,
    new Date(),
    dailyGames,
    themeDistribution
  );

  // Save to database
  console.log('\nSaving games to database...');
  await generator.saveGamesToDatabase(games);

  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  const gamesPerSecond = (gamesToGenerate / parseFloat(totalTime)).toFixed(2);

  console.log();
  console.log('='.repeat(50));
  console.log('Generation Complete!');
  console.log('='.repeat(50));
  console.log(`Total time: ${totalTime} seconds`);
  console.log(`Games per second: ${gamesPerSecond}`);
  console.log();
  console.log('Game breakdown by theme:');
  
  const themeCount: Record<string, number> = {};
  for (const game of games) {
    const titleMatch = game.title.match(/(\d{4}s)/);
    const theme = titleMatch ? titleMatch[1] : 'mixed';
    themeCount[theme] = (themeCount[theme] || 0) + 1;
  }
  
  Object.entries(themeCount).sort().forEach(([theme, count]) => {
    console.log(`  ${theme}: ${count} games`);
  });

  console.log();
  console.log('You can now:');
  console.log('1. Start the server: docker compose up -d');
  console.log('2. Visit: http://localhost:3000');
  console.log(`3. Play themed games by decade!`);
  console.log();

  process.exit(0);
}

main().catch((error) => {
  console.error('Error generating games:', error);
  process.exit(1);
});
