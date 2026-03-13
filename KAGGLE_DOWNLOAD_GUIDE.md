# Download Billboard Data Using Docker

This guide shows how to download Kaggle Billboard datasets using a Docker container - no local Python/Kaggle CLI installation needed!

## Quick Start (3 Steps)

### Step 1: Get Your Kaggle API Credentials

1. **Go to** https://www.kaggle.com/YOUR_USERNAME/account
2. **Scroll to** "API" section
3. **Click** "Create New API Token"
4. **Save** the downloaded `kaggle.json` file to this project directory:

```bash
cd /Users/smingolelli/dev/projects/music-trivia-game
# Move the downloaded file here
mv ~/Downloads/kaggle.json .
```

Your `kaggle.json` should look like:
```json
{
  "username": "your_username",
  "key": "your_api_key_here"
}
```

### Step 2: Run the Docker Downloader

**Option A: Using docker-compose (Recommended)**

```bash
cd /Users/smingolelli/dev/projects/music-trivia-game

# Build the Kaggle downloader container
docker compose -f docker-compose.kaggle.yml build

# Download Billboard dataset
docker compose -f docker-compose.kaggle.yml up
```

**Option B: Using Docker directly**

```bash
# Build the image
docker build -f Dockerfile.kaggle -t kaggle-downloader .

# Run the download
docker run --rm \
  -v $(pwd)/server/data/json:/data \
  -v $(pwd)/kaggle.json:/root/.kaggle/kaggle.json:ro \
  kaggle-downloader \
  bash /data/download_kaggle_data.sh
```

### Step 3: Verify and Generate Games

```bash
# Check that JSON files were created
ls -lh server/data/json/*.json

# Should see:
# billboard_complete.json
# billboard_1940s.json
# billboard_1950s.json
# ... etc

# Generate games!
npm run generate-billboard-games
```

## Download Different Datasets

By default, it downloads the most comprehensive dataset. To choose a different one:

**Edit `server/data/json/download_kaggle_data.sh`** and change this line:
```bash
DATASET="${1:-dhruvildave/billboard-the-hot-100-songs}"
```

**Popular options:**
- `dhruvildave/billboard-the-hot-100-songs` - ~50,000 songs (default)
- `danield2255/data-on-songs-from-billboard-19992019` - ~20,000 songs (1999-2019)
- `thedevastator/billboard-hot-100-audio-features` - ~10,000 songs with audio data

Or pass as argument:
```bash
docker run --rm \
  -v $(pwd)/server/data/json:/data \
  -v $(pwd)/kaggle.json:/root/.kaggle/kaggle.json:ro \
  kaggle-downloader \
  bash -c "kaggle datasets download -d danield2255/data-on-songs-from-billboard-19992019 && ..."
```

## What the Container Does

1. ✅ Downloads Kaggle dataset (CSV format)
2. ✅ Extracts the ZIP file
3. ✅ Converts CSV to JSON (BillboardSong format)
4. ✅ Splits by decade for easier management
5. ✅ Removes duplicates
6. ✅ Validates data quality
7. ✅ Saves everything to `server/data/json/`

## Troubleshooting

**"kaggle.json not found"**
- Make sure `kaggle.json` is in the project root
- Check file permissions: `ls -la kaggle.json`

**"401 Unauthorized"**
- Your Kaggle credentials are invalid
- Re-download `kaggle.json` from Kaggle account settings

**"No CSV file found"**
- The dataset format may have changed
- Try a different dataset from the list above

**"Permission denied"**
- Make sure download script is executable:
  ```bash
  chmod +x scripts/download_kaggle_data.sh
  ```

## Manual Download (If Docker Issues)

If you prefer not to use Docker:

```bash
# Install Kaggle CLI locally
pip install kaggle

# Set up credentials
mkdir -p ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Download dataset
cd server/data/json
kaggle datasets download -d dhruvildave/billboard-the-hot-100-songs
unzip billboard-the-hot-100-songs.zip

# Convert to JSON
python3 ../../scripts/convert_kaggle_to_json.py charts.csv
```

## Data Output Format

The converter creates files matching your `BillboardSong` schema:

```json
{
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "peakPosition": 1,
  "weeksOnChart": 90,
  "chartDate": "2020-01-11",
  "year": 2020
}
```

## Next Steps After Download

1. **Review the data:**
   ```bash
   head -50 server/data/json/billboard_complete.json
   ```

2. **Check statistics:**
   ```bash
   # Count total songs
   grep -c '"title"' server/data/json/billboard_complete.json
   ```

3. **Generate games:**
   ```bash
   npm run generate-billboard-games
   ```

4. **Start playing:**
   ```bash
   docker compose up -d
   # Visit http://localhost:3000
   ```

## Security Note

**IMPORTANT:** The `kaggle.json` file contains your API credentials.

Add to `.gitignore`:
```bash
echo "kaggle.json" >> .gitignore
```

Never commit this file to version control!

## Estimated Times

| Step | Time |
|------|------|
| Get Kaggle credentials | 2 min |
| Build Docker image | 30 sec |
| Download dataset (50k songs) | 1-2 min |
| Convert CSV to JSON | 10-30 sec |
| Generate 10,000 games | 10-30 min |

**Total: ~15 minutes** to go from zero to 10,000 games!
