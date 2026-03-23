import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const attendanceController = {
  /**
   * POST /api/attendance/check-in
   * Checks in the current user (geofence enforced)
   */
  async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await attendanceService.checkIn(req.user.userId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Check-in successful',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/can-check-in
   * Checks if user can check in (UI helper, not enforcement)
   */
  async canCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { latitude, longitude, eventId } = req.query;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
        return;
      }

      const result = await attendanceService.canCheckIn(
        req.user.userId,
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        eventId as string | undefined
      );

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
   * GET /api/attendance/my-history
   * Gets current user's attendance history
   */
  async getMyHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await attendanceService.getUserAttendance(
        req.user.userId,
        page,
        limit
      );

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
   * GET /api/attendance/last-check-in
   * Gets user's last check-in
   */
  async getLastCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const lastCheckIn = await attendanceService.getLastCheckIn(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: lastCheckIn,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance
   * Gets attendance records with filters (admin/leader only)
   */
  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getAttendance(req.query as any);

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
   * GET /api/attendance/user/:userId
   * Gets attendance history for a specific user (admin/leader only)
   */
  async getUserAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await attendanceService.getUserAttendance(
        req.params.userId,
        page,
        limit
      );

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
   * GET /api/attendance/event/:eventId
   * Gets attendance for a specific event (admin/leader only)
   */
  async getEventAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;

      const result = await attendanceService.getEventAttendance(
        req.params.eventId,
        page,
        limit
      );

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
   * GET /api/attendance/recent
   * Gets recent check-ins (admin/leader only)
   */
  async getRecentCheckIns(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recent = await attendanceService.getRecentCheckIns(limit);

      const response: ApiResponse = {
        success: true,
        data: recent,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
