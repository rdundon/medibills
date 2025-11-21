import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalBill, MedicalServiceEvent, MedicalBillServiceEvent } from '../models';
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
      include: ['medicalProvider', 'serviceEvents'],
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
        include: ['medicalProvider', 'serviceEvents'],
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

/**
 * POST /medical-bills/:id/service-events
 * Add service events to a medical bill
 */
router.post('/:id/service-events',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid bill ID'),
    body('serviceEventIds')
      .isArray()
      .withMessage('Service event IDs must be an array'),
    body('serviceEventIds.*')
      .isUUID()
      .withMessage('Each service event ID must be a valid UUID'),
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
      const { serviceEventIds } = req.body;
      const userId = (req as AuthenticatedRequest).userId;

      // Check if bill exists and belongs to user
      const bill = await MedicalBill.findOne({
        where: { id, userId },
      });

      if (!bill) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
        } as ApiResponse);
        return;
      }

      // Check if service events exist and belong to user
      const serviceEvents = await MedicalServiceEvent.findAll({
        where: {
          id: serviceEventIds,
          userId,
        },
      });

      if (serviceEvents.length !== serviceEventIds.length) {
        res.status(400).json({
          success: false,
          error: 'One or more service events not found or do not belong to user',
        } as ApiResponse);
        return;
      }

      // Add associations
      const associations = serviceEventIds.map((serviceEventId: string) => ({
        medicalBillId: id,
        medicalServiceEventId: serviceEventId,
      }));
      await MedicalBillServiceEvent.bulkCreate(associations, {
        ignoreDuplicates: true, // Prevent duplicate associations
      });

      // Return updated bill with service events
      const updatedBill = await MedicalBill.findOne({
        where: { id, userId },
        include: ['medicalProvider', 'serviceEvents'],
      });

      res.json({
        success: true,
        data: updatedBill,
        message: 'Service events added to medical bill successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to add service events to medical bill',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-bills/:id/service-events/:serviceEventId
 * Remove a service event from a medical bill
 */
router.delete('/:id/service-events/:serviceEventId',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid bill ID'),
    param('serviceEventId')
      .isUUID()
      .withMessage('Invalid service event ID'),
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

      const { id, serviceEventId } = req.params;
      const userId = (req as AuthenticatedRequest).userId;

      // Check if bill exists and belongs to user
      const bill = await MedicalBill.findOne({
        where: { id, userId },
      });

      if (!bill) {
        res.status(404).json({
          success: false,
          error: 'Medical bill not found',
        } as ApiResponse);
        return;
      }

      // Check if service event exists and belongs to user
      const serviceEvent = await MedicalServiceEvent.findOne({
        where: { id: serviceEventId, userId },
      });

      if (!serviceEvent) {
        res.status(404).json({
          success: false,
          error: 'Service event not found',
        } as ApiResponse);
        return;
      }

      // Remove association
      await MedicalBillServiceEvent.destroy({
        where: {
          medicalBillId: id,
          medicalServiceEventId: serviceEventId,
        },
      });

      res.json({
        success: true,
        message: 'Service event removed from medical bill successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to remove service event from medical bill',
      } as ApiResponse);
    }
  }
);

export default router;