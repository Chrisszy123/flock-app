import { Request, Response, NextFunction } from 'express';
import { trainingService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const trainingController = {
  // Training Module Management (Admin/Leader)

  /**
   * POST /api/training/modules
   * Creates a new training module (admin/leader only)
   */
  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const module = await trainingService.createModule(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Training module created successfully',
        data: module,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/training/modules
   * Gets all training modules
   */
  async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await trainingService.getAllModules();

      const response: ApiResponse = {
        success: true,
        data: modules,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/training/modules/:id
   * Gets a training module by ID
   */
  async getModuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const module = await trainingService.getModuleById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: module,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/training/modules/:id
   * Updates a training module (admin/leader only)
   */
  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const module = await trainingService.updateModule(req.params.id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Training module updated successfully',
        data: module,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/training/modules/:id
   * Deletes a training module (admin/leader only)
   */
  async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      await trainingService.deleteModule(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Training module deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Worker Training Progress

  /**
   * GET /api/training/dashboard
   * Gets current worker's training dashboard
   */
  async getMyDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const dashboard = await trainingService.getWorkerDashboard(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: dashboard,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/training/progress/:moduleId
   * Updates training progress for current user
   */
  async updateMyProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const progress = await trainingService.updateProgress(
        req.user.userId,
        req.params.moduleId,
        req.body.completed,
        req.user.userId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Training progress updated',
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/training/workers/:workerId/progress
   * Gets a worker's training progress (leader/admin only)
   */
  async getWorkerProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await trainingService.getWorkerProgress(req.params.workerId);

      const response: ApiResponse = {
        success: true,
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/training/workers/:workerId/progress/:moduleId
   * Updates a worker's training progress (leader/admin only)
   */
  async updateWorkerProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await trainingService.updateProgress(
        req.params.workerId,
        req.params.moduleId,
        req.body.completed
      );

      const response: ApiResponse = {
        success: true,
        message: 'Worker training progress updated',
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/training/workers/:workerId/certification
   * Checks if worker has completed mandatory training (leader/admin only)
   */
  async checkCertification(req: Request, res: Response, next: NextFunction) {
    try {
      const certified = await trainingService.hasMandatoryCertification(
        req.params.workerId
      );

      const response: ApiResponse = {
        success: true,
        data: { certified },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
