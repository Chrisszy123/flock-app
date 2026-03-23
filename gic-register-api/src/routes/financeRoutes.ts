import { Router } from 'express';
import { financeController } from '../controllers';
import {
  authenticate,
  requireAdmin,
  requireMemberOrAbove,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  createTitheOfferingSchema,
  confirmTitheOfferingSchema,
  titheQuerySchema,
  paginationSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Any authenticated user can submit offerings
router.post('/', requireMemberOrAbove, validateBody(createTitheOfferingSchema), financeController.submitOffering);
router.get('/my', requireMemberOrAbove, validateQuery(paginationSchema), financeController.getMyOfferings);

// Admin only
router.get('/all', requireAdmin, validateQuery(titheQuerySchema), financeController.getAllOfferings);
router.patch('/:id/confirm', requireAdmin, validateBody(confirmTitheOfferingSchema), financeController.confirmPayment);
router.get('/stats', requireAdmin, financeController.getStats);

export { router as financeRoutes };
