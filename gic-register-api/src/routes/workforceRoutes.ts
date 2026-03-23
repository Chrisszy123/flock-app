import { Router } from 'express';
import { workforceController } from '../controllers';
import {
  authenticate,
  requireAdmin,
  requireDirectorateOrAdmin,
  requireLeaderOrAbove,
  validateBody,
  validateQuery,
} from '../middleware';
import {
  createDirectorateSchema,
  updateDirectorateSchema,
  createUnitSchema,
  updateUnitSchema,
  assignWorkerSchema,
  suspendUserSchema,
  paginationSchema,
  registerSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// ─── DIRECTORATES ───────────────────────────────────────────────────────────
router.get('/directorates', validateQuery(paginationSchema), workforceController.getDirectorates);
router.get('/directorates/:id', workforceController.getDirectorate);
router.post('/directorates', requireAdmin, validateBody(createDirectorateSchema), workforceController.createDirectorate);
router.patch('/directorates/:id', requireAdmin, validateBody(updateDirectorateSchema), workforceController.updateDirectorate);
router.delete('/directorates/:id', requireAdmin, workforceController.deleteDirectorate);

// ─── UNITS ──────────────────────────────────────────────────────────────────
router.get('/units', validateQuery(paginationSchema), workforceController.getUnits);
router.get('/units/:id', workforceController.getUnit);
router.post('/units', requireDirectorateOrAdmin, validateBody(createUnitSchema), workforceController.createUnit);
router.patch('/units/:id', requireDirectorateOrAdmin, validateBody(updateUnitSchema), workforceController.updateUnit);
router.delete('/units/:id', requireDirectorateOrAdmin, workforceController.deleteUnit);

// ─── WORKER MANAGEMENT ─────────────────────────────────────────────────────
router.get('/directorate-workers', requireDirectorateOrAdmin, workforceController.getDirectorateWorkers);
router.get('/unit-workers', requireLeaderOrAbove, workforceController.getUnitWorkers);
router.patch('/workers/:userId/assign', requireDirectorateOrAdmin, validateBody(assignWorkerSchema), workforceController.assignWorker);
router.patch('/workers/:userId/suspend', requireLeaderOrAbove, validateBody(suspendUserSchema), workforceController.suspendWorker);
router.post('/workers', requireLeaderOrAbove, workforceController.createWorkerProfile);

export { router as workforceRoutes };
