import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { CollectionBill } from '../models/CollectionBill';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /collection-bills
 * Get all collection bills for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const bills = await CollectionBill.findAll({
      where: { userId: (req as AuthenticatedRequest).userId },
      include: ['medicalProvider'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: bills,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection bills',
    } as ApiResponse);
  }
});

/**
 * GET /collection-bills/:id
 * Get a specific collection bill
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid collection bill ID'),
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
      const bill = await CollectionBill.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      if (!bill) {
        res.status(404).json({
          success: false,
          error: 'Collection bill not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: bill,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch collection bill',
      } as ApiResponse);
    }
  }
);

/**
 * POST /collection-bills
 * Create a new collection bill
 */
router.post('/',
  requireAuth,
  [
    body('medicalProviderId')
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('dateOfNotice')
      .isISO8601()
      .withMessage('Date of notice must be a valid date'),
    body('dateOfService')
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('amountTotal')
      .isFloat({ min: 0 })
      .withMessage('Amount total must be a positive number'),
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

      const { medicalProviderId, dateOfNotice, dateOfService, amountTotal } = req.body;
      const bill = await CollectionBill.create({
        userId: (req as AuthenticatedRequest).userId,
        medicalProviderId,
        dateOfNotice,
        dateOfService,
        amountTotal,
      });

      const billWithProvider = await CollectionBill.findOne({
        where: { id: bill.id },
        include: ['medicalProvider'],
      });

      res.status(201).json({
        success: true,
        data: billWithProvider,
        message: 'Collection bill created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create collection bill',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /collection-bills/:id
 * Update a collection bill
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid collection bill ID'),
    body('medicalProviderId')
      .optional()
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('dateOfNotice')
      .optional()
      .isISO8601()
      .withMessage('Date of notice must be a valid date'),
    body('dateOfService')
      .optional()
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('amountTotal')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount total must be a positive number'),
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
      const { medicalProviderId, dateOfNotice, dateOfService, amountTotal } = req.body;

      const [updatedRowsCount] = await CollectionBill.update(
        { medicalProviderId, dateOfNotice, dateOfService, amountTotal },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Collection bill not found',
        } as ApiResponse);
        return;
      }

      const updatedBill = await CollectionBill.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      res.json({
        success: true,
        data: updatedBill,
        message: 'Collection bill updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update collection bill',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /collection-bills/:id
 * Delete a collection bill
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid collection bill ID'),
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
      const deletedRowsCount = await CollectionBill.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Collection bill not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Collection bill deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete collection bill',
      } as ApiResponse);
    }
  }
);

export default router;