import dotenv from 'dotenv';
import { testConnection, closeConnection } from '../config/database';
import { AuthService } from '../services/authService';
import '../models'; // Import models to ensure associations are set up

// Load environment variables
dotenv.config();

/**
 * Database seeding script
 * Creates sample data for development
 */
async function seed(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Test connection
    await testConnection();

    // Create a demo user
    try {
      const demoUser = await AuthService.register({
        username: 'demo',
        email: 'demo@medibills.com',
        password: 'Demo123!',
      });
      console.log('✅ Created demo user:', demoUser.username);
    } catch (error) {
      console.log('ℹ️  Demo user already exists or creation failed');
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('🎯 Demo credentials: demo / Demo123!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await closeConnection();
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seed();
}

export { seed };