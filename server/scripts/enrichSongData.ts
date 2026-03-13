/**
 * Song Data Enrichment
 * Adds metadata from various music APIs
 */

import axios from 'axios';
import { BillboardSong } from '../data/billboardSchema';

/**
 * Enrich with Genius API (song facts, annotations)
 */
export async function enrichWithGenius(song: BillboardSong): Promise<BillboardSong> {
  const geniusToken = process.env.GENIUS_API_TOKEN;
  
  if (!geniusToken) {
    console.warn('GENIUS_API_TOKEN not set - skipping Genius enrichment');
    return song;
  }
  
  try {
    // Search for song
    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(song.title + ' ' + song.artist)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'Authorization': `Bearer ${geniusToken}` },
      timeout: 5000
    });
    
    const hits = response.data.response.hits;
    if (hits && hits.length > 0) {
      const songId = hits[0].result.id;
      
      // Get song details
      const songUrl = `https://api.genius.com/songs/${songId}`;
      const songResponse = await axios.get(songUrl, {
        headers: { 'Authorization': `Bearer ${geniusToken}` },
        timeout: 5000
      });
      
      const songData = songResponse.data.response.song;
      
      // Extract facts from description
      if (songData.description?.plain) {
        const description = songData.description.plain;
        song.facts = song.facts || [];
        song.facts.push(description);
      }
      
      // Add album if available
      if (songData.album?.name) {
        song.album = songData.album.name;
      }
      
      // Add producers
      if (songData.producer_artists && songData.producer_artists.length > 0) {
        song.producers = songData.producer_artists.map((p: any) => p.name);
      }
      
      // Add writers
      if (songData.writer_artists && songData.writer_artists.length > 0) {
        song.writers = songData.writer_artists.map((w: any) => w.name);
      }
    }
  } catch (error) {
    console.error(`Genius API error for "${song.title}":`, (error as Error).message);
  }
  
  return song;
}

/**
 * Enrich with MusicBrainz (album, label, duration)
 */
export async function enrichWithMusicBrainz(song: BillboardSong): Promise<BillboardSong> {
  try {
    const query = `recording:"${song.title}" AND artist:"${song.artist}"`;
    const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
    
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'MusicTriviaGame/1.0 (https://github.com/yourrepo)'
      },
      timeout: 5000
    });
    
    const recordings = response.data.recordings;
    if (recordings && recordings.length > 0) {
      const recording = recordings[0];
      
      // Duration
      if (recording.length) {
        song.duration = Math.floor(recording.length / 1000);
      }
      
      // Album and label from releases
      if (recording.releases && recording.releases.length > 0) {
        const release = recording.releases[0];
        
        if (release.title) {
          song.album = release.title;
        }
        
        if (release['label-info'] && release['label-info'].length > 0) {
          const labelInfo = release['label-info'][0];
          if (labelInfo.label?.name) {
            song.recordLabel = labelInfo.label.name;
          }
        }
      }
    }
    
    // MusicBrainz requires 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`MusicBrainz error for "${song.title}":`, (error as Error).message);
  }
  
  return song;
}

/**
 * Enrich with Last.fm (genre tags, popularity)
 */
export async function enrichWithLastFm(song: BillboardSong): Promise<BillboardSong> {
  const apiKey = process.env.LASTFM_API_KEY;
  
  if (!apiKey) {
    console.warn('LASTFM_API_KEY not set - skipping Last.fm enrichment');
    return song;
  }
  
  try {
    const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(song.artist)}&track=${encodeURIComponent(song.title)}&format=json`;
    
    const response = await axios.get(url, { timeout: 5000 });
    const track = response.data.track;
    
    if (track) {
      // Genre tags
      if (track.toptags?.tag) {
        song.genre = track.toptags.tag.slice(0, 3).map((t: any) => t.name);
      }
      
      // Add wiki summary as fact
      if (track.wiki?.summary) {
        song.facts = song.facts || [];
        song.facts.push(track.wiki.summary.replace(/<[^>]*>/g, '')); // Remove HTML
      }
      
      // Album
      if (track.album?.title) {
        song.album = song.album || track.album.title;
      }
    }
  } catch (error) {
    console.error(`Last.fm error for "${song.title}":`, (error as Error).message);
  }
  
  return song;
}

/**
 * Enrich with Wikipedia (artist and song background)
 */
export async function enrichWithWikipedia(song: BillboardSong): Promise<BillboardSong> {
  try {
    const searchTerm = `${song.title} ${song.artist}`;
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    
    const response = await axios.get(url, { timeout: 5000 });
    const results = response.data.query.search;
    
    if (results && results.length > 0) {
      const pageId = results[0].pageid;
      
      // Get page extract
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=1&explaintext=1&format=json&origin=*`;
      const extractResponse = await axios.get(extractUrl, { timeout: 5000 });
      
      const pages = extractResponse.data.query.pages;
      const extract = pages[pageId]?.extract;
      
      if (extract) {
        // Extract interesting facts (first sentence or two)
        const sentences = extract.split('. ').slice(0, 2);
        song.facts = song.facts || [];
        song.facts.push(...sentences.map((s: string) => s.trim()).filter(Boolean));
      }
    }
  } catch (error) {
    console.error(`Wikipedia error for "${song.title}":`, (error as Error).message);
  }
  
  return song;
}

/**
 * Comprehensive enrichment using all sources
 */
export async function enrichSongComplete(song: BillboardSong): Promise<BillboardSong> {
  console.log(`Enriching: ${song.title} by ${song.artist}`);
  
  // Run enrichments sequentially to respect rate limits
  await enrichWithGenius(song);
  await enrichWithMusicBrainz(song);
  await enrichWithLastFm(song);
  await enrichWithWikipedia(song);
  
  return song;
}

/**
 * Batch enrich songs with progress tracking
 */
export async function enrichSongBatch(
  songs: BillboardSong[],
  options: {
    batchSize?: number;
    delayMs?: number;
    sources?: ('genius' | 'musicbrainz' | 'lastfm' | 'wikipedia')[];
  } = {}
): Promise<BillboardSong[]> {
  const {
    batchSize = 10,
    delayMs = 2000,
    sources = ['genius', 'musicbrainz', 'lastfm', 'wikipedia']
  } = options;
  
  const enriched: BillboardSong[] = [];
  
  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(songs.length / batchSize)}`);
    
    for (const song of batch) {
      let enrichedSong = { ...song };
      
      if (sources.includes('genius')) {
        enrichedSong = await enrichWithGenius(enrichedSong);
      }
      if (sources.includes('musicbrainz')) {
        enrichedSong = await enrichWithMusicBrainz(enrichedSong);
      }
      if (sources.includes('lastfm')) {
        enrichedSong = await enrichWithLastFm(enrichedSong);
      }
      if (sources.includes('wikipedia')) {
        enrichedSong = await enrichWithWikipedia(enrichedSong);
      }
      
      enriched.push(enrichedSong);
      
      // Small delay between songs
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    // Longer delay between batches
    if (i + batchSize < songs.length) {
      console.log(`Waiting ${delayMs * 2}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMs * 2));
    }
  }
  
  return enriched;
}
