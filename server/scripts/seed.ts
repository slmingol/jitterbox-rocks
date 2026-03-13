import '../config/sqlite'; // Initialize SQLite database
import { GameRepository } from '../repositories/GameRepository';
import gameService from '../services/gameService';
import { seedGamesData } from '../data/seedGames';

const seedDatabase = async () => {
  try {
    console.log('🌱 Preparing to seed database...');
    
    // Clear existing games
    console.log('🗑️  Clearing existing games...');
    GameRepository.deleteAll();
    
    console.log('📝 Generating seed data...');
    const games = seedGamesData();
    
    console.log(`🎮 Seeding ${games.length} games...`);
    const createdGames = await gameService.seedGames(games);
    
    console.log(`\n✅ Successfully seeded ${createdGames.length} games!`);
    console.log('\n📅 Daily games:');
    games.filter(g => g.isDaily).forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.title} - ${g.date.toDateString()}`);
    });
    
    console.log('\n🎯 Practice games:');
    games.filter(g => !g.isDaily).forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.title}`);
    });
    
    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
