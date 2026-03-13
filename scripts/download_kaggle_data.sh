#!/bin/bash
set -e

echo "======================================"
echo "Kaggle Billboard Dataset Downloader"
echo "======================================"
echo ""

# Check if kaggle.json exists
if [ ! -f "kaggle.json" ]; then
    echo "ERROR: kaggle.json not found!"
    echo ""
    echo "To get your Kaggle API credentials:"
    echo "1. Go to https://www.kaggle.com/YOUR_USERNAME/account"
    echo "2. Scroll to 'API' section"
    echo "3. Click 'Create New API Token'"
    echo "4. Save the downloaded kaggle.json to this directory"
    echo ""
    exit 1
fi

echo "✓ Found kaggle.json"
echo ""

# Popular Billboard datasets
echo "Available datasets:"
echo "1. dhruvildave/billboard-the-hot-100-songs (~50,000 songs)"
echo "2. danield2255/data-on-songs-from-billboard-19992019 (~20,000 songs)"
echo "3. thedevastator/billboard-hot-100-audio-features (~10,000 songs)"
echo ""

# Default to most comprehensive dataset
DATASET="${1:-dhruvildave/billboard-the-hot-100-songs}"

echo "Downloading: $DATASET"
echo ""

# Download dataset
kaggle datasets download -d "$DATASET" -p /data

# Find and unzip
cd /data
ZIPFILE=$(ls *.zip | head -1)

if [ -z "$ZIPFILE" ]; then
    echo "ERROR: No zip file found"
    exit 1
fi

echo "Extracting: $ZIPFILE"
unzip -o "$ZIPFILE"
rm "$ZIPFILE"

# Find CSV file
CSVFILE=$(ls *.csv | head -1)

if [ -z "$CSVFILE" ]; then
    echo "ERROR: No CSV file found"
    exit 1
fi

echo ""
echo "Found CSV: $CSVFILE"
echo ""

# Convert to JSON
echo "Converting to JSON format..."
python3 /scripts/convert.py "$CSVFILE"

echo ""
echo "======================================"
echo "✅ Download and conversion complete!"
echo "======================================"
echo ""
echo "Files created in /data:"
ls -lh *.json
echo ""
echo "Next steps:"
echo "1. Copy JSON files to server/data/json/"
echo "2. Run: npm run generate-billboard-games"
