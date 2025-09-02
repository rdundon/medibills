import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

// Create Sequelize instance
export const sequelize = new Sequelize(databaseUrl, {
  dialect: databaseUrl.startsWith('sqlite:') ? 'sqlite' : 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  storage: databaseUrl.startsWith('sqlite:') ? databaseUrl.replace('sqlite:', '') : undefined,
  dialectOptions: {
    // SQLite specific options
    ...(databaseUrl.startsWith('sqlite:') && {
      // Enable foreign keys for SQLite
      pragma: {
        foreign_keys: 1,
      },
    }),
    // PostgreSQL specific options for production
    ...(databaseUrl.startsWith('postgresql:') && {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    }),
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Initialize database (create tables)
export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database tables:', error);
    throw error;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};