import { Response, NextFunction } from 'express';
import { financeService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const financeController = {
  async submitOffering(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const offering = await financeService.submitTitheOffering(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Tithe/offering submitted successfully',
        data: offering,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getMyOfferings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await financeService.getMyOfferings(req.user.userId, page, limit);

      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getAllOfferings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const method = req.query.method as any;
      const status = req.query.status as any;

      const result = await financeService.getAllOfferings(page, limit, method, status);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const offering = await financeService.confirmPayment(
        req.params.id,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: offering,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const stats = await financeService.getStats(startDate, endDate);
      res.status(200).json({ success: true, data: stats } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },
};
