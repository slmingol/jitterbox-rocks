/**
 * Billboard Hot 100 Data Source
 * 
 * TO USE THIS FILE:
 * 1. Obtain Billboard Hot 100 data from sources like:
 *    - Billboard API (https://www.billboard.com)
 *    - Spotify Charts API
 *    - MusicBrainz database
 *    - Discogs API
 *    - Last.fm API
 *    
 * 2. Enrich the data with additional information from:
 *    - Wikipedia API
 *    - Genius API (lyrics and song facts)
 *    - AllMusic database
 *    - Rock Hall of Fame archives
 *    
 * 3. Format the data according to the BillboardSong interface
 * 
 * RECOMMENDED APPROACH:
 * - Create a separate data fetching script
 * - Cache the data in JSON files by decade
 * - Run the batch generator against the cached data
 */

import { BillboardSong } from './billboardSchema';

/**
 * Sample data structure - replace with actual Billboard data
 * 
 * For 10,000 games you'll need approximately 5,000-10,000 unique songs
 * to ensure variety and avoid excessive repetition
 */

export const billboardData: BillboardSong[] = [
  // 1940s
  {
    title: "White Christmas",
    artist: "Bing Crosby",
    peakPosition: 1,
    weeksOnChart: 86,
    chartDate: "1942-12-05",
    year: 1942,
    album: "Merry Christmas",
    recordLabel: "Decca Records",
    genre: ["Traditional Pop", "Christmas"],
    grammy: true,
    platinumStatus: "Diamond",
    facts: [
      "Best-selling single of all time with over 50 million copies sold",
      "Originally written for the 1942 film Holiday Inn"
    ]
  },
  
  // 1950s
  {
    title: "Rock Around the Clock",
    artist: "Bill Haley & His Comets",
    peakPosition: 1,
    weeksOnChart: 24,
    chartDate: "1955-07-09",
    year: 1955,
    album: "Rock Around the Clock",
    recordLabel: "Decca Records",
    genre: ["Rock and Roll"],
    facts: [
      "Considered one of the first rock and roll records",
      "Featured in the opening credits of Blackboard Jungle"
    ],
    consecutiveWeeksAtOne: 8
  },

  {
    title: "Hound Dog",
    artist: "Elvis Presley",
    peakPosition: 1,
    weeksOnChart: 28,
    chartDate: "1956-08-18",
    year: 1956,
    album: "Elvis Presley",
    recordLabel: "RCA Victor",
    writers: ["Jerry Leiber", "Mike Stoller"],
    genre: ["Rock and Roll"],
    platinumStatus: "Multi-Platinum",
    consecutiveWeeksAtOne: 11,
    facts: [
      "Elvis's version sold over 10 million copies",
      "Originally recorded by Big Mama Thornton in 1952"
    ]
  },

  // 1960s
  {
    title: "I Want to Hold Your Hand",
    artist: "The Beatles",
    peakPosition: 1,
    weeksOnChart: 15,
    chartDate: "1964-02-01",
    year: 1964,
    album: "Meet the Beatles!",
    recordLabel: "Capitol Records",
    writers: ["John Lennon", "Paul McCartney"],
    genre: ["Rock", "Pop"],
    platinumStatus: "Multi-Platinum",
    consecutiveWeeksAtOne: 7,
    facts: [
      "The song that sparked Beatlemania in America",
      "First Beatles song to top the Billboard Hot 100"
    ]
  },

  {
    title: "Respect",
    artist: "Aretha Franklin",
    peakPosition: 1,
    weeksOnChart: 14,
    chartDate: "1967-06-03",
    year: 1967,
    album: "I Never Loved a Man the Way I Love You",
    recordLabel: "Atlantic Records",
    writers: ["Otis Redding"],
    genre: ["Soul", "R&B"],
    grammy: true,
    platinumStatus: "Gold",
    facts: [
      "Won Grammy Awards for Best R&B Recording and Best R&B Solo Vocal Performance",
      "Originally written and recorded by Otis Redding in 1965"
    ]
  },

  // 1970s
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    peakPosition: 4,
    weeksOnChart: 10,
    chartDate: "1971-11-13",
    year: 1971,
    album: "Led Zeppelin IV",
    recordLabel: "Atlantic Records",
    writers: ["Jimmy Page", "Robert Plant"],
    genre: ["Rock", "Hard Rock"],
    duration: 482,
    facts: [
      "Over 8 minutes long, one of the most requested songs in radio history",
      "No single was ever officially released in the UK or US"
    ]
  },

  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    peakPosition: 9,
    weeksOnChart: 17,
    chartDate: "1976-01-17",
    year: 1975,
    album: "A Night at the Opera",
    recordLabel: "EMI",
    writers: ["Freddie Mercury"],
    genre: ["Rock", "Progressive Rock"],
    duration: 354,
    grammy: true,
    platinumStatus: "Platinum",
    facts: [
      "Nearly 6 minutes long with no chorus",
      "Topped UK charts for 9 weeks and again in 1991 after Freddie Mercury's death"
    ]
  },

  // 1980s
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    peakPosition: 1,
    weeksOnChart: 24,
    chartDate: "1983-03-05",
    year: 1983,
    album: "Thriller",
    recordLabel: "Epic Records",
    writers: ["Michael Jackson"],
    producers: ["Quincy Jones"],
    genre: ["Pop", "R&B"],
    grammy: true,
    platinumStatus: "Multi-Platinum",
    consecutiveWeeksAtOne: 7,
    facts: [
      "First video by a Black artist to air on MTV in heavy rotation",
      "The moonwalk was performed for the first time on TV during this song"
    ]
  },

  {
    title: "Like a Virgin",
    artist: "Madonna",
    peakPosition: 1,
    weeksOnChart: 22,
    chartDate: "1984-12-22",
    year: 1984,
    album: "Like a Virgin",
    recordLabel: "Sire Records",
    writers: ["Billy Steinberg", "Tom Kelly"],
    producers: ["Nile Rodgers"],
    genre: ["Pop", "Dance"],
    platinumStatus: "Multi-Platinum",
    consecutiveWeeksAtOne: 6,
    facts: [
      "Controversial performance at the 1984 MTV Video Music Awards",
      "Became Madonna's first number-one hit"
    ]
  },

  // 1990s
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    peakPosition: 6,
    weeksOnChart: 20,
    chartDate: "1992-01-11",
    year: 1991,
    album: "Nevermind",
    recordLabel: "DGC Records",
    writers: ["Kurt Cobain", "Krist Novoselic", "Dave Grohl"],
    genre: ["Grunge", "Alternative Rock"],
    platinumStatus: "Multi-Platinum",
    facts: [
      "Anthem of Generation X and the grunge movement",
      "Named after a deodorant brand 'Teen Spirit'"
    ]
  },

  {
    title: "...Baby One More Time",
    artist: "Britney Spears",
    peakPosition: 1,
    weeksOnChart: 32,
    chartDate: "1999-01-30",
    year: 1999,
    album: "...Baby One More Time",
    recordLabel: "Jive Records",
    writers: ["Max Martin"],
    genre: ["Pop"],
    platinumStatus: "Multi-Platinum",
    facts: [
      "Britney's debut single, became an instant cultural phenomenon",
      "Iconic music video was shot in one day at a high school"
    ]
  },

  // 2000s
  {
    title: "Crazy in Love",
    artist: "Beyoncé featuring Jay-Z",
    peakPosition: 1,
    weeksOnChart: 33,
    chartDate: "2003-07-12",
    year: 2003,
    album: "Dangerously in Love",
    recordLabel: "Columbia Records",
    writers: ["Beyoncé", "Jay-Z", "Rich Harrison"],
    genre: ["R&B", "Pop"],
    grammy: true,
    platinumStatus: "Multi-Platinum",
    consecutiveWeeksAtOne: 8,
    facts: [
      "Won Grammy for Best R&B Song",
      "Beyoncé's first solo number-one hit"
    ]
  },

  // 2010s
  {
    title: "Rolling in the Deep",
    artist: "Adele",
    peakPosition: 1,
    weeksOnChart: 65,
    chartDate: "2011-05-21",
    year: 2011,
    album: "21",
    recordLabel: "XL Recordings",
    writers: ["Adele", "Paul Epworth"],
    genre: ["Soul", "Pop"],
    grammy: true,
    platinumStatus: "Diamond",
    consecutiveWeeksAtOne: 7,
    facts: [
      "Won Grammy for Record of the Year and Song of the Year",
      "Spent 65 weeks on the Billboard Hot 100"
    ]
  },

  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    peakPosition: 1,
    weeksOnChart: 59,
    chartDate: "2017-01-28",
    year: 2017,
    album: "÷ (Divide)",
    recordLabel: "Atlantic Records",
    writers: ["Ed Sheeran", "Steve Mac", "Johnny McDaid"],
    genre: ["Pop", "Dancehall"],
    grammy: true,
    platinumStatus: "Diamond",
    consecutiveWeeksAtOne: 12,
    facts: [
      "Most-streamed song on Spotify",
      "First song to reach 3 billion streams on Spotify"
    ]
  },

  // 2020s
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    peakPosition: 1,
    weeksOnChart: 90,
    chartDate: "2020-04-04",
    year: 2020,
    album: "After Hours",
    recordLabel: "Republic Records",
    writers: ["The Weeknd", "Max Martin", "Oscar Holter"],
    genre: ["Synth-pop", "R&B"],
    platinumStatus: "Diamond",
    consecutiveWeeksAtOne: 4,
    facts: [
      "Longest-charting song in Billboard Hot 100 history (90 weeks)",
      "Named Billboard's #1 song of all time on the Hot 100 chart"
    ]
  }
];

/**
 * HOW TO POPULATE THIS FILE WITH 10,000 SONGS:
 * 
 * OPTION 1 - Automated Collection (Recommended):
 *   1. Download Billboard datasets from Kaggle or GitHub
 *   2. Place JSON files in server/data/json/ directory
 *   3. Set up API keys in .env (Genius, Last.fm - optional but recommended)
 *   4. Run: npm run collect-data
 *   5. This file will be automatically updated with enriched data
 * 
 * OPTION 2 - Manual Data Entry:
 *   1. Find Billboard Hot 100 historical data
 *   2. Format according to BillboardSong interface
 *   3. Add to the billboardData array below
 *   4. Aim for 5,000-10,000 songs minimum
 * 
 * OPTION 3 - Use Sample Data for Testing:
 *   - The sample data below (15 songs) is enough to test the system
 *   - Generate ~15 test games to verify everything works
 *   - Then scale up to full dataset
 * 
 * After populating this file, run:
 *   npm run generate-billboard-games
 * 
 * This will generate 10,000 trivia games and save them to the database.
 * 
 * See BILLBOARD_GENERATOR_README.md for complete instructions.
 */
