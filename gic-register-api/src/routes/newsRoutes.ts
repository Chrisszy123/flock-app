import { Router } from 'express';
import { contentController } from '../controllers';
import {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireDirectorateOrAdmin,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  createNewsPostSchema,
  updateNewsPostSchema,
  paginationSchema,
} from '../validators';

const router = Router();

// Public feed uses optional auth to determine visibility
router.get('/', optionalAuth, validateQuery(paginationSchema), contentController.getNewsFeed);
router.get('/:id', optionalAuth, contentController.getNewsPost);

// Admin/Directorate can create and manage news
router.post('/', authenticate, requireDirectorateOrAdmin, validateBody(createNewsPostSchema), contentController.createNewsPost);
router.patch('/:id', authenticate, requireDirectorateOrAdmin, validateBody(updateNewsPostSchema), contentController.updateNewsPost);
router.delete('/:id', authenticate, requireAdmin, contentController.deleteNewsPost);

export { router as newsRoutes };
