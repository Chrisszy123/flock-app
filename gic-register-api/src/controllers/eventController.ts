import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const eventController = {
  /**
   * POST /api/events
   * Creates a new event (admin/leader only)
   */
  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const event = await eventService.createEvent(req.body, req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Event created successfully',
        data: event,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/events
   * Gets all events with pagination
   */
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await eventService.getEvents(page, limit);

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
   * GET /api/events/upcoming
   * Gets upcoming events
   */
  async getUpcomingEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await eventService.getUpcomingEvents(limit);

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/events/:id
   * Gets an event by ID
   */
  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.getEventById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: event,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/events/:id/attendance
   * Gets event with full attendance list (admin/leader only)
   */
  async getEventWithAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.getEventWithAttendance(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: event,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/events/:id
   * Updates an event (admin/leader only)
   */
  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.updateEvent(req.params.id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Event updated successfully',
        data: event,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/events/:id
   * Deletes an event (admin/leader only)
   */
  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await eventService.deleteEvent(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Event deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
