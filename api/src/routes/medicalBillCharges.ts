import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalBillCharges } from '../models/MedicalBillCharges';
import { MedicalBill } from '../models/MedicalBill';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /medical-bill-charges
 * Get all medical bill charges for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const charges = await MedicalBillCharges.findAll({
      include: [{
        model: MedicalBill,
        as: 'medicalBill',
        where: { userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: charges,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical bill charges',
    } as ApiResponse);
  }
});

/**
 * GET /medical-bill-charges/:id
 * Get a specific medical bill charge
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid charge ID'),
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
      const charge = await MedicalBillCharges.findOne({
        where: { id },
        include: [{
          model: MedicalBill,
          as: 'medicalBill',
          where: { userId: (req as AuthenticatedRequest).userId },
          include: ['medicalProvider'],
        }],
      });

      if (!charge) {
        res.status(404).json({
          success: false,
          error: 'Medical bill charge not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: charge,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch medical bill charge',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-bill-charges
 * Create a new medical bill charge
 */
router.post('/',
  requireAuth,
  [
    body('medicalBillId')
      .isUUID()
      .withMessage('Medical bill ID must be a valid UUID'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
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

      const { medicalBillId, amount, description } = req.body;

      // Verify the medical bill belongs to the user
      const bill = await MedicalBill.findOne({
        where: { id: medicalBillId, userId: (req as AuthenticatedRequest).userId },
      });

      if (!bill) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found or access denied',
        } as ApiResponse);
        return;
      }

      const charge = await MedicalBillCharges.create({
        medicalBillId,
        amount,
        description,
      });

      const chargeWithBill = await MedicalBillCharges.findOne({
        where: { id: charge.id },
        include: [{
          model: MedicalBill,
          as: 'medicalBill',
          include: ['medicalProvider'],
        }],
      });

      res.status(201).json({
        success: true,
        data: chargeWithBill,
        message: 'Medical bill charge created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medical bill charge',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /medical-bill-charges/:id
 * Update a medical bill charge
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid charge ID'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
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
      const { amount, description } = req.body;

      // First verify ownership
      const existingCharge = await MedicalBillCharges.findOne({
        where: { id },
        include: [{
          model: MedicalBill,
          as: 'medicalBill',
          where: { userId: (req as AuthenticatedRequest).userId },
        }],
      });

      if (!existingCharge) {
        res.status(404).json({
          success: false,
          error: 'Medical bill charge not found',
        } as ApiResponse);
        return;
      }

      const [updatedRowsCount] = await MedicalBillCharges.update(
        { amount, description },
        { where: { id } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical bill charge not found',
        } as ApiResponse);
        return;
      }

      const updatedCharge = await MedicalBillCharges.findOne({
        where: { id },
        include: [{
          model: MedicalBill,
          as: 'medicalBill',
          include: ['medicalProvider'],
        }],
      });

      res.json({
        success: true,
        data: updatedCharge,
        message: 'Medical bill charge updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medical bill charge',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-bill-charges/:id
 * Delete a medical bill charge
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid charge ID'),
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

      // Verify ownership through the medical bill
      const charge = await MedicalBillCharges.findOne({
        where: { id },
        include: [{
          model: MedicalBill,
          as: 'medicalBill',
          where: { userId: (req as AuthenticatedRequest).userId },
        }],
      });

      if (!charge) {
        res.status(404).json({
          success: false,
          error: 'Medical bill charge not found',
        } as ApiResponse);
        return;
      }

      await charge.destroy();

      res.json({
        success: true,
        message: 'Medical bill charge deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete medical bill charge',
      } as ApiResponse);
    }
  }
);

export default router;