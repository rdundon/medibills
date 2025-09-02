import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import { sequelize } from './database';

const SequelizeSessionStore = SequelizeStore(session.Store);

// Create session store
const sessionStore = new SequelizeSessionStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // Check every 15 minutes
  expiration: 24 * 60 * 60 * 1000, // 24 hours
});

// Session configuration
export const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  name: 'medibills.sid', // Custom session name
};

// Initialize session store (create table)
export const initializeSessionStore = async (): Promise<void> => {
  try {
    await sessionStore.sync();
    console.log('✅ Session store initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing session store:', error);
    throw error;
  }
};

export { sessionStore };