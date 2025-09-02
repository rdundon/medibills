import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MedicalServiceEvent } from '../models/MedicalServiceEvent';
import { MedicalBill } from '../models/MedicalBill';
import { ExplanationOfBenefits } from '../models/ExplanationOfBenefits';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /medical-service-events
 * Get all medical service events for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await MedicalServiceEvent.findAll({
      where: { userId: (req as AuthenticatedRequest).userId },
      include: ['medicalProvider', 'medicalBill', 'explanationOfBenefits'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: events,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical service events',
    } as ApiResponse);
  }
});

/**
 * GET /medical-service-events/:id
 * Get a specific medical service event
 */
router.get('/:id',
  requireAuth,
  [
    param('id')
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

      const { id } = req.params;
      const event = await MedicalServiceEvent.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider', 'medicalBill', 'explanationOfBenefits'],
      });

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Medical service event not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: event,
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch medical service event',
      } as ApiResponse);
    }
  }
);

/**
 * POST /medical-service-events
 * Create a new medical service event
 */
router.post('/',
  requireAuth,
  [
    body('medicalProviderId')
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('medicalBillId')
      .optional()
      .isUUID()
      .withMessage('Medical bill ID must be a valid UUID'),
    body('explanationOfBenefitsId')
      .optional()
      .isUUID()
      .withMessage('Explanation of benefits ID must be a valid UUID'),
    body('dateOfService')
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
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

      const { medicalProviderId, medicalBillId, explanationOfBenefitsId, dateOfService, description, amount } = req.body;

      // Verify ownership of related entities if provided
      if (medicalBillId) {
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
      }

      if (explanationOfBenefitsId) {
        const eob = await ExplanationOfBenefits.findOne({
          where: { id: explanationOfBenefitsId, userId: (req as AuthenticatedRequest).userId },
        });
        if (!eob) {
          res.status(404).json({
            success: false,
            error: 'Explanation of benefits not found or access denied',
          } as ApiResponse);
          return;
        }
      }

      const event = await MedicalServiceEvent.create({
        userId: (req as AuthenticatedRequest).userId,
        medicalProviderId,
        medicalBillId,
        explanationOfBenefitsId,
        dateOfService,
        description,
        amount,
      });

      const eventWithRelations = await MedicalServiceEvent.findOne({
        where: { id: event.id },
        include: ['medicalProvider', 'medicalBill', 'explanationOfBenefits'],
      });

      res.status(201).json({
        success: true,
        data: eventWithRelations,
        message: 'Medical service event created successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medical service event',
      } as ApiResponse);
    }
  }
);

/**
 * PUT /medical-service-events/:id
 * Update a medical service event
 */
router.put('/:id',
  requireAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid service event ID'),
    body('medicalProviderId')
      .optional()
      .isUUID()
      .withMessage('Medical provider ID must be a valid UUID'),
    body('medicalBillId')
      .optional()
      .isUUID()
      .withMessage('Medical bill ID must be a valid UUID'),
    body('explanationOfBenefitsId')
      .optional()
      .isUUID()
      .withMessage('Explanation of benefits ID must be a valid UUID'),
    body('dateOfService')
      .optional()
      .isISO8601()
      .withMessage('Date of service must be a valid date'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
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
      const { medicalProviderId, medicalBillId, explanationOfBenefitsId, dateOfService, description, amount } = req.body;

      // Verify ownership of related entities if provided
      if (medicalBillId) {
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
      }

      if (explanationOfBenefitsId) {
        const eob = await ExplanationOfBenefits.findOne({
          where: { id: explanationOfBenefitsId, userId: (req as AuthenticatedRequest).userId },
        });
        if (!eob) {
          res.status(404).json({
            success: false,
            error: 'Explanation of benefits not found or access denied',
          } as ApiResponse);
          return;
        }
      }

      const [updatedRowsCount] = await MedicalServiceEvent.update(
        { medicalProviderId, medicalBillId, explanationOfBenefitsId, dateOfService, description, amount },
        { where: { id, userId: (req as AuthenticatedRequest).userId } }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical service event not found',
        } as ApiResponse);
        return;
      }

      const updatedEvent = await MedicalServiceEvent.findOne({
        where: { id, userId: (req as AuthenticatedRequest).userId },
        include: ['medicalProvider', 'medicalBill', 'explanationOfBenefits'],
      });

      res.json({
        success: true,
        data: updatedEvent,
        message: 'Medical service event updated successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medical service event',
      } as ApiResponse);
    }
  }
);

/**
 * DELETE /medical-service-events/:id
 * Delete a medical service event
 */
router.delete('/:id',
  requireAuth,
  [
    param('id')
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

      const { id } = req.params;
      const deletedRowsCount = await MedicalServiceEvent.destroy({
        where: { id, userId: (req as AuthenticatedRequest).userId },
      });

      if (deletedRowsCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Medical service event not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Medical service event deleted successfully',
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete medical service event',
      } as ApiResponse);
    }
  }
);

export default router;