import { app } from './app';
import { testConnection, initializeDatabase } from './config/database';
import { initializeSessionStore } from './config/session';

const PORT = process.env.PORT || 3001;

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting Medical Bills API Server...');

    // Test database connection
    await testConnection();

    // Initialize session store
    await initializeSessionStore();

    // Initialize database tables
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 API Base URL: http://localhost:${PORT}`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
        console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();