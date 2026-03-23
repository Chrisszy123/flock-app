import { Router } from 'express';
import { permissionController } from '../controllers';
import {
  authenticate,
  requireWorkerOrAbove,
  requireLeaderOrAbove,
  requireAdmin,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  createPermissionRequestSchema,
  decidePermissionRequestSchema,
  paginationSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Worker endpoints
router.post('/', requireWorkerOrAbove, validateBody(createPermissionRequestSchema), permissionController.submitRequest);
router.get('/my', requireWorkerOrAbove, validateQuery(paginationSchema), permissionController.getMyRequests);

// Leader/Directorate/Admin can view pending and decide
router.get('/pending', requireLeaderOrAbove, validateQuery(paginationSchema), permissionController.getPendingRequests);
router.get('/all', requireAdmin, permissionController.getAllRequests);
router.get('/:id', requireWorkerOrAbove, permissionController.getRequest);
router.patch('/:id/decide', requireLeaderOrAbove, validateBody(decidePermissionRequestSchema), permissionController.decideRequest);

export { router as permissionRoutes };
