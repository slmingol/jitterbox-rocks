# Billboard Data JSON Files

Place your Billboard Hot 100 datasets here as JSON files.

## File Naming Convention

Organize by decade for easier management:
- `billboard_1940s.json`
- `billboard_1950s.json`
- `billboard_1960s.json`
- `billboard_1970s.json`
- `billboard_1980s.json`
- `billboard_1990s.json`
- `billboard_2000s.json`
- `billboard_2010s.json`
- `billboard_2020s.json`

Or use a single file:
- `billboard_complete.json`

## Format

Each JSON file should be an array of song objects matching the `BillboardSong` schema.

See `example_format.json` for the expected structure.

### Required Fields
- `title` - Song title
- `artist` - Artist/band name
- `peakPosition` - Highest chart position (1-100)
- `weeksOnChart` - Number of weeks on Billboard Hot 100
- `chartDate` - Date song appeared on chart (YYYY-MM-DD)
- `year` - Year of release/charting

### Optional Fields (Recommended)
- `album` - Album name
- `recordLabel` - Record label
- `producers` - Array of producer names
- `writers` - Array of songwriter names
- `genre` - Array of genres
- `facts` - Array of interesting trivia facts
- `grammy` - Boolean if won Grammy
- `platinumStatus` - "Gold" | "Platinum" | "Multi-Platinum" | "Diamond"
- `duration` - Song length in seconds
- `consecutiveWeeksAtOne` - Number of weeks at #1
- `yearEndPosition` - Year-end chart position

## Where to Get Data

### Pre-built Datasets (Recommended)

1. **Kaggle**
   - Search: "billboard hot 100"
   - Many pre-scraped datasets available
   - Often includes metadata

2. **GitHub**
   - Search: "billboard hot 100 dataset"
   - Community-maintained datasets
   - Usually CSV format (convert to JSON)

3. **Academic Datasets**
   - Million Song Dataset
   - Music research databases

### APIs (For Enrichment)

After loading base chart data, enrich with:
- Genius API - Song facts and lyrics
- MusicBrainz - Album, label, duration
- Last.fm - Genres and tags
- Wikipedia - Background info

## Example CSV to JSON Conversion

If you have CSV data:

```bash
npm install -g csvtojson
csvtojson billboard_data.csv > billboard_data.json
```

Or use Python:
```python
import pandas as pd
import json

df = pd.read_csv('billboard_data.csv')
data = df.to_dict('records')

with open('billboard_data.json', 'w') as f:
    json.dump(data, f, indent=2)
```

## Data Quality Checklist

Before using your data:
- [ ] At least 5,000 songs for 10,000 games
- [ ] All songs have title and artist
- [ ] Year data is accurate
- [ ] Peak positions are 1-100
- [ ] No duplicate entries
- [ ] At least 30% have facts/trivia
- [ ] Songs span 1940-2025

## Next Steps

1. Download Billboard datasets
2. Place JSON files in this directory
3. Run: `npm run collect-data` (to enrich)
4. Run: `npm run generate-billboard-games`
5. Play!
