import { Router } from 'express';
import { userController } from '../controllers';
import {
  authenticate,
  requireAdmin,
  requireLeaderOrAbove,
  requireDirectorateOrAdmin,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  updateProfileSchema,
  updateUserRoleSchema,
  updateWorkerStatusSchema,
  memberSearchSchema,
  paginationSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Current user routes
router.get('/profile', userController.getProfile);
router.patch('/profile', validateBody(updateProfileSchema), userController.updateProfile);

// Workers routes (leader/directorate/admin access)
router.get('/workers', requireLeaderOrAbove, validateQuery(paginationSchema), userController.getWorkers);
router.get('/workers/:id', requireLeaderOrAbove, userController.getWorkerProfile);

// Member management routes (admin only)
router.get('/', requireAdmin, validateQuery(memberSearchSchema), userController.searchMembers);
router.get('/:id', requireAdmin, userController.getUserById);
router.patch('/:id/role', requireAdmin, validateBody(updateUserRoleSchema), userController.updateUserRole);
router.patch('/:id/worker-status', requireDirectorateOrAdmin, validateBody(updateWorkerStatusSchema), userController.updateWorkerStatus);
router.delete('/:id', requireAdmin, userController.deleteUser);

export { router as userRoutes };
