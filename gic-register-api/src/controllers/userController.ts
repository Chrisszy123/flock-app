import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const userController = {
  /**
   * GET /api/users/profile
   * Gets current user's profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await userService.getUserById(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/users/profile
   * Updates current user's profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await userService.updateProfile(req.user.userId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users/:id
   * Gets a user by ID (admin only)
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users
   * Searches/lists members with pagination (admin only)
   */
  async searchMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.searchMembers(req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/users/:id/role
   * Updates a user's role (admin only)
   */
  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await userService.updateUserRole(
        req.params.id,
        req.body.role,
        req.user.userId
      );

      const response: ApiResponse = {
        success: true,
        message: 'User role updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/users/:id/worker-status
   * Updates worker status (leader/admin only)
   */
  async updateWorkerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateWorkerStatus(
        req.params.id,
        req.body.workerStatus
      );

      const response: ApiResponse = {
        success: true,
        message: 'Worker status updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users/workers
   * Gets list of workers with training progress (leader/admin only)
   */
  async getWorkers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userService.getWorkers(page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users/workers/:id
   * Gets a worker's detailed profile (leader/admin only)
   */
  async getWorkerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const worker = await userService.getWorkerProfile(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: worker,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/users/:id
   * Deletes a user (admin only)
   */
  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      await userService.deleteUser(req.params.id, req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
