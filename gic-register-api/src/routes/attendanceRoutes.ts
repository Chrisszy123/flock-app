import { Router } from 'express';
import { attendanceController } from '../controllers';
import {
  authenticate,
  requireLeaderOrAbove,
  validateBody,
  validateQuery,
} from '../middleware';
import { checkInSchema, attendanceQuerySchema, paginationSchema } from '../validators';

const router = Router();

router.use(authenticate);

// Any authenticated user can check in
router.post('/check-in', validateBody(checkInSchema), attendanceController.checkIn);
router.get('/can-check-in', attendanceController.canCheckIn);
router.get('/my-history', validateQuery(paginationSchema), attendanceController.getMyHistory);
router.get('/last-check-in', attendanceController.getLastCheckIn);

// Leader/Directorate/Admin routes
router.get('/', requireLeaderOrAbove, validateQuery(attendanceQuerySchema), attendanceController.getAttendance);
router.get('/recent', requireLeaderOrAbove, attendanceController.getRecentCheckIns);
router.get('/user/:userId', requireLeaderOrAbove, validateQuery(paginationSchema), attendanceController.getUserAttendance);
router.get('/event/:eventId', requireLeaderOrAbove, validateQuery(paginationSchema), attendanceController.getEventAttendance);

export { router as attendanceRoutes };
