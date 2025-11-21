import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { sessionConfig } from './config/session';
import authRoutes from './routes/auth';
import medicalProvidersRoutes from './routes/medicalProviders';
import medicalBillsRoutes from './routes/medicalBills';
import medicalBillChargesRoutes from './routes/medicalBillCharges';
import explanationOfBenefitsRoutes from './routes/explanationOfBenefits';
import collectionBillsRoutes from './routes/collectionBills';
import medicalServiceEventsRoutes from './routes/medicalServiceEvents';

// Load environment variables
dotenv.config();

// Import models to initialize associations
import './models';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001', // API port for testing
    ];
    
    // Check if origin is in allowed list or if we're in development
    const isAllowed = allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development';
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session(sessionConfig));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Medical Bills API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/medical-providers', medicalProvidersRoutes);
app.use('/api/medical-bills', medicalBillsRoutes);
app.use('/api/medical-bill-charges', medicalBillChargesRoutes);
app.use('/api/explanation-of-benefits', explanationOfBenefitsRoutes);
app.use('/api/collection-bills', collectionBillsRoutes);
app.use('/api/medical-service-events', medicalServiceEventsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

export { app };