import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalProvider } from '../models/MedicalProvider';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /medical-providers
 * Get all medical providers for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const providers = await MedicalProvider.findAll({
      where: { userId: (req as AuthenticatedRequest).userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: providers,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical providers',
    } as ApiResponse);
  }
});

/**
 * GET /medical-providers/:id
 * Get a specific medical provider
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid provider ID'),
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

      const { id } = req.params;
      const provider = await MedicalProvider.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Medical provider not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: provider,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch medical provider',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-providers
 * Create a new medical provider
 */
router.post('/',
  requireAuth,
  [
    body('name')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('address')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Address must be less than 1000 characters'),
    body('phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Phone must be less than 20 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('paymentWebsite')
      .optional()
      .isURL()
      .withMessage('Payment website must be a valid URL'),
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

      const { name, address, phone, website, paymentWebsite } = req.body;
      const provider = await MedicalProvider.create({
        userId: (req as AuthenticatedRequest).userId,
        name,
        address,
        phone,
        website,
        paymentWebsite,
      });

      res.status(201).json({
        success: true,
        data: provider,
        message: 'Medical provider created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medical provider',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /medical-providers/:id
 * Update a medical provider
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid provider ID'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('address')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Address must be less than 1000 characters'),
    body('phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Phone must be less than 20 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('paymentWebsite')
      .optional()
      .isURL()
      .withMessage('Payment website must be a valid URL'),
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

      const { id } = req.params;
      const { name, address, phone, website, paymentWebsite } = req.body;

      const [updatedRowsCount] = await MedicalProvider.update(
        { name, address, phone, website, paymentWebsite },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical provider not found',
        } as ApiResponse);
        return;
      }

      const updatedProvider = await MedicalProvider.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      res.json({
        success: true,
        data: updatedProvider,
        message: 'Medical provider updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medical provider',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-providers/:id
 * Delete a medical provider
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid provider ID'),
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

      const { id } = req.params;
      const deletedRowsCount = await MedicalProvider.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical provider not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Medical provider deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete medical provider',
      } as ApiResponse);
    }
  }
);

export default router;