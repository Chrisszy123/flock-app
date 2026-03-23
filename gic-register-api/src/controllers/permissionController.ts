import { Response, NextFunction } from 'express';
import { permissionService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const permissionController = {
  async submitRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const request = await permissionService.submitRequest(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Permission request submitted successfully',
        data: request,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await permissionService.getMyRequests(req.user.userId, page, limit);

      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const request = await permissionService.getRequest(req.params.id);
      res.status(200).json({ success: true, data: request } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getPendingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await permissionService.getPendingRequests(
        {
          role: req.user.role,
          directorateId: req.user.directorateId,
          unitId: req.user.unitId,
        },
        page,
        limit
      );

      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getAllRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as any;

      const result = await permissionService.getAllRequests(page, limit, status);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async decideRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await permissionService.decideRequest(
        req.params.id,
        req.body,
        {
          userId: req.user.userId,
          role: req.user.role,
          directorateId: req.user.directorateId,
          unitId: req.user.unitId,
        }
      );

      res.status(200).json({
        success: true,
        message: `Permission request ${req.body.status.toLowerCase()}`,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },
};
