# Billboard Hot 100 Game Generator - Quick Start

This directory contains everything needed to generate 10,000 music trivia games from Billboard Hot 100 data (1940-2025).

## Overview

The system consists of three main components:

1. **Data Collection** - Gather Billboard chart data and enrich with metadata
2. **Question Generation** - Create diverse trivia questions from song data
3. **Batch Generation** - Generate and save 10,000 games to database

## Quick Start (3 Steps)

### Step 1: Get Billboard Data

**Option A: Use Pre-built Datasets (Recommended)**

Download Billboard Hot 100 datasets from:
- [Kaggle Billboard Datasets](https://www.kaggle.com/search?q=billboard+hot+100)
- [GitHub Billboard Datasets](https://github.com/search?q=billboard+hot+100+dataset)

Place JSON files in `server/data/json/`:
```
server/data/json/
  ├── billboard_1940s.json
  ├── billboard_1950s.json
  ├── billboard_1960s.json
  ...
  └── billboard_2020s.json
```

Each JSON file should be an array of songs matching the `BillboardSong` schema.

**Option B: Collect Data Yourself**

1. Set up API keys in `.env`:
```bash
GENIUS_API_TOKEN=your_token_here
LASTFM_API_KEY=your_key_here
```

2. Run the data collector:
```bash
npm run collect-data
```

This will take several hours but produce enriched data with facts, metadata, and trivia.

### Step 2: Generate Games

Once you have 5,000+ songs in `billboardData.ts`:

```bash
npm run generate-billboard-games
```

This will:
- Generate 10,000 unique games (100,000 questions)
- Create 365 daily games (1 year)
- Create 9,635 practice games
- Save everything to SQLite database

Estimated time: 10-30 minutes depending on your computer.

### Step 3: Play!

Start the application:
```bash
docker compose up -d
```

Or run locally:
```bash
npm run dev
```

Visit `http://localhost:3000` and start playing!

## File Structure

```
server/
├── data/
│   ├── billboardSchema.ts      # TypeScript interfaces for Billboard data
│   ├── billboardData.ts        # Main data file (populated by collector)
│   ├── questionGenerator.ts    # Generates trivia questions from songs
│   ├── batchGameGenerator.ts   # Generates thousands of games
│   └── json/                   # Optional: Raw JSON data files
│       ├── billboard_1940s.json
│       └── ...
├── scripts/
│   ├── collectAllData.ts       # Master data collection script
│   ├── fetchBillboardData.ts   # Billboard chart fetching
│   ├── enrichSongData.ts       # Metadata enrichment (Genius, MusicBrainz, etc.)
│   └── generateBillboardGames.ts # Game generation script
└── ...
```

## Question Types Generated

The generator creates diverse questions:

1. **Who Sang Questions** (Multiple Choice)
   - "Who sang 'Billie Jean'?" → Michael Jackson

2. **What Year Questions** (Multiple Choice)
   - "What year did 'Respect' by Aretha Franklin reach the charts?" → 1967

3. **Artist Name Questions** (Text Input)
   - "Who performed 'Bohemian Rhapsody'?" → Queen

4. **Album Questions** (Multiple Choice)
   - "Which album featured 'Stairway to Heaven'?" → Led Zeppelin IV

5. **Chart Position Questions** (Multiple Choice)
   - "What was the peak position of 'Like a Virgin'?" → #1

6. **Decade Questions** (Multiple Choice)
   - "In which decade was 'Smells Like Teen Spirit' released?" → 1990s

7. **Songwriter Questions** (Multiple Choice)
   - "Who wrote 'Respect'?" → Otis Redding

8. **Trivia/Fact Questions** (Text Input)
   - Based on interesting facts gathered from Wikipedia, Genius, etc.

## Data Requirements

For high-quality 10,000 games:

**Minimum:**
- 5,000 unique songs
- Title, artist, year for all songs
- 30% with interesting facts

**Recommended:**
- 8,000-10,000 unique songs
- 70%+ with album information
- 50%+ with interesting facts/trivia
- Diverse mix across all decades
- Genre classifications
- Award information (Grammy, Platinum status)

## Advanced Configuration

### Customize Question Distribution

Edit `questionGenerator.ts` line ~220:

```typescript
const generators = [
  () => this.generateWhoSangQuestion(...),
  () => this.generateArtistTextQuestion(...),
  // Add more or remove question types
];
```

### Change Games Generated

Edit `generateBillboardGames.ts` line ~51:

```typescript
await generator.generateAndSave(
  10000,  // Change total games
  startDate
);
```

### Adjust Daily vs Practice Split

Edit `batchGameGenerator.ts` line ~113:

```typescript
async generateGames(
  count: number,
  startDate: Date = new Date(),
  dailyGamesCount: number = 365  // Adjust daily games
)
```

## Performance Tips

1. **Database Performance**: Games are saved in batches of 100. Adjust in `batchGameGenerator.ts` line ~159.

2. **Memory Usage**: The generator clears question cache every 1,000 games to allow controlled repetition.

3. **Multi-core Processing**: For even faster generation, you could split into chunks and process in parallel.

## Troubleshooting

**"Not enough Billboard data loaded"**
- You need at least 100 songs to test, 5,000+ for production
- Check that `billboardData.ts` is properly populated

**"Generation is slow"**
- Normal for 10,000 games
- Consider generating 1,000 first for testing
- Run overnight for full 10,000

**"Questions are repetitive"**
- Add more source songs
- Enhance song metadata with more facts
- Adjust question cache clearing frequency

**"API rate limits hit during collection"**
- Increase `delayMs` in `collectAllData.ts`
- Process in smaller batches
- Spread collection over multiple days

## Data Sources Reference

### Free APIs (No Authentication)
- **MusicBrainz**: https://musicbrainz.org/doc/MusicBrainz_API
- **Wikipedia**: https://www.mediawiki.org/wiki/API

### Free APIs (Require Key)
- **Genius**: https://docs.genius.com/
- **Last.fm**: https://www.last.fm/api

### Pre-built Datasets
- **Kaggle**: https://www.kaggle.com/
- **GitHub**: Search "billboard hot 100 dataset"
- **Million Song Dataset**: http://millionsongdataset.com/

## Testing

Test with small dataset first:

1. Use sample data (15 songs provided)
2. Generate 100 games:
   ```bash
   # Edit generateBillboardGames.ts, change 10000 to 100
   npm run generate-billboard-games
   ```
3. Verify games work in UI
4. Then scale up to full 10,000

## Next Steps

1. ✅ Set up data sources
2. ✅ Populate `billboardData.ts`
3. ✅ Run generator script
4. ✅ Test in browser
5. Share with friends and enjoy!

## Support

For issues or questions:
- Check the main `DATA_COLLECTION.md` guide
- Review example data in `billboardData.ts`
- Verify APIs are responding correctly

---

**Estimated Total Time**: 
- Using pre-built datasets: ~2 hours
- Collecting data yourself: ~150 hours

**Recommended Approach**: Use pre-built datasets from Kaggle, enrich with your own API calls for facts and metadata.
