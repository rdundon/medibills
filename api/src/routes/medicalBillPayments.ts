import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalBillPayments, MedicalBill, MedicalBillPaymentAssociation } from '../models';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /medical-bill-payments
 * Get all medical bill payments for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await MedicalBillPayments.findAll({
      where: { userId: (req as AuthenticatedRequest).userId },
      include: [{
        model: MedicalBill,
        as: 'medicalBills',
        include: ['medicalProvider'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: payments,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical bill payments',
    } as ApiResponse);
  }
});

/**
 * GET /medical-bill-payments/:id
 * Get a specific medical bill payment
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid payment ID'),
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
      const payment = await MedicalBillPayments.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: [{
          model: MedicalBill,
          as: 'medicalBills',
          include: ['medicalProvider'],
        }],
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Medical bill payment not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: payment,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch medical bill payment',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-bill-payments
 * Create a new medical bill payment
 */
router.post('/',
  requireAuth,
  [
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid date'),
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

      const { amount, date } = req.body;
      const payment = await MedicalBillPayments.create({
        userId: (req as AuthenticatedRequest).userId,
        amount,
        date,
      });

      const paymentWithBills = await MedicalBillPayments.findOne({
        where: { id: payment.id },
        include: [{
          model: MedicalBill,
          as: 'medicalBills',
          include: ['medicalProvider'],
        }],
      });

      res.status(201).json({
        success: true,
        data: paymentWithBills,
        message: 'Medical bill payment created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medical bill payment',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /medical-bill-payments/:id
 * Update a medical bill payment
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid payment ID'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid date'),
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
      const { amount, date } = req.body;

      const [updatedRowsCount] = await MedicalBillPayments.update(
        { amount, date },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical bill payment not found',
        } as ApiResponse);
        return;
      }

      const updatedPayment = await MedicalBillPayments.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: [{
          model: MedicalBill,
          as: 'medicalBills',
          include: ['medicalProvider'],
        }],
      });

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Medical bill payment updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medical bill payment',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-bill-payments/:id
 * Delete a medical bill payment
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid payment ID'),
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
      const deletedRowsCount = await MedicalBillPayments.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical bill payment not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Medical bill payment deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete medical bill payment',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-bill-payments/:id/medical-bills
 * Add medical bills to a payment
 */
router.post('/:id/medical-bills',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid payment ID'),
    body('medicalBillIds')
      .isArray()
      .withMessage('Medical bill IDs must be an array'),
    body('medicalBillIds.*')
      .isUUID()
      .withMessage('Each medical bill ID must be a valid UUID'),
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
      const { medicalBillIds } = req.body;
      const userId = (req as AuthenticatedRequest).userId;

      // Check if payment exists and belongs to user
      const payment = await MedicalBillPayments.findOne({
        where: { id, userId },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Medical bill payment not found',
        } as ApiResponse);
        return;
      }

      // Check if medical bills exist and belong to user
      const medicalBills = await MedicalBill.findAll({
        where: {
          id: medicalBillIds,
          userId,
        },
      });

      if (medicalBills.length !== medicalBillIds.length) {
        res.status(400).json({
          success: false,
          error: 'One or more medical bills not found or do not belong to user',
        } as ApiResponse);
        return;
      }

      // Add associations
      const associations = medicalBillIds.map((medicalBillId: string) => ({
        medicalBillId,
        medicalBillPaymentId: id,
      }));
      await MedicalBillPaymentAssociation.bulkCreate(associations, {
        ignoreDuplicates: true, // Prevent duplicate associations
      });

      // Return updated payment with medical bills
      const updatedPayment = await MedicalBillPayments.findOne({
        where: { id, userId },
        include: [{
          model: MedicalBill,
          as: 'medicalBills',
          include: ['medicalProvider'],
        }],
      });

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Medical bills added to payment successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to add medical bills to payment',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-bill-payments/:id/medical-bills/:billId
 * Remove a medical bill from a payment
 */
router.delete('/:id/medical-bills/:billId',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid payment ID'),
    param('billId')
      .isUUID()
      .withMessage('Invalid medical bill ID'),
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

      const { id, billId } = req.params;
      const userId = (req as AuthenticatedRequest).userId;

      // Check if payment exists and belongs to user
      const payment = await MedicalBillPayments.findOne({
        where: { id, userId },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Medical bill payment not found',
        } as ApiResponse);
        return;
      }

      // Check if medical bill exists and belongs to user
      const medicalBill = await MedicalBill.findOne({
        where: { id: billId, userId },
      });

      if (!medicalBill) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
        } as ApiResponse);
        return;
      }

      // Remove association
      await MedicalBillPaymentAssociation.destroy({
        where: {
          medicalBillId: billId,
          medicalBillPaymentId: id,
        },
      });

      res.json({
        success: true,
        message: 'Medical bill removed from payment successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to remove medical bill from payment',
      } as ApiResponse);
    }
  }
);

export default router;