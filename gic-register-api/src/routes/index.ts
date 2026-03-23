import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { attendanceRoutes } from './attendanceRoutes';
import { eventRoutes } from './eventRoutes';
import { trainingRoutes } from './trainingRoutes';
import { churchLocationRoutes } from './churchLocationRoutes';
import { workforceRoutes } from './workforceRoutes';
import { permissionRoutes } from './permissionRoutes';
import { financeRoutes } from './financeRoutes';
import { newsRoutes } from './newsRoutes';
import { resourceRoutes } from './resourceRoutes';
import { notificationRoutes } from './notificationRoutes';

const router = Router();

// Existing modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/events', eventRoutes);
router.use('/training', trainingRoutes);
router.use('/locations', churchLocationRoutes);

// New modules
router.use('/workforce', workforceRoutes);
router.use('/permissions', permissionRoutes);
router.use('/finance', financeRoutes);
router.use('/news', newsRoutes);
router.use('/resources', resourceRoutes);
router.use('/notifications', notificationRoutes);

export { router as apiRoutes };
