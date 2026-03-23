import { Request, Response, NextFunction } from 'express';
import { workforceService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const workforceController = {
  // ─── DIRECTORATE ──────────────────────────────────────────────────────

  async createDirectorate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const directorate = await workforceService.createDirectorate(
        req.body.name,
        req.body.description
      );
      res.status(201).json({
        success: true,
        message: 'Directorate created successfully',
        data: directorate,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getDirectorates(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await workforceService.getDirectorates(page, limit);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getDirectorate(req: Request, res: Response, next: NextFunction) {
    try {
      const directorate = await workforceService.getDirectorate(req.params.id);
      res.status(200).json({ success: true, data: directorate } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async updateDirectorate(req: Request, res: Response, next: NextFunction) {
    try {
      const directorate = await workforceService.updateDirectorate(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Directorate updated successfully',
        data: directorate,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async deleteDirectorate(req: Request, res: Response, next: NextFunction) {
    try {
      await workforceService.deleteDirectorate(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Directorate deleted successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  // ─── UNIT ─────────────────────────────────────────────────────────────

  async createUnit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const unit = await workforceService.createUnit(req.body.name, req.body.directorateId);
      res.status(201).json({
        success: true,
        message: 'Unit created successfully',
        data: unit,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const directorateId = req.query.directorateId as string | undefined;
      const result = await workforceService.getUnits(page, limit, directorateId);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const unit = await workforceService.getUnit(req.params.id);
      res.status(200).json({ success: true, data: unit } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const unit = await workforceService.updateUnit(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Unit updated successfully',
        data: unit,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      await workforceService.deleteUnit(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Unit deleted successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  // ─── WORKER MANAGEMENT ────────────────────────────────────────────────

  async assignWorker(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { directorateId, unitId } = req.body;

      if (directorateId !== undefined) {
        await workforceService.assignWorkerToDirectorate(userId, directorateId);
      }
      if (unitId !== undefined) {
        await workforceService.assignWorkerToUnit(userId, unitId);
      }

      res.status(200).json({
        success: true,
        message: 'Worker assignment updated successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async suspendWorker(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await workforceService.suspendWorker(
        req.params.userId,
        req.body.isSuspended,
        req.body.suspensionReason,
        {
          userId: req.user.userId,
          role: req.user.role,
          directorateId: req.user.directorateId,
        }
      );

      res.status(200).json({
        success: true,
        message: req.body.isSuspended ? 'Worker suspended' : 'Worker unsuspended',
        data: user,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getDirectorateWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // DIRECTORATE users see their own directorate, ADMIN can specify
      const directorateId = req.user.role === 'ADMIN'
        ? (req.query.directorateId as string) || req.user.directorateId
        : req.user.directorateId;

      if (!directorateId) {
        res.status(400).json({ success: false, message: 'No directorate specified' });
        return;
      }

      const result = await workforceService.getWorkersForDirectorate(directorateId, page, limit);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getUnitWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const unitId = req.user.role === 'ADMIN' || req.user.role === 'DIRECTORATE'
        ? (req.query.unitId as string) || req.user.unitId
        : req.user.unitId;

      if (!unitId) {
        res.status(400).json({ success: false, message: 'No unit specified' });
        return;
      }

      const result = await workforceService.getWorkersForUnit(unitId, page, limit);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async createWorkerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const data = {
        ...req.body,
        // DIRECTORATE users auto-assign to their directorate
        directorateId:
          req.user.role === 'DIRECTORATE'
            ? req.user.directorateId
            : req.body.directorateId,
        // LEADER users auto-assign to their unit
        unitId:
          req.user.role === 'LEADER'
            ? req.user.unitId
            : req.body.unitId,
      };

      const worker = await workforceService.createWorkerProfile(data);

      res.status(201).json({
        success: true,
        message: 'Worker profile created successfully',
        data: worker,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },
};
