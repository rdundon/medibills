import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalBill } from '../models/MedicalBill';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /medical-bills
 * Get all medical bills for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const bills = await MedicalBill.findAll({
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
      error: 'Failed to fetch medical bills',
    } as ApiResponse);
  }
});

/**
 * GET /medical-bills/:id
 * Get a specific medical bill
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid bill ID'),
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
      const bill = await MedicalBill.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      if (!bill) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
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
        error: 'Failed to fetch medical bill',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-bills
 * Create a new medical bill
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
    body('total')
      .isFloat({ min: 0 })
      .withMessage('Total must be a positive number'),
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

      const { medicalProviderId, dateOfService, total } = req.body;
      const bill = await MedicalBill.create({
        userId: (req as AuthenticatedRequest).userId,
        medicalProviderId,
        dateOfService,
        total,
      });

      const billWithProvider = await MedicalBill.findOne({
        where: { id: bill.id },
        include: ['medicalProvider'],
      });

      res.status(201).json({
        success: true,
        data: billWithProvider,
        message: 'Medical bill created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medical bill',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /medical-bills/:id
 * Update a medical bill
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid bill ID'),
    body('medicalProviderId')
      .optional()
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('dateOfService')
      .optional()
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('total')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total must be a positive number'),
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
      const { medicalProviderId, dateOfService, total } = req.body;

      const [updatedRowsCount] = await MedicalBill.update(
        { medicalProviderId, dateOfService, total },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
        } as ApiResponse);
        return;
      }

      const updatedBill = await MedicalBill.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      });

      res.json({
        success: true,
        data: updatedBill,
        message: 'Medical bill updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medical bill',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-bills/:id
 * Delete a medical bill
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid bill ID'),
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
      const deletedRowsCount = await MedicalBill.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Medical bill deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete medical bill',
      } as ApiResponse);
    }
  }
);

export default router;