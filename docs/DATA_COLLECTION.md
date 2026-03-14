# Billboard Hot 100 Data Collection Guide

This guide explains how to collect Billboard Hot 100 data from 1940-2025 to generate 10,000 music trivia games.

## Quick Start

For 10,000 games with 10 questions each (100,000 total questions), you'll need approximately **5,000-10,000 unique songs** with rich metadata.

## Data Sources

### Primary Chart Data

1. **Billboard Official Data**
   - Billboard Charts Archive: https://www.billboard.com/charts/
   - Requires web scraping or official API access
   - Contains: Chart positions, dates, artist names, song titles

2. **Spotify Charts API**
   ```bash
   # Install Spotify Web API library
   npm install spotify-web-api-node
   ```
   - Historical chart data
   - Song metadata (duration, tempo, key)

3. **MusicBrainz Database**
   - Free music metadata database
   - API: https://musicbrainz.org/doc/MusicBrainz_API
   - Contains: Album info, record labels, release dates, ISRCs

### Enrichment Data

4. **Genius API** (Song Facts & Lyrics)
   ```bash
   npm install genius-lyrics-api
   ```
   - Song annotations and "behind the music" facts
   - Perfect for trivia questions
   - API: https://docs.genius.com/

5. **Wikipedia API** (Artist/Song Information)
   ```bash
   npm install wikipedia
   ```
   - Artist biographies
   - Song background and cultural impact
   - Awards and achievements

6. **Discogs API** (Detailed Music Database)
   - Record label information
   - Producer credits
   - Release variations
   - API: https://www.discogs.com/developers

7. **Last.fm API** (Tags and Statistics)
   - Genre classification
   - Popularity metrics
   - Similar artists
   - API: https://www.last.fm/api

## Step-by-Step Collection Process

### Step 1: Get Billboard Chart Data

Create `server/scripts/fetchBillboardData.ts`:

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BillboardSong } from '../data/billboardSchema';

async function scrapeBillboardChart(date: string): Promise<BillboardSong[]> {
  const url = `https://www.billboard.com/charts/hot-100/${date}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  const songs: BillboardSong[] = [];
  
  // Parse chart entries
  $('.chart-list-item').each((i, elem) => {
    const title = $(elem).find('.chart-list-item__title').text().trim();
    const artist = $(elem).find('.chart-list-item__artist').text().trim();
    const position = parseInt($(elem).find('.chart-list-item__rank').text());
    
    songs.push({
      title,
      artist,
      peakPosition: position,
      weeksOnChart: 1, // Will be updated
      chartDate: date,
      year: parseInt(date.split('-')[0])
    });
  });
  
  return songs;
}
```

### Step 2: Enrich with Metadata

Create `server/scripts/enrichSongData.ts`:

```typescript
import { BillboardSong } from '../data/billboardSchema';
import axios from 'axios';

async function enrichWithGenius(song: BillboardSong): Promise<BillboardSong> {
  const geniusToken = process.env.GENIUS_API_TOKEN;
  
  try {
    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(song.title + ' ' + song.artist)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'Authorization': `Bearer ${geniusToken}` }
    });
    
    const hit = response.data.response.hits[0];
    if (hit) {
      // Get song details
      const songUrl = hit.result.api_path;
      const songData = await axios.get(`https://api.genius.com${songUrl}`, {
        headers: { 'Authorization': `Bearer ${geniusToken}` }
      });
      
      song.facts = songData.data.response.song.description?.plain || [];
    }
  } catch (error) {
    console.error(`Error enriching ${song.title}:`, error);
  }
  
  return song;
}

async function enrichWithMusicBrainz(song: BillboardSong): Promise<BillboardSong> {
  try {
    const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=recording:${encodeURIComponent(song.title)}%20AND%20artist:${encodeURIComponent(song.artist)}&fmt=json`;
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'MusicTriviaGame/1.0' }
    });
    
    const recording = response.data.recordings[0];
    if (recording) {
      song.duration = recording.length ? Math.floor(recording.length / 1000) : undefined;
      song.album = recording.releases?.[0]?.title;
      song.recordLabel = recording.releases?.[0]?.['label-info']?.[0]?.label?.name;
    }
  } catch (error) {
    console.error(`Error enriching ${song.title} with MusicBrainz:`, error);
  }
  
  return song;
}
```

### Step 3: Automated Collection Script

Create `server/scripts/collectAllData.ts`:

```typescript
import { scrapeBillboardChart } from './fetchBillboardData';
import { enrichWithGenius, enrichWithMusicBrainz } from './enrichSongData';
import { BillboardSong } from '../data/billboardSchema';
import * as fs from 'fs';

async function collectAllBillboardData(): Promise<void> {
  const songs: BillboardSong[] = [];
  
  // Collect year-end charts from 1940-2025
  for (let year = 1940; year <= 2025; year++) {
    console.log(`Collecting year ${year}...`);
    
    // Get year-end chart
    const yearSongs = await scrapeBillboardChart(`${year}-12-31`);
    
    // Enrich each song
    for (const song of yearSongs.slice(0, 100)) { // Top 100 each year
      await enrichWithGenius(song);
      await enrichWithMusicBrainz(song);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    songs.push(...yearSongs);
    
    // Save progress periodically
    if (year % 10 === 0) {
      fs.writeFileSync(
        `server/data/billboard_${year}.json`,
        JSON.stringify(songs, null, 2)
      );
    }
  }
  
  // Save complete dataset
  fs.writeFileSync(
    'server/data/billboard_complete.json',
    JSON.stringify(songs, null, 2)
  );
  
  console.log(`Collected ${songs.length} songs!`);
}

collectAllBillboardData();
```

## Required Environment Variables

Create `.env` file:

```bash
# Genius API
GENIUS_API_TOKEN=your_token_here

# Spotify API
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_secret

# Discogs API
DISCOGS_TOKEN=your_token

# Last.fm API
LASTFM_API_KEY=your_key
```

## API Keys Setup

1. **Genius**: https://genius.com/api-clients
2. **Spotify**: https://developer.spotify.com/dashboard/applications
3. **Discogs**: https://www.discogs.com/settings/developers
4. **Last.fm**: https://www.last.fm/api/account/create

## Data Quality Checklist

Before generating games, ensure your data has:

- [ ] At least 5,000 unique songs
- [ ] Title and artist for all songs
- [ ] Peak position and chart date
- [ ] At least 50% have album information
- [ ] At least 30% have interesting facts
- [ ] Songs span multiple decades evenly
- [ ] Proper genre categorization
- [ ] No duplicate entries

## Alternative: Pre-built Datasets

If manual collection is too time-consuming, consider:

1. **Kaggle Datasets**
   - Search for "Billboard Hot 100" datasets
   - Many pre-scraped datasets available

2. **Academic Sources**
   - Million Song Dataset
   - Research databases with music charts

3. **Commercial APIs**
   - TheAudioDB
   - SetlistFM
   - Musicmatch

## Quick Test

To test with sample data:

```bash
# Use the provided sample data (15 songs)
cd server
npm install
ts-node scripts/generateBillboardGames.ts

# It will warn you about insufficient data
# Load at least 1000 songs for meaningful testing
```

## Production Recommendations

For 10,000 high-quality games:

1. **Collect 10,000+ songs** from Billboard
2. **Enrich 70%+** with facts and metadata
3. **Verify accuracy** with spot checks
4. **Test generation** with 100 games first
5. **Run full generation** overnight
6. **Backup database** after generation

## Estimated Collection Time

- Billboard scraping: 40-80 hours (with rate limiting)
- Metadata enrichment: 50-100 hours
- Data cleaning: 10-20 hours
- **Total: ~150 hours** for comprehensive dataset

Or use pre-built datasets and reduce to ~20 hours.

## Next Steps

1. Choose your data collection method
2. Set up API keys
3. Run collection scripts
4. Verify data quality
5. Update `billboardData.ts` with collected data
6. Run `npm run generate-billboard-games`
