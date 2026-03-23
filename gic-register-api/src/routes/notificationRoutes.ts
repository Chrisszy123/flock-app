import { Router } from 'express';
import { notificationController } from '../controllers';
import {
  authenticate,
  requireAdmin,
  validateBody,
  validateQuery,
} from '../middleware';
import { createNotificationSchema, paginationSchema } from '../validators';

const router = Router();

router.use(authenticate);

// Admin only
router.post('/', requireAdmin, validateBody(createNotificationSchema), notificationController.createNotification);
router.get('/', requireAdmin, validateQuery(paginationSchema), notificationController.getNotifications);
router.get('/recent', notificationController.getRecentNotifications);

export { router as notificationRoutes };
