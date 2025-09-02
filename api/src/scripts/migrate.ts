import dotenv from 'dotenv';
import { testConnection, initializeDatabase, closeConnection } from '../config/database';
import '../models'; // Import models to ensure associations are set up

// Load environment variables
dotenv.config();

/**
 * Database migration script
 * Creates all tables and sets up relationships
 */
async function migrate(): Promise<void> {
  try {
    console.log('🔄 Starting database migration...');

    // Test connection
    await testConnection();

    // Initialize database (create tables)
    await initializeDatabase();

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await closeConnection();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

export { migrate };