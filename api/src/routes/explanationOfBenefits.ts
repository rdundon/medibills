import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ExplanationOfBenefits } from '../models/ExplanationOfBenefits';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /explanation-of-benefits
 * Get all explanation of benefits for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const eobs = await ExplanationOfBenefits.findAll({
      where: { userId: (req as AuthenticatedRequest).userId },
      include: ['medicalProvider'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: eobs,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch explanation of benefits',
    } as ApiResponse);
  }
});

/**
 * GET /explanation-of-benefits/:id
 * Get a specific explanation of benefits
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid EOB ID'),
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
      const eob = await ExplanationOfBenefits.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      if (!eob) {
        res.status(404).json({
          success: false,
          error: 'Explanation of benefits not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: eob,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch explanation of benefits',
      } as ApiResponse);
    }
  }
);

/**
 * POST /explanation-of-benefits
 * Create a new explanation of benefits
 */
router.post('/',
  requireAuth,
  [
    body('medicalProviderId')
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('dateOfService')
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('totalPaid')
      .isFloat({ min: 0 })
      .withMessage('Total paid must be a positive number'),
    body('totalBilled')
      .isFloat({ min: 0 })
      .withMessage('Total billed must be a positive number'),
    body('totalDiscount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total discount must be a positive number'),
    body('totalMayOwe')
      .isFloat({ min: 0 })
      .withMessage('Total may owe must be a positive number'),
    body('insurer')
      .isLength({ min: 1, max: 255 })
      .withMessage('Insurer must be between 1 and 255 characters'),
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

      const { medicalProviderId, dateOfService, totalPaid, totalBilled, totalDiscount, totalMayOwe, insurer } = req.body;
      const eob = await ExplanationOfBenefits.create({
        userId: (req as AuthenticatedRequest).userId,
        medicalProviderId,
        dateOfService,
        totalPaid,
        totalBilled,
        totalDiscount: totalDiscount || 0,
        totalMayOwe,
        insurer,
      });

      const eobWithProvider = await ExplanationOfBenefits.findOne({
        where: { id: eob.id },
        include: ['medicalProvider'],
      });

      res.status(201).json({
        success: true,
        data: eobWithProvider,
        message: 'Explanation of benefits created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create explanation of benefits',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /explanation-of-benefits/:id
 * Update an explanation of benefits
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid EOB ID'),
    body('medicalProviderId')
      .optional()
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('dateOfService')
      .optional()
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('totalPaid')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total paid must be a positive number'),
    body('totalBilled')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total billed must be a positive number'),
    body('totalDiscount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total discount must be a positive number'),
    body('totalMayOwe')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total may owe must be a positive number'),
    body('insurer')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Insurer must be between 1 and 255 characters'),
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
      const { medicalProviderId, dateOfService, totalPaid, totalBilled, totalDiscount, totalMayOwe, insurer } = req.body;

      const [updatedRowsCount] = await ExplanationOfBenefits.update(
        { medicalProviderId, dateOfService, totalPaid, totalBilled, totalDiscount, totalMayOwe, insurer },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Explanation of benefits not found',
        } as ApiResponse);
        return;
      }

      const updatedEob = await ExplanationOfBenefits.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      res.json({
        success: true,
        data: updatedEob,
        message: 'Explanation of benefits updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update explanation of benefits',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /explanation-of-benefits/:id
 * Delete an explanation of benefits
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid EOB ID'),
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
      const deletedRowsCount = await ExplanationOfBenefits.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Explanation of benefits not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Explanation of benefits deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete explanation of benefits',
      } as ApiResponse);
    }
  }
);

export default router;