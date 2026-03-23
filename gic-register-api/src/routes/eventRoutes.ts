import { Router } from 'express';
import { eventController } from '../controllers';
import {
  authenticate,
  requireDirectorateOrAdmin,
  requireLeaderOrAbove,
  validateBody,
  validateQuery,
} from '../middleware';
import { createEventSchema, updateEventSchema, paginationSchema } from '../validators';

const router = Router();

// Public routes
router.get('/upcoming', eventController.getUpcomingEvents);

// Protected routes
router.use(authenticate);

router.get('/', validateQuery(paginationSchema), eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Admin + Directorate can create/edit/delete events
router.post('/', requireDirectorateOrAdmin, validateBody(createEventSchema), eventController.createEvent);
router.get('/:id/attendance', requireLeaderOrAbove, eventController.getEventWithAttendance);
router.patch('/:id', requireDirectorateOrAdmin, validateBody(updateEventSchema), eventController.updateEvent);
router.delete('/:id', requireDirectorateOrAdmin, eventController.deleteEvent);

export { router as eventRoutes };
