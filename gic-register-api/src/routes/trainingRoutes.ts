import { Router } from 'express';
import { trainingController } from '../controllers';
import {
  authenticate,
  requireLeaderOrAbove,
  requireDirectorateOrAdmin,
  requireWorkerOrAbove,
  validateBody,
} from '../middleware';
import {
  createTrainingModuleSchema,
  updateTrainingModuleSchema,
  updateTrainingProgressSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Worker dashboard (workers and above)
router.get('/dashboard', requireWorkerOrAbove, trainingController.getMyDashboard);
router.patch(
  '/progress/:moduleId',
  requireWorkerOrAbove,
  validateBody(updateTrainingProgressSchema),
  trainingController.updateMyProgress
);

// Module management (directorate/admin)
router.get('/modules', trainingController.getModules);
router.get('/modules/:id', trainingController.getModuleById);
router.post(
  '/modules',
  requireDirectorateOrAdmin,
  validateBody(createTrainingModuleSchema),
  trainingController.createModule
);
router.patch(
  '/modules/:id',
  requireDirectorateOrAdmin,
  validateBody(updateTrainingModuleSchema),
  trainingController.updateModule
);
router.delete('/modules/:id', requireDirectorateOrAdmin, trainingController.deleteModule);

// Worker progress management (leader and above)
router.get('/workers/:workerId/progress', requireLeaderOrAbove, trainingController.getWorkerProgress);
router.patch(
  '/workers/:workerId/progress/:moduleId',
  requireLeaderOrAbove,
  validateBody(updateTrainingProgressSchema),
  trainingController.updateWorkerProgress
);
router.get('/workers/:workerId/certification', requireLeaderOrAbove, trainingController.checkCertification);

export { router as trainingRoutes };
