import { IQuestion } from '../models/Game';
import { addDays, startOfDay } from 'date-fns';

// Helper function to create questions
const createQuestion = (
  type: 'multiple-choice' | 'audio' | 'text-input',
  question: string,
  correctAnswer: string,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  options?: string[],
  audioUrl?: string,
  hint?: string
): IQuestion => ({
  type,
  question,
  correctAnswer,
  category,
  difficulty,
  options,
  audioUrl,
  hint,
  points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
});

// Generate 25 unique games
export const seedGamesData = () => {
  const startDate = startOfDay(new Date());
  const games = [];

  // Game 1: Classic Rock Legends
  games.push({
    title: "Classic Rock Legends",
    description: "Test your knowledge of rock music's greatest artists and songs",
    date: addDays(startDate, 0),
    isDaily: true,
    questions: [
      createQuestion('multiple-choice', 'Which band released the album "Dark Side of the Moon"?', 'Pink Floyd', 'Rock', 'easy', 
        ['Pink Floyd', 'Led Zeppelin', 'The Beatles', 'The Rolling Stones']),
      createQuestion('text-input', 'Who was the lead singer of Queen?', 'Freddie Mercury', 'Rock', 'easy', undefined, undefined, 
        'Known for his powerful voice and flamboyant stage presence'),
      createQuestion('multiple-choice', 'What year was "Stairway to Heaven" released?', '1971', 'Rock', 'medium', 
        ['1969', '1971', '1973', '1975']),
      createQuestion('text-input', 'Which guitarist is known as "Slowhand"?', 'Eric Clapton', 'Rock', 'medium'),
      createQuestion('multiple-choice', 'Which band had hits with "Sweet Child O\' Mine" and "November Rain"?', 'Guns N\' Roses', 'Rock', 'easy', 
        ['Guns N\' Roses', 'Bon Jovi', 'Def Leppard', 'Motley Crue']),
      createQuestion('text-input', 'What is Bono\'s band called?', 'U2', 'Rock', 'easy'),
      createQuestion('multiple-choice', 'Who sang "Born to Run"?', 'Bruce Springsteen', 'Rock', 'medium', 
        ['Bob Dylan', 'Bruce Springsteen', 'Tom Petty', 'Neil Young']),
      createQuestion('text-input', 'Which city is AC/DC\'s "Thunderstruck" often associated with?', 'Sydney', 'Rock', 'hard'),
      createQuestion('multiple-choice', 'What was The Beatles\' last studio album?', 'Abbey Road', 'Rock', 'medium', 
        ['Let It Be', 'Abbey Road', 'The White Album', 'Sgt. Pepper\'s']),
      createQuestion('text-input', 'Who played drums for Led Zeppelin?', 'John Bonham', 'Rock', 'medium')
    ]
  });

  // Game 2: 80s Pop Hits
  games.push({
    title: "80s Pop Extravaganza",
    description: "Take a trip back to the decade of synthesizers and big hair",
    date: addDays(startDate, 1),
    isDaily: true,
    questions: [
      createQuestion('multiple-choice', 'Who sang "Like a Virgin"?', 'Madonna', '80s Pop', 'easy', 
        ['Madonna', 'Cyndi Lauper', 'Whitney Houston', 'Janet Jackson']),
      createQuestion('text-input', 'Which artist had a hit with "Purple Rain"?', 'Prince', '80s Pop', 'easy'),
      createQuestion('multiple-choice', 'What was Michael Jackson\'s best-selling album?', 'Thriller', '80s Pop', 'easy', 
        ['Bad', 'Thriller', 'Dangerous', 'Off the Wall']),
      createQuestion('text-input', 'Who sang "Girls Just Want to Have Fun"?', 'Cyndi Lauper', '80s Pop', 'easy'),
      createQuestion('multiple-choice', 'Which duo sang "Wake Me Up Before You Go-Go"?', 'Wham!', '80s Pop', 'medium', 
        ['Wham!', 'Duran Duran', 'Culture Club', 'Pet Shop Boys']),
      createQuestion('text-input', 'Which band released "Don\'t Stop Believin\'"?', 'Journey', '80s Pop', 'medium'),
      createQuestion('multiple-choice', 'Who had a hit with "Every Breath You Take"?', 'The Police', '80s Pop', 'medium', 
        ['The Police', 'U2', 'INXS', 'Simple Minds']),
      createQuestion('text-input', 'Which artist sang "Careless Whisper"?', 'George Michael', '80s Pop', 'medium'),
      createQuestion('multiple-choice', 'What was A-ha\'s biggest hit?', 'Take On Me', '80s Pop', 'easy', 
        ['Take On Me', 'The Sun Always Shines on TV', 'Hunting High and Low', 'Cry Wolf']),
      createQuestion('text-input', 'Who sang "Sweet Dreams (Are Made of This)"?', 'Eurythmics', '80s Pop', 'hard')
    ]
  });

  // Game 3: Hip Hop History
  games.push({
    title: "Hip Hop History",
    description: "From old school to new school - test your rap knowledge",
    date: addDays(startDate, 2),
    isDaily: true,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "Godfather of Gangsta Rap"?', 'Ice-T', 'Hip Hop', 'medium', 
        ['Ice Cube', 'Ice-T', 'Dr. Dre', 'Eazy-E']),
      createQuestion('text-input', 'Which group released "Straight Outta Compton"?', 'N.W.A', 'Hip Hop', 'easy'),
      createQuestion('multiple-choice', 'What was Eminem\'s breakthrough album?', 'The Slim Shady LP', 'Hip Hop', 'medium', 
        ['Infinite', 'The Slim Shady LP', 'The Marshall Mathers LP', 'The Eminem Show']),
      createQuestion('text-input', 'Who is Jay-Z married to?', 'Beyonce', 'Hip Hop', 'easy'),
      createQuestion('multiple-choice', 'Which rapper\'s real name is Marshall Mathers?', 'Eminem', 'Hip Hop', 'easy', 
        ['Eminem', '50 Cent', 'Dr. Dre', 'Snoop Dogg']),
      createQuestion('text-input', 'Which city is Kendrick Lamar from?', 'Compton', 'Hip Hop', 'medium'),
      createQuestion('multiple-choice', 'Who released the album "The Chronic"?', 'Dr. Dre', 'Hip Hop', 'medium', 
        ['Dr. Dre', 'Snoop Dogg', 'Tupac', 'Ice Cube']),
      createQuestion('text-input', 'What does Wu-Tang Clan say "ain\'t nuthing to f\' wit"?', 'Wu-Tang Clan', 'Hip Hop', 'medium'),
      createQuestion('multiple-choice', 'Which female rapper had a hit with "Super Bass"?', 'Nicki Minaj', 'Hip Hop', 'easy', 
        ['Nicki Minaj', 'Cardi B', 'Megan Thee Stallion', 'Iggy Azalea']),
      createQuestion('text-input', 'Who released "Lose Yourself"?', 'Eminem', 'Hip Hop', 'easy')
    ]
  });

  // Game 4: Country Music Classics
  games.push({
    title: "Country Classics",
    description: "Honky-tonk your way through country music history",
    date: addDays(startDate, 3),
    isDaily: true,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "Man in Black"?', 'Johnny Cash', 'Country', 'easy', 
        ['Johnny Cash', 'Willie Nelson', 'Waylon Jennings', 'Merle Haggard']),
      createQuestion('text-input', 'Which female country star is known as "The Queen of Country"?', 'Dolly Parton', 'Country', 'easy'),
      createQuestion('multiple-choice', 'What prison did Johnny Cash famously perform at?', 'Folsom Prison', 'Country', 'medium', 
        ['Folsom Prison', 'San Quentin', 'Alcatraz', 'Leavenworth']),
      createQuestion('text-input', 'Who sang "Jolene"?', 'Dolly Parton', 'Country', 'easy'),
      createQuestion('multiple-choice', 'Which country artist is known for "Friends in Low Places"?', 'Garth Brooks', 'Country', 'easy', 
        ['Garth Brooks', 'George Strait', 'Alan Jackson', 'Brooks & Dunn']),
      createQuestion('text-input', 'Who is married to Faith Hill?', 'Tim McGraw', 'Country', 'medium'),
      createQuestion('multiple-choice', 'Which artist had a crossover hit with "I Will Always Love You"?', 'Whitney Houston', 'Country', 'medium', 
        ['Whitney Houston', 'Dolly Parton', 'Celine Dion', 'Mariah Carey'], 'Written by Dolly Parton'),
      createQuestion('text-input', 'Which country legend recorded "Blue Eyes Crying in the Rain"?', 'Willie Nelson', 'Country', 'medium'),
      createQuestion('multiple-choice', 'What is Shania Twain\'s home country?', 'Canada', 'Country', 'medium', 
        ['USA', 'Canada', 'Australia', 'Ireland']),
      createQuestion('text-input', 'Who sang "Before He Cheats"?', 'Carrie Underwood', 'Country', 'easy')
    ]
  });

  // Game 5: Jazz & Blues
  games.push({
    title: "Jazz & Blues Masters",
    description: "Explore the soulful sounds of jazz and blues",
    date: addDays(startDate, 4),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "First Lady of Song"?', 'Ella Fitzgerald', 'Jazz', 'medium', 
        ['Ella Fitzgerald', 'Billie Holiday', 'Sarah Vaughan', 'Nina Simone']),
      createQuestion('text-input', 'Which legendary trumpeter was known as "Satchmo"?', 'Louis Armstrong', 'Jazz', 'easy'),
      createQuestion('multiple-choice', 'What instrument did Charlie Parker play?', 'Saxophone', 'Jazz', 'medium', 
        ['Trumpet', 'Saxophone', 'Piano', 'Clarinet']),
      createQuestion('text-input', 'Who composed "Take Five"?', 'Paul Desmond', 'Jazz', 'hard', undefined, undefined, 
        'Written by the Dave Brubeck Quartet\'s saxophonist'),
      createQuestion('multiple-choice', 'Which city is considered the birthplace of jazz?', 'New Orleans', 'Jazz', 'easy', 
        ['Chicago', 'New York', 'New Orleans', 'Memphis']),
      createQuestion('text-input', 'Who was known as the "King of Swing"?', 'Benny Goodman', 'Jazz', 'medium'),
      createQuestion('multiple-choice', 'Which blues legend was known as "B.B."?', 'B.B. King', 'Blues', 'easy', 
        ['B.B. King', 'Muddy Waters', 'John Lee Hooker', 'Howlin\' Wolf']),
      createQuestion('text-input', 'Which female blues singer was known as "Lady Day"?', 'Billie Holiday', 'Jazz', 'medium'),
      createQuestion('multiple-choice', 'What was Miles Davis\'s groundbreaking 1959 album?', 'Kind of Blue', 'Jazz', 'medium', 
        ['Kind of Blue', 'Birth of the Cool', 'Sketches of Spain', 'Bitches Brew']),
      createQuestion('text-input', 'Who recorded "The Thrill Is Gone"?', 'B.B. King', 'Blues', 'easy')
    ]
  });

  // Game 6: Modern Pop Icons
  games.push({
    title: "Modern Pop Icons",
    description: "Test your knowledge of 2000s-2020s pop music",
    date: addDays(startDate, 5),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which artist had hits with "Bad Romance" and "Poker Face"?', 'Lady Gaga', 'Pop', 'easy', 
        ['Lady Gaga', 'Katy Perry', 'Rihanna', 'Beyonce']),
      createQuestion('text-input', 'Who sang "Shape of You"?', 'Ed Sheeran', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which artist released the album "1989"?', 'Taylor Swift', 'Pop', 'easy', 
        ['Taylor Swift', 'Ariana Grande', 'Selena Gomez', 'Demi Lovato']),
      createQuestion('text-input', 'Who is known as "Queen Bey"?', 'Beyonce', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'What is Bruno Mars\' real name?', 'Peter Hernandez', 'Pop', 'hard', 
        ['Bruno Mars', 'Peter Hernandez', 'Mark Robinson', 'Michael Davis']),
      createQuestion('text-input', 'Which artist sang "Rolling in the Deep"?', 'Adele', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which K-pop group had a hit with "Dynamite"?', 'BTS', 'Pop', 'easy', 
        ['BTS', 'BLACKPINK', 'EXO', 'TWICE']),
      createQuestion('text-input', 'Who released the album "Thank U, Next"?', 'Ariana Grande', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which artist is known for the hit "Blinding Lights"?', 'The Weeknd', 'Pop', 'easy', 
        ['The Weeknd', 'Drake', 'Post Malone', 'Travis Scott']),
      createQuestion('text-input', 'Who sang "Shallow" with Bradley Cooper?', 'Lady Gaga', 'Pop', 'easy')
    ]
  });

  // Game 7: British Invasion
  games.push({
    title: "British Invasion",
    description: "Celebrate the UK artists who conquered America",
    date: addDays(startDate, 6),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which Beatles member was known as the "quiet one"?', 'George Harrison', 'Rock', 'medium', 
        ['Paul McCartney', 'John Lennon', 'George Harrison', 'Ringo Starr']),
      createQuestion('text-input', 'Who was the lead singer of The Rolling Stones?', 'Mick Jagger', 'Rock', 'easy'),
      createQuestion('multiple-choice', 'Which band sang "My Generation"?', 'The Who', 'Rock', 'medium', 
        ['The Kinks', 'The Who', 'The Animals', 'The Zombies']),
      createQuestion('text-input', 'Which British band was fronted by Freddie Mercury?', 'Queen', 'Rock', 'easy'),
      createQuestion('multiple-choice', 'What was The Beatles\' first hit in America?', 'I Want to Hold Your Hand', 'Rock', 'medium', 
        ['Love Me Do', 'I Want to Hold Your Hand', 'She Loves You', 'Please Please Me']),
      createQuestion('text-input', 'Who was the guitarist for The Yardbirds before joining Led Zeppelin?', 'Jimmy Page', 'Rock', 'hard'),
      createQuestion('multiple-choice', 'Which band had hits with "Satisfaction" and "Paint It Black"?', 'The Rolling Stones', 'Rock', 'easy', 
        ['The Rolling Stones', 'The Beatles', 'The Who', 'The Kinks']),
      createQuestion('text-input', 'Which city were The Beatles from?', 'Liverpool', 'Rock', 'easy'),
      createQuestion('multiple-choice', 'Who sang "Space Oddity"?', 'David Bowie', 'Rock', 'medium', 
        ['David Bowie', 'Elton John', 'Rod Stewart', 'Eric Clapton']),
      createQuestion('text-input', 'Which band released "Bohemian Rhapsody"?', 'Queen', 'Rock', 'easy')
    ]
  });

  // Game 8: R&B Legends
  games.push({
    title: "R&B Legends",
    description: "Soul, funk, and rhythm & blues masters",
    date: addDays(startDate, 7),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "Godfather of Soul"?', 'James Brown', 'R&B', 'easy', 
        ['James Brown', 'Marvin Gaye', 'Stevie Wonder', 'Ray Charles']),
      createQuestion('text-input', 'Which label was founded by Berry Gordy?', 'Motown', 'R&B', 'medium'),
      createQuestion('multiple-choice', 'Who sang "What\'s Going On"?', 'Marvin Gaye', 'R&B', 'medium', 
        ['Marvin Gaye', 'Curtis Mayfield', 'Al Green', 'Donny Hathaway']),
      createQuestion('text-input', 'Who is known as the "Queen of Soul"?', 'Aretha Franklin', 'R&B', 'easy'),
      createQuestion('multiple-choice', 'Which Stevie Wonder song became a birthday anthem?', 'Happy Birthday', 'R&B', 'medium', 
        ['Happy Birthday', 'Superstition', 'I Just Called to Say I Love You', 'Sir Duke']),
      createQuestion('text-input', 'Who recorded "Let\'s Get It On"?', 'Marvin Gaye', 'R&B', 'easy'),
      createQuestion('multiple-choice', 'Which group had a hit with "My Girl"?', 'The Temptations', 'R&B', 'easy', 
        ['The Temptations', 'The Four Tops', 'The Supremes', 'The Miracles']),
      createQuestion('text-input', 'Who sang "Superstition"?', 'Stevie Wonder', 'R&B', 'easy'),
      createQuestion('multiple-choice', 'What was Diana Ross\'s group before going solo?', 'The Supremes', 'R&B', 'easy', 
        ['The Supremes', 'The Ronettes', 'The Shirelles', 'Martha and the Vandellas']),
      createQuestion('text-input', 'Who recorded "I Heard It Through the Grapevine"?', 'Marvin Gaye', 'R&B', 'medium')
    ]
  });

  // Game 9: 90s Alternative Rock
  games.push({
    title: "90s Alternative Revolution",
    description: "Grunge, indie, and alternative rock from the 90s",
    date: addDays(startDate, 8),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which band released "Smells Like Teen Spirit"?', 'Nirvana', 'Alternative', 'easy', 
        ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains']),
      createQuestion('text-input', 'Who was the lead singer of Nirvana?', 'Kurt Cobain', 'Alternative', 'easy'),
      createQuestion('multiple-choice', 'Which city is considered the birthplace of grunge?', 'Seattle', 'Alternative', 'easy', 
        ['Portland', 'Seattle', 'Los Angeles', 'San Francisco']),
      createQuestion('text-input', 'Which band released "Creep"?', 'Radiohead', 'Alternative', 'easy'),
      createQuestion('multiple-choice', 'Who was the lead singer of Stone Temple Pilots?', 'Scott Weiland', 'Alternative', 'medium', 
        ['Scott Weiland', 'Eddie Vedder', 'Layne Staley', 'Chris Cornell']),
      createQuestion('text-input', 'Which band sang "Under the Bridge"?', 'Red Hot Chili Peppers', 'Alternative', 'easy'),
      createQuestion('multiple-choice', 'What was Pearl Jam\'s debut album?', 'Ten', 'Alternative', 'medium', 
        ['Ten', 'Vs.', 'Vitalogy', 'No Code']),
      createQuestion('text-input', 'Who was the frontman of Soundgarden?', 'Chris Cornell', 'Alternative', 'medium'),
      createQuestion('multiple-choice', 'Which band had a hit with "Zombie"?', 'The Cranberries', 'Alternative', 'easy', 
        ['The Cranberries', 'Garbage', 'Hole', 'No Doubt']),
      createQuestion('text-input', 'Which band released "Wonderwall"?', 'Oasis', 'Alternative', 'easy')
    ]
  });

  // Game 10: Disco Fever
  games.push({
    title: "Disco Fever",
    description: "Get down with the grooviest era of music",
    date: addDays(startDate, 9),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which group sang "Stayin\' Alive"?', 'Bee Gees', 'Disco', 'easy', 
        ['Bee Gees', 'ABBA', 'KC and the Sunshine Band', 'Earth, Wind & Fire']),
      createQuestion('text-input', 'Who sang "I Will Survive"?', 'Gloria Gaynor', 'Disco', 'easy'),
      createQuestion('multiple-choice', 'Which Donna Summer song became a disco anthem?', 'Hot Stuff', 'Disco', 'medium', 
        ['Hot Stuff', 'Last Dance', 'Bad Girls', 'All of the above'], 'She had many hits!'),
      createQuestion('text-input', 'Which band released "Le Freak"?', 'Chic', 'Disco', 'medium'),
      createQuestion('multiple-choice', 'What movie popularized disco in the mainstream?', 'Saturday Night Fever', 'Disco', 'easy', 
        ['Grease', 'Saturday Night Fever', 'The Wiz', 'Thank God It\'s Friday']),
      createQuestion('text-input', 'Who is known as the "Queen of Disco"?', 'Donna Summer', 'Disco', 'easy'),
      createQuestion('multiple-choice', 'Which venue was the most famous disco club?', 'Studio 54', 'Disco', 'medium', 
        ['The Loft', 'Paradise Garage', 'Studio 54', 'The Warehouse']),
      createQuestion('text-input', 'Which group sang "Dancing Queen"?', 'ABBA', 'Disco', 'easy'),
      createQuestion('multiple-choice', 'Who recorded "Ring My Bell"?', 'Anita Ward', 'Disco', 'hard', 
        ['Anita Ward', 'Thelma Houston', 'Sister Sledge', 'Diana Ross']),
      createQuestion('text-input', 'Which group sang "Y.M.C.A."?', 'Village People', 'Disco', 'easy')
    ]
  });

  // Continue with more games...
  // Game 11: Latin Music
  games.push({
    title: "Latin Rhythms",
    description: "Salsa, reggaeton, and Latin pop favorites",
    date: addDays(startDate, 10),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "King of Latin Pop"?', 'Ricky Martin', 'Latin', 'medium', 
        ['Ricky Martin', 'Enrique Iglesias', 'Marc Anthony', 'Luis Miguel']),
      createQuestion('text-input', 'Which Colombian artist sang "Hips Don\'t Lie"?', 'Shakira', 'Latin', 'easy'),
      createQuestion('multiple-choice', 'What does "Despacito" mean in English?', 'Slowly', 'Latin', 'medium', 
        ['Slowly', 'Quickly', 'Softly', 'Loudly']),
      createQuestion('text-input', 'Who is known as "El Rey" (The King) of ranchera music?', 'Vicente Fernandez', 'Latin', 'hard'),
      createQuestion('multiple-choice', 'Which artist had a worldwide hit with "Bailando"?', 'Enrique Iglesias', 'Latin', 'medium', 
        ['Enrique Iglesias', 'Daddy Yankee', 'J Balvin', 'Maluma']),
      createQuestion('text-input', 'Which Puerto Rican artist is known as "Daddy Yankee"?', 'Ramon Ayala', 'Latin', 'hard', 
        undefined, undefined, 'Real name Ramon Luis Ayala Rodriguez'),
      createQuestion('multiple-choice', 'Who sang "Livin\' la Vida Loca"?', 'Ricky Martin', 'Latin', 'easy', 
        ['Ricky Martin', 'Marc Anthony', 'Enrique Iglesias', 'Chayanne']),
      createQuestion('text-input', 'Which artist released "Mi Gente"?', 'J Balvin', 'Latin', 'medium'),
      createQuestion('multiple-choice', 'What genre did Bad Bunny help popularize?', 'Reggaeton', 'Latin', 'easy', 
        ['Salsa', 'Reggaeton', 'Bachata', 'Merengue']),
      createQuestion('text-input', 'Who recorded "Smooth" with Carlos Santana?', 'Rob Thomas', 'Latin', 'medium')
    ]
  });

  // Game 12: Heavy Metal
  games.push({
    title: "Heavy Metal Masters",
    description: "Headbang your way through metal history",
    date: addDays(startDate, 11),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which band is often credited as the first heavy metal band?', 'Black Sabbath', 'Metal', 'medium', 
        ['Black Sabbath', 'Led Zeppelin', 'Deep Purple', 'Judas Priest']),
      createQuestion('text-input', 'Who is the lead vocalist of Iron Maiden?', 'Bruce Dickinson', 'Metal', 'medium'),
      createQuestion('multiple-choice', 'Which Metallica album features "Enter Sandman"?', 'Metallica (Black Album)', 'Metal', 'medium', 
        ['Master of Puppets', 'Ride the Lightning', 'Metallica (Black Album)', '...And Justice for All']),
      createQuestion('text-input', 'Who was the original singer of Black Sabbath?', 'Ozzy Osbourne', 'Metal', 'easy'),
      createQuestion('multiple-choice', 'Which band released "The Number of the Beast"?', 'Iron Maiden', 'Metal', 'medium', 
        ['Iron Maiden', 'Judas Priest', 'Motorhead', 'Saxon']),
      createQuestion('text-input', 'Which guitarist is known for playing with Ozzy Osbourne and died in a plane crash?', 'Randy Rhoads', 'Metal', 'hard'),
      createQuestion('multiple-choice', 'What was Slayer\'s most famous album?', 'Reign in Blood', 'Metal', 'hard', 
        ['Reign in Blood', 'South of Heaven', 'Seasons in the Abyss', 'Hell Awaits']),
      createQuestion('text-input', 'Who is the drummer for Metallica?', 'Lars Ulrich', 'Metal', 'medium'),
      createQuestion('multiple-choice', 'Which band\'s mascot is named Eddie?', 'Iron Maiden', 'Metal', 'medium', 
        ['Iron Maiden', 'Motorhead', 'Megadeth', 'Anthrax']),
      createQuestion('text-input', 'Which metal band is Lemmy Kilmister associated with?', 'Motorhead', 'Metal', 'medium')
    ]
  });

  // Game 13: One-Hit Wonders
  games.push({
    title: "One-Hit Wonders",
    description: "Remember these artists and their unforgettable hits",
    date: addDays(startDate, 12),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who had a hit with "Mambo No. 5"?', 'Lou Bega', '90s Pop', 'easy', 
        ['Lou Bega', 'Ricky Martin', 'Mark Morrison', 'Los Del Rio']),
      createQuestion('text-input', 'Which artist sang "Ice Ice Baby"?', 'Vanilla Ice', '90s Pop', 'easy'),
      createQuestion('multiple-choice', 'Who recorded "Macarena"?', 'Los Del Rio', '90s Pop', 'easy', 
        ['Los Del Rio', 'Ricky Martin', 'Lou Bega', 'Gerardo']),
      createQuestion('text-input', 'Who had a hit with "Torn" in 1997?', 'Natalie Imbruglia', '90s Pop', 'medium'),
      createQuestion('multiple-choice', 'Which group sang "Tubthumping" (I Get Knocked Down)?', 'Chumbawamba', '90s Pop', 'medium', 
        ['Chumbawamba', 'EMF', 'The Cardigans', 'The Verve']),
      createQuestion('text-input', 'Who sang "Come On Eileen"?', 'Dexys Midnight Runners', '80s Pop', 'medium'),
      createQuestion('multiple-choice', 'Which artist had a hit with "Rico Suave"?', 'Gerardo', '90s Pop', 'hard', 
        ['Gerardo', 'Technotronic', 'Snap!', 'C+C Music Factory']),
      createQuestion('text-input', 'Who recorded "Video Killed the Radio Star"?', 'The Buggles', '80s Pop', 'medium'),
      createQuestion('multiple-choice', 'Which artist sang "Who Let the Dogs Out?"?', 'Baha Men', '2000s Pop', 'easy', 
        ['Baha Men', 'Vengaboys', 'Aqua', 'Eiffel 65']),
      createQuestion('text-input', 'Who had a hit with "Blue (Da Ba Dee)"?', 'Eiffel 65', '90s Pop', 'easy')
    ]
  });

  // Game 14: Movie Soundtracks
  games.push({
    title: "Movie Soundtrack Classics",
    description: "Songs that made movies unforgettable",
    date: addDays(startDate, 13),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which movie featured "My Heart Will Go On"?', 'Titanic', 'Soundtrack', 'easy', 
        ['Titanic', 'The Bodyguard', 'Romeo + Juliet', 'Pearl Harbor']),
      createQuestion('text-input', 'Who sang "My Heart Will Go On"?', 'Celine Dion', 'Soundtrack', 'easy'),
      createQuestion('multiple-choice', 'Which movie featured "(I\'ve Had) The Time of My Life"?', 'Dirty Dancing', 'Soundtrack', 'easy', 
        ['Dirty Dancing', 'Flashdance', 'Footloose', 'Fame']),
      createQuestion('text-input', 'Who performed "Eye of the Tiger" for Rocky III?', 'Survivor', 'Soundtrack', 'easy'),
      createQuestion('multiple-choice', 'Which Disney movie featured "A Whole New World"?', 'Aladdin', 'Soundtrack', 'easy', 
        ['Aladdin', 'The Lion King', 'Beauty and the Beast', 'The Little Mermaid']),
      createQuestion('text-input', 'Who sang "I Will Always Love You" for The Bodyguard?', 'Whitney Houston', 'Soundtrack', 'easy'),
      createQuestion('multiple-choice', 'Which movie featured "Stayin\' Alive"?', 'Saturday Night Fever', 'Soundtrack', 'easy', 
        ['Saturday Night Fever', 'Grease', 'Footloose', 'Flashdance']),
      createQuestion('text-input', 'Who sang "Let It Go" in Frozen?', 'Idina Menzel', 'Soundtrack', 'easy'),
      createQuestion('multiple-choice', 'Which Bond film featured "Skyfall" by Adele?', 'Skyfall', 'Soundtrack', 'easy', 
        ['Skyfall', 'Spectre', 'Quantum of Solace', 'Casino Royale']),
      createQuestion('text-input', 'Who performed "Purple Rain" in the movie of the same name?', 'Prince', 'Soundtrack', 'easy')
    ]
  });

  // Game 15: Electronic & Dance
  games.push({
    title: "Electronic & Dance Music",
    description: "From techno to EDM - electronic beats that move you",
    date: addDays(startDate, 14),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which duo is known for "Get Lucky"?', 'Daft Punk', 'Electronic', 'easy', 
        ['Daft Punk', 'The Chemical Brothers', 'Justice', 'Disclosure']),
      createQuestion('text-input', 'Which Swedish DJ had a hit with "Levels"?', 'Avicii', 'Electronic', 'easy'),
      createQuestion('multiple-choice', 'Who collaborated with Calvin Harris on "We Found Love"?', 'Rihanna', 'Electronic', 'easy', 
        ['Rihanna', 'Ellie Goulding', 'Florence Welch', 'Kelis']),
      createQuestion('text-input', 'Which DJ is known for the hit "Titanium"?', 'David Guetta', 'Electronic', 'easy'),
      createQuestion('multiple-choice', 'Which group had a hit with "Blue Monday"?', 'New Order', 'Electronic', 'medium', 
        ['New Order', 'Depeche Mode', 'Pet Shop Boys', 'Orchestral Manoeuvres in the Dark']),
      createQuestion('text-input', 'Who is the Dutch DJ known for "Animals"?', 'Martin Garrix', 'Electronic', 'medium'),
      createQuestion('multiple-choice', 'Which electronic duo wore helmets?', 'Daft Punk', 'Electronic', 'easy', 
        ['Daft Punk', 'The Chemical Brothers', 'Deadmau5', 'Knife Party']),
      createQuestion('text-input', 'Which producer is known as "Skrillex"?', 'Sonny Moore', 'Electronic', 'hard'),
      createQuestion('multiple-choice', 'What does EDM stand for?', 'Electronic Dance Music', 'Electronic', 'easy', 
        ['Electronic Dance Music', 'Electric Digital Music', 'Electronic Disco Music', 'Electro Dance Movement']),
      createQuestion('text-input', 'Which DJ is known for "Wake Me Up"?', 'Avicii', 'Electronic', 'easy')
    ]
  });

  // Game 16: Folk & Acoustic
  games.push({
    title: "Folk & Acoustic Favorites",
    description: "Unplugged and authentic - folk music legends",
    date: addDays(startDate, 15),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who wrote "Blowin\' in the Wind"?', 'Bob Dylan', 'Folk', 'easy', 
        ['Bob Dylan', 'Pete Seeger', 'Woody Guthrie', 'Joan Baez']),
      createQuestion('text-input', 'Which duo sang "The Sound of Silence"?', 'Simon and Garfunkel', 'Folk', 'easy'),
      createQuestion('multiple-choice', 'Who performed at Woodstock with "The Fish Cheer"?', 'Country Joe McDonald', 'Folk', 'hard', 
        ['Country Joe McDonald', 'Arlo Guthrie', 'Pete Seeger', 'Joan Baez']),
      createQuestion('text-input', 'Who sang "Big Yellow Taxi"?', 'Joni Mitchell', 'Folk', 'medium'),
      createQuestion('multiple-choice', 'Which Bob Dylan song became a hit for The Byrds?', 'Mr. Tambourine Man', 'Folk', 'medium', 
        ['Mr. Tambourine Man', 'All Along the Watchtower', 'Like a Rolling Stone', 'Knockin\' on Heaven\'s Door']),
      createQuestion('text-input', 'Who wrote "This Land Is Your Land"?', 'Woody Guthrie', 'Folk', 'medium'),
      createQuestion('multiple-choice', 'Which artist had a hit with "Fast Car"?', 'Tracy Chapman', 'Folk', 'easy', 
        ['Tracy Chapman', 'Joan Baez', 'Suzanne Vega', 'Ani DiFranco']),
      createQuestion('text-input', 'Who sang "American Pie"?', 'Don McLean', 'Folk', 'easy'),
      createQuestion('multiple-choice', 'Which festival is most associated with folk music?', 'Newport Folk Festival', 'Folk', 'medium', 
        ['Newport Folk Festival', 'Woodstock', 'Monterey Pop', 'Isle of Wight']),
      createQuestion('text-input', 'Who performed "If I Had a Hammer"?', 'Peter Paul and Mary', 'Folk', 'medium')
    ]
  });

  // Game 17: Punk Rock
  games.push({
    title: "Punk Rock Rebellion",
    description: "Fast, loud, and rebellious - punk rock classics",
    date: addDays(startDate, 16),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which band is considered the first punk band?', 'The Ramones', 'Punk', 'medium', 
        ['The Ramones', 'Sex Pistols', 'The Clash', 'The Damned']),
      createQuestion('text-input', 'Who was the lead singer of the Sex Pistols?', 'Johnny Rotten', 'Punk', 'medium'),
      createQuestion('multiple-choice', 'Which punk band sang "London Calling"?', 'The Clash', 'Punk', 'easy', 
        ['The Clash', 'Sex Pistols', 'The Damned', 'The Buzzcocks']),
      createQuestion('text-input', 'Which Green Day album featured "Basket Case"?', 'Dookie', 'Punk', 'medium'),
      createQuestion('multiple-choice', 'Who sings "Anarchy in the U.K."?', 'Sex Pistols', 'Punk', 'easy', 
        ['Sex Pistols', 'The Clash', 'The Ramones', 'Dead Kennedys']),
      createQuestion('text-input', 'What city is most associated with American punk rock?', 'New York', 'Punk', 'medium', 
        undefined, undefined, 'CBGB was located here'),
      createQuestion('multiple-choice', 'Which band had a hit with "American Idiot"?', 'Green Day', 'Punk', 'easy', 
        ['Green Day', 'Blink-182', 'Sum 41', 'The Offspring']),
      createQuestion('text-input', 'Who was the bassist of the Ramones?', 'Dee Dee Ramone', 'Punk', 'hard'),
      createQuestion('multiple-choice', 'Which venue was the birthplace of punk rock?', 'CBGB', 'Punk', 'medium', 
        ['CBGB', 'The Roxy', 'The Fillmore', 'The Troubadour']),
      createQuestion('text-input', 'Which band sang "All the Small Things"?', 'Blink-182', 'Punk', 'easy')
    ]
  });

  // Game 18: Reggae & Ska
  games.push({
    title: "Reggae & Ska Vibes",
    description: "Island rhythms and positive vibrations",
    date: addDays(startDate, 17),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who is known as the "King of Reggae"?', 'Bob Marley', 'Reggae', 'easy', 
        ['Bob Marley', 'Peter Tosh', 'Jimmy Cliff', 'Burning Spear']),
      createQuestion('text-input', 'What was Bob Marley\'s band called?', 'The Wailers', 'Reggae', 'easy'),
      createQuestion('multiple-choice', 'Which Bob Marley song became a worldwide anthem?', 'One Love', 'Reggae', 'medium', 
        ['One Love', 'No Woman No Cry', 'Redemption Song', 'Three Little Birds']),
      createQuestion('text-input', 'What island nation is reggae music from?', 'Jamaica', 'Reggae', 'easy'),
      createQuestion('multiple-choice', 'Which artist had a hit with "Red Red Wine"?', 'UB40', 'Reggae', 'medium', 
        ['UB40', 'Steel Pulse', 'Aswad', 'Third World']),
      createQuestion('text-input', 'What religion is closely associated with reggae music?', 'Rastafarianism', 'Reggae', 'medium'),
      createQuestion('multiple-choice', 'Which movie featured Jimmy Cliff and reggae music?', 'The Harder They Come', 'Reggae', 'hard', 
        ['The Harder They Come', 'Rockers', 'Countryman', 'Shottas']),
      createQuestion('text-input', 'Who recorded "israelites"?', 'Desmond Dekker', 'Reggae', 'hard'),
      createQuestion('multiple-choice', 'What style preceded reggae?', 'Ska', 'Reggae', 'medium', 
        ['Ska', 'Calypso', 'Soca', 'Merengue']),
      createQuestion('text-input', 'Who sang "I Can See Clearly Now"?', 'Johnny Nash', 'Reggae', 'medium')
    ]
  });

  // Game 19: Soul Music
  games.push({
    title: "Soul Music Magic",
    description: "Heartfelt soul and powerful vocals",
    date: addDays(startDate, 18),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who sang "Sitting on the Dock of the Bay"?', 'Otis Redding', 'Soul', 'easy', 
        ['Otis Redding', 'Sam Cooke', 'Wilson Pickett', 'Solomon Burke']),
      createQuestion('text-input', 'Who is known as the "Queen of Soul"?', 'Aretha Franklin', 'Soul', 'easy'),
      createQuestion('multiple-choice', 'Which soul singer wrote "A Change Is Gonna Come"?', 'Sam Cooke', 'Soul', 'medium', 
        ['Sam Cooke', 'Otis Redding', 'Curtis Mayfield', 'Al Green']),
      createQuestion('text-input', 'Who sang "Try a Little Tenderness"?', 'Otis Redding', 'Soul', 'medium'),
      createQuestion('multiple-choice', 'Which label was known as "The House That Ruth Built"?', 'Atlantic Records', 'Soul', 'hard', 
        ['Atlantic Records', 'Stax Records', 'Motown', 'Chess Records']),
      createQuestion('text-input', 'Who recorded "Lean on Me"?', 'Bill Withers', 'Soul', 'easy'),
      createQuestion('multiple-choice', 'Which duo sang "Hold On, I\'m Comin\'"?', 'Sam & Dave', 'Soul', 'medium', 
        ['Sam & Dave', 'The Righteous Brothers', 'Ike & Tina Turner', 'Peaches & Herb']),
      createQuestion('text-input', 'Who sang "Stand by Me"?', 'Ben E. King', 'Soul', 'easy'),
      createQuestion('multiple-choice', 'Which artist had a hit with "Let\'s Stay Together"?', 'Al Green', 'Soul', 'easy', 
        ['Al Green', 'Marvin Gaye', 'Curtis Mayfield', 'Teddy Pendergrass']),
      createQuestion('text-input', 'Who recorded "Chain of Fools"?', 'Aretha Franklin', 'Soul', 'medium')
    ]
  });

  // Game 20: Indie Rock
  games.push({
    title: "Indie Rock Heroes",
    description: "Independent spirit and alternative sounds",
    date: addDays(startDate, 19),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which band released "Mr. Brightside"?', 'The Killers', 'Indie', 'easy', 
        ['The Killers', 'The Strokes', 'Franz Ferdinand', 'Arctic Monkeys']),
      createQuestion('text-input', 'Which band sang "Float On"?', 'Modest Mouse', 'Indie', 'medium'),
      createQuestion('multiple-choice', 'Who is the lead singer of The Strokes?', 'Julian Casablancas', 'Indie', 'medium', 
        ['Julian Casablancas', 'Alex Turner', 'Brandon Flowers', 'Jack White']),
      createQuestion('text-input', 'Which Arctic Monkeys album features "Do I Wanna Know?"?', 'AM', 'Indie', 'medium'),
      createQuestion('multiple-choice', 'Which band sang "Take Me Out"?', 'Franz Ferdinand', 'Indie', 'easy', 
        ['Franz Ferdinand', 'The Killers', 'Interpol', 'The Rapture']),
      createQuestion('text-input', 'Who is the frontman of Vampire Weekend?', 'Ezra Koenig', 'Indie', 'hard'),
      createQuestion('multiple-choice', 'Which band released the album "Funeral"?', 'Arcade Fire', 'Indie', 'medium', 
        ['Arcade Fire', 'The National', 'Modest Mouse', 'Death Cab for Cutie']),
      createQuestion('text-input', 'Which band sang "1979"?', 'The Smashing Pumpkins', 'Indie', 'medium'),
      createQuestion('multiple-choice', 'Who recorded "Seven Nation Army"?', 'The White Stripes', 'Indie', 'easy', 
        ['The White Stripes', 'The Black Keys', 'Queens of the Stone Age', 'The Raconteurs']),
      createQuestion('text-input', 'Which band released "Kids"?', 'MGMT', 'Indie', 'easy')
    ]
  });

  // Game 21: Classical Crossover
  games.push({
    title: "Classical Meets Pop",
    description: "When classical music meets popular culture",
    date: addDays(startDate, 20),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which composer wrote "Fur Elise"?', 'Beethoven', 'Classical', 'easy', 
        ['Mozart', 'Beethoven', 'Bach', 'Chopin']),
      createQuestion('text-input', 'Which classical piece is also known as "The William Tell Overture"?', 'The Lone Ranger Theme', 'Classical', 'medium', 
        undefined, undefined, 'Famous from The Lone Ranger TV show'),
      createQuestion('multiple-choice', 'Which opera features "O Fortuna"?', 'Carmina Burana', 'Classical', 'hard', 
        ['Carmina Burana', 'Requiem', 'The Magic Flute', 'La Boheme']),
      createQuestion('text-input', 'Which composer wrote "The Four Seasons"?', 'Vivaldi', 'Classical', 'medium'),
      createQuestion('multiple-choice', 'Which classical piece was used in "2001: A Space Odyssey"?', 'Also Sprach Zarathustra', 'Classical', 'hard', 
        ['Also Sprach Zarathustra', 'The Blue Danube', 'Both', 'Neither']),
      createQuestion('text-input', 'Which composer is known for "The Magic Flute"?', 'Mozart', 'Classical', 'medium'),
      createQuestion('multiple-choice', 'Which symphony is known as "Ode to Joy"?', 'Beethoven\'s 9th', 'Classical', 'medium', 
        ['Beethoven\'s 5th', 'Beethoven\'s 9th', 'Mozart\'s 40th', 'Brahms\' 1st']),
      createQuestion('text-input', 'Who composed "Clair de Lune"?', 'Debussy', 'Classical', 'medium'),
      createQuestion('multiple-choice', 'Which balletfeatures "Dance of the Sugar Plum Fairy"?', 'The Nutcracker', 'Classical', 'easy', 
        ['The Nutcracker', 'Swan Lake', 'Sleeping Beauty', 'Giselle']),
      createQuestion('text-input', 'Who composed "Ride of the Valkyries"?', 'Wagner', 'Classical', 'medium')
    ]
  });

  // Game 22: 2000s Nostalgia
  games.push({
    title: "2000s Throwback",
    description: "Turn of the millennium classics",
    date: addDays(startDate, 21),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which Britney Spears song was released in 2000?', 'Oops!... I Did It Again', 'Pop', 'easy', 
        ['Oops!... I Did It Again', 'Toxic', 'Baby One More Time', 'Gimme More']),
      createQuestion('text-input', 'Who sang "Complicated"?', 'Avril Lavigne', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which boy band sang "Bye Bye Bye"?', 'NSYNC', 'Pop', 'easy', 
        ['NSYNC', 'Backstreet Boys', '98 Degrees', 'O-Town']),
      createQuestion('text-input', 'Who had a hit with "Crazy in Love" featuring Jay-Z?', 'Beyonce', 'R&B', 'easy'),
      createQuestion('multiple-choice', 'Which rapper had a hit with "In Da Club"?', '50 Cent', 'Hip Hop', 'easy', 
        ['50 Cent', 'Nelly', 'Ludacris', 'Ja Rule']),
      createQuestion('text-input', 'Who sang "Umbrella"?', 'Rihanna', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which band had a hit with "How to Save a Life"?', 'The Fray', 'Alternative', 'medium', 
        ['The Fray', 'Snow Patrol', 'The Script', 'OneRepublic']),
      createQuestion('text-input', 'Who released "Hollaback Girl"?', 'Gwen Stefani', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which artist sang "Gold Digger"?', 'Kanye West', 'Hip Hop', 'easy', 
        ['Kanye West', 'Jay-Z', 'Ludacris', 'T.I.']),
      createQuestion('text-input', 'Who had a hit with "Chasing Cars"?', 'Snow Patrol', 'Alternative', 'medium')
    ]
  });

  // Game 23: Girl Groups
  games.push({
    title: "Girl Group Glory",
    description: "Celebrating female vocal groups through the decades",
    date: addDays(startDate, 22),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which group sang "Wannabe"?', 'Spice Girls', 'Pop', 'easy', 
        ['Spice Girls', 'TLC', 'Destiny\'s Child', 'En Vogue']),
      createQuestion('text-input', 'Who was the lead singer of Destiny\'s Child?', 'Beyonce', 'R&B', 'easy'),
      createQuestion('multiple-choice', 'Which group had a hit with "Waterfalls"?', 'TLC', 'R&B', 'easy', 
        ['TLC', 'En Vogue', 'SWV', 'Total']),
      createQuestion('text-input', 'Which girl group sang "Stop in the Name of Love"?', 'The Supremes', 'R&B', 'medium'),
      createQuestion('multiple-choice', 'Who sang "No Scrubs"?', 'TLC', 'R&B', 'easy', 
        ['TLC', 'Destiny\'s Child', 'En Vogue', '702']),
      createQuestion('text-input', 'Which British group included Mel B, Mel C, and Geri?', 'Spice Girls', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which group sang "Lady Marmalade" in 2001?', 'Christina Aguilera, Lil\' Kim, Mya & Pink', 'Pop', 'medium', 
        ['Christina Aguilera, Lil\' Kim, Mya & Pink', 'Destiny\'s Child', 'TLC', 'En Vogue']),
      createQuestion('text-input', 'Which group sang "Be My Baby"?', 'The Ronettes', 'Pop', 'hard'),
      createQuestion('multiple-choice', 'Who had a hit with "Independent Women"?', 'Destiny\'s Child', 'R&B', 'easy', 
        ['Destiny\'s Child', 'TLC', 'En Vogue', '3LW']),
      createQuestion('text-input', 'Which K-pop girl group sang "DDU-DU DDU-DU"?', 'BLACKPINK', 'K-pop', 'easy')
    ]
  });

  // Game 24: Rock Guitar Heroes
  games.push({
    title: "Guitar Heroes",
    description: "Legendary guitarists and their iconic riffs",
    date: addDays(startDate, 23),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Who is often called the greatest guitarist of all time?', 'Jimi Hendrix', 'Rock', 'easy', 
        ['Jimi Hendrix', 'Eric Clapton', 'Jimmy Page', 'Eddie Van Halen']),
      createQuestion('text-input', 'Which guitarist is known for playing with his teeth?', 'Jimi Hendrix', 'Rock', 'medium'),
      createQuestion('multiple-choice', 'Who played guitar for Led Zeppelin?', 'Jimmy Page', 'Rock', 'easy', 
        ['Jimmy Page', 'Eric Clapton', 'Jeff Beck', 'Pete Townshend']),
      createQuestion('text-input', 'Which guitarist developed the "tapping" technique?', 'Eddie Van Halen', 'Rock', 'medium'),
      createQuestion('multiple-choice', 'Who played the guitar solo on "Hotel California"?', 'Don Felder & Joe Walsh', 'Rock', 'hard', 
        ['Don Felder & Joe Walsh', 'Joe Walsh', 'Don Henley', 'Glenn Frey']),
      createQuestion('text-input', 'Which guitarist is known as "God"?', 'Eric Clapton', 'Rock', 'medium'),
      createQuestion('multiple-choice', 'Who is the guitarist for Queen?', 'Brian May', 'Rock', 'medium', 
        ['Brian May', 'Freddie Mercury', 'Roger Taylor', 'John Deacon']),
      createQuestion('text-input', 'Which guitarist played "Eruption"?', 'Eddie Van Halen', 'Rock', 'easy'),
      createQuestion('multiple-choice', 'Who wrote and performed "Voodoo Child"?', 'Jimi Hendrix', 'Rock', 'medium', 
        ['Jimi Hendrix', 'Stevie Ray Vaughan', 'B.B. King', 'Albert King']),
      createQuestion('text-input', 'Who is the guitarist for The Edge known for playing in?', 'U2', 'Rock', 'easy')
    ]
  });

  // Game 25: Music Video Icons
  games.push({
    title: "Music Video Revolution",
    description: "Iconic music videos that defined MTV",
    date: addDays(startDate, 24),
    isDaily: false,
    questions: [
      createQuestion('multiple-choice', 'Which video was the first to air on MTV?', 'Video Killed the Radio Star', 'Pop', 'hard', 
        ['Video Killed the Radio Star', 'You Better Run', 'Brass in Pocket', 'Take On Me']),
      createQuestion('text-input', 'Who directed the "Thriller" music video?', 'John Landis', 'Pop', 'hard'),
      createQuestion('multiple-choice', 'Which video featured Michael Jackson\'s famous moonwalk?', 'Billie Jean', 'Pop', 'medium', 
        ['Billie Jean', 'Thriller', 'Beat It', 'Smooth Criminal']),
      createQuestion('text-input', 'Which artist\'s video featured pencil sketch animation for "Take On Me"?', 'A-ha', 'Pop', 'medium'),
      createQuestion('multiple-choice', 'Which Madonna video was banned by MTV?', 'Justify My Love', 'Pop', 'hard', 
        ['Justify My Love', 'Like a Prayer', 'Erotica', 'American Life']),
      createQuestion('text-input', 'Who performed an elaborate dance routine in "Vogue"?', 'Madonna', 'Pop', 'easy'),
      createQuestion('multiple-choice', 'Which video featured the famous red leather jacket?', 'Thriller', 'Pop', 'easy', 
        ['Thriller', 'Beat It', 'Bad', 'Billie Jean']),
      createQuestion('text-input', 'Which artist\'s video featured the famous treadmill dance?', 'OK Go', 'Alternative', 'medium'),
      createQuestion('multiple-choice', 'Which Guns N\' Roses video showed a wedding?', 'November Rain', 'Rock', 'medium', 
        ['November Rain', 'Sweet Child O\' Mine', 'Patience', 'Don\'t Cry']),
      createQuestion('text-input', 'Who directed "Bad" by Michael Jackson?', 'Martin Scorsese', 'Pop', 'hard')
    ]
  });

  return games;
};
