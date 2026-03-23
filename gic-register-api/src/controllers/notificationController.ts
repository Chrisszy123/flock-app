import { Response, NextFunction } from 'express';
import { notificationService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

// WebSocket broadcast function — injected from server.ts at startup
let broadcastFn: ((data: any) => void) | null = null;

export function setBroadcastFunction(fn: (data: any) => void) {
  broadcastFn = fn;
}

export const notificationController = {
  async createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const notification = await notificationService.createNotification({
        ...req.body,
        createdById: req.user.userId,
      });

      // Broadcast via WebSocket if available
      if (broadcastFn) {
        broadcastFn({
          type: 'ADMIN_NOTIFICATION',
          payload: notification,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotifications(page, limit);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getRecentNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const notifications = await notificationService.getRecentNotifications(limit);
      res.status(200).json({ success: true, data: notifications } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },
};
