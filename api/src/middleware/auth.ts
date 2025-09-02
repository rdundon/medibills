import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

// Extend Express session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

/**
 * Middleware to require authentication
 * Checks if user is logged in via session
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.userId) {
    res.status(401).json({ 
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return;
  }
  
  // Add userId to request object for authenticated routes
  (req as AuthenticatedRequest).userId = req.session.userId;
  next();
};

/**
 * Middleware for optional authentication
 * Adds userId to request if user is logged in, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.userId) {
    (req as AuthenticatedRequest).userId = req.session.userId;
  }
  next();
};

/**
 * Middleware to check if user is already authenticated
 * Used for routes like login/register where authenticated users shouldn't access
 */
export const requireGuest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.userId) {
    res.status(400).json({
      success: false,
      error: 'Already authenticated',
      message: 'You are already logged in'
    });
    return;
  }
  next();
};

/**
 * Middleware to validate user ownership of resources
 * Ensures users can only access their own data
 */
export const validateUserOwnership = (userIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId && resourceUserId !== req.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware to add user context to all authenticated requests
 * This ensures all database queries are scoped to the authenticated user
 */
export const addUserContext = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Add user ID to query parameters for GET requests
  if (req.method === 'GET') {
    req.query.userId = req.userId;
  }
  
  // Add user ID to body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    req.body.userId = req.userId;
  }
  
  next();
};