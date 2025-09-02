import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { requireAuth, requireGuest, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', 
  requireGuest,
  [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { username, email, password } = req.body;
      const user = await AuthService.register({ username, email, password });

      // Create session
      req.session.userId = user.id;

      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/login
 * Login user
 */
router.post('/login',
  requireGuest,
  [
    body('username')
      .notEmpty()
      .withMessage('Username or email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { username, password } = req.body;
      const user = await AuthService.login({ username, password });

      // Create session
      req.session.userId = user.id;

      res.json({
        success: true,
        data: user,
        message: 'Login successful',
      } as ApiResponse);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: 'Failed to logout',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    } as ApiResponse);
  }
});

/**
 * GET /auth/me
 * Get current user information
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await AuthService.getUserById(req.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
    } as ApiResponse);
  }
});

/**
 * PUT /auth/password
 * Update user password
 */
router.put('/password',
  requireAuth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await AuthService.updatePassword(req.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update password',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile',
  requireAuth,
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { username, email } = req.body;
      const user = await AuthService.updateProfile(req.userId, { username, email });

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      } as ApiResponse);
    }
  }
);

export default router;