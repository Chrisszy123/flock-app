import { Router } from 'express';
import { contentController } from '../controllers';
import {
  authenticate,
  requireAdmin,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  createResourceSchema,
  updateResourceSchema,
  paginationSchema,
} from '../validators';

const router = Router();

// Public access to resources listing and detail
router.get('/', validateQuery(paginationSchema), contentController.getResources);
router.get('/:id', contentController.getResource);

// Admin only management
router.post('/', authenticate, requireAdmin, validateBody(createResourceSchema), contentController.createResource);
router.patch('/:id', authenticate, requireAdmin, validateBody(updateResourceSchema), contentController.updateResource);
router.delete('/:id', authenticate, requireAdmin, contentController.deleteResource);

export { router as resourceRoutes };
