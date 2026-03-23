import { Router } from 'express';
import { churchLocationController } from '../controllers';
import { authenticate, requireAdmin, validateBody } from '../middleware';
import {
  createChurchLocationSchema,
  updateChurchLocationSchema,
} from '../validators';

const router = Router();

// Public route for default location (needed for check-in)
router.get('/default', churchLocationController.getDefaultLocation);

// Protected routes
router.use(authenticate);

// All authenticated users can view locations
router.get('/', churchLocationController.getLocations);
router.get('/:id', churchLocationController.getLocationById);

// Admin only routes
router.post(
  '/',
  requireAdmin,
  validateBody(createChurchLocationSchema),
  churchLocationController.createLocation
);
router.patch(
  '/:id',
  requireAdmin,
  validateBody(updateChurchLocationSchema),
  churchLocationController.updateLocation
);
router.delete('/:id', requireAdmin, churchLocationController.deleteLocation);

export { router as churchLocationRoutes };
