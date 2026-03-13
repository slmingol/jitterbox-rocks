#!/usr/bin/env python3
"""
Convert Kaggle Billboard CSV to BillboardSong JSON format
"""

import pandas as pd
import json
import sys
from datetime import datetime

def convert_billboard_csv(csv_file, output_file='billboard_complete.json'):
    """
    Convert Billboard CSV to JSON format matching BillboardSong schema
    
    Handles common Billboard CSV formats:
    - dhruvildave/billboard-the-hot-100-songs
    - Other Billboard Hot 100 datasets
    """
    
    print(f"Reading CSV: {csv_file}")
    df = pd.read_csv(csv_file)
    
    print(f"Found {len(df)} rows")
    print(f"Columns: {list(df.columns)}")
    
    # Map common column name variations
    column_mapping = {
        'song': ['song', 'title', 'track', 'track_name'],
        'artist': ['artist', 'performer', 'artist(s)'],
        'rank': ['rank', 'peak-rank', 'peak_position', 'chart_position'],
        'date': ['date', 'week-id', 'chart_date', 'week_date'],
        'weeks': ['weeks-on-board', 'weeks_on_chart', 'wks_on_chart'],
    }
    
    def find_column(df, possible_names):
        """Find first matching column name"""
        df_cols_lower = {col.lower(): col for col in df.columns}
        for name in possible_names:
            if name.lower() in df_cols_lower:
                return df_cols_lower[name.lower()]
        return None
    
    # Find actual column names
    song_col = find_column(df, column_mapping['song'])
    artist_col = find_column(df, column_mapping['artist'])
    rank_col = find_column(df, column_mapping['rank'])
    date_col = find_column(df, column_mapping['date'])
    weeks_col = find_column(df, column_mapping['weeks'])
    
    if not song_col or not artist_col:
        print("ERROR: Could not find required columns (song/artist)")
        print(f"Available columns: {list(df.columns)}")
        sys.exit(1)
    
    print(f"\nColumn mapping:")
    print(f"  Song: {song_col}")
    print(f"  Artist: {artist_col}")
    print(f"  Rank: {rank_col}")
    print(f"  Date: {date_col}")
    print(f"  Weeks: {weeks_col}")
    
    songs = []
    seen = set()  # Track unique song-artist pairs
    
    for idx, row in df.iterrows():
        try:
            title = str(row[song_col]).strip()
            artist = str(row[artist_col]).strip()
            
            # Skip if missing essential data
            if pd.isna(title) or pd.isna(artist) or title == 'nan' or artist == 'nan':
                continue
            
            # Create unique key to avoid duplicates
            key = f"{title.lower()}|{artist.lower()}"
            if key in seen:
                continue
            seen.add(key)
            
            # Extract year from date
            year = 2000  # default
            chart_date = ''
            if date_col and not pd.isna(row[date_col]):
                try:
                    date_str = str(row[date_col])
                    if '/' in date_str:
                        # Format: MM/DD/YYYY
                        parts = date_str.split('/')
                        year = int(parts[2]) if len(parts) == 3 else 2000
                        chart_date = f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                    elif '-' in date_str:
                        # Format: YYYY-MM-DD
                        year = int(date_str[:4])
                        chart_date = date_str
                    else:
                        year = int(date_str[:4]) if len(date_str) >= 4 else 2000
                except:
                    pass
            
            # Get rank
            peak_position = 1
            if rank_col and not pd.isna(row[rank_col]):
                try:
                    peak_position = int(row[rank_col])
                except:
                    peak_position = 1
            
            # Get weeks on chart
            weeks_on_chart = 1
            if weeks_col and not pd.isna(row[weeks_col]):
                try:
                    weeks_on_chart = int(row[weeks_col])
                except:
                    weeks_on_chart = 1
            
            song = {
                'title': title,
                'artist': artist,
                'peakPosition': peak_position,
                'weeksOnChart': weeks_on_chart,
                'chartDate': chart_date,
                'year': year
            }
            
            songs.append(song)
            
        except Exception as e:
            print(f"Error processing row {idx}: {e}")
            continue
    
    print(f"\nConverted {len(songs)} unique songs")
    
    # Group by decade
    decades = {}
    for song in songs:
        decade = (song['year'] // 10) * 10
        decade_key = f"{decade}s"
        if decade_key not in decades:
            decades[decade_key] = []
        decades[decade_key].append(song)
    
    print("\nSongs by decade:")
    for decade in sorted(decades.keys()):
        print(f"  {decade}: {len(decades[decade])} songs")
    
    # Save complete file
    with open(output_file, 'w') as f:
        json.dump(songs, f, indent=2)
    print(f"\nSaved: {output_file}")
    
    # Save by decade
    for decade, decade_songs in decades.items():
        decade_file = f"billboard_{decade}.json"
        with open(decade_file, 'w') as f:
            json.dump(decade_songs, f, indent=2)
        print(f"Saved: {decade_file}")
    
    print(f"\n✅ Conversion complete!")
    print(f"Total unique songs: {len(songs)}")
    print(f"Estimated games possible: {len(songs) // 10 * 10}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert.py <csv_file> [output_file]")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'billboard_complete.json'
    
    convert_billboard_csv(csv_file, output_file)
