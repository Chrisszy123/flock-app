import { Request, Response, NextFunction } from 'express';
import { churchLocationService } from '../services';
import { ApiResponse } from '../types';

export const churchLocationController = {
  /**
   * POST /api/locations
   * Creates a new church location (admin only)
   */
  async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await churchLocationService.createLocation(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Church location created successfully',
        data: location,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/locations
   * Gets all church locations
   */
  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await churchLocationService.getAllLocations();

      const response: ApiResponse = {
        success: true,
        data: locations,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/locations/default
   * Gets the default church location
   */
  async getDefaultLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await churchLocationService.getDefaultLocation();

      const response: ApiResponse = {
        success: true,
        data: location,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/locations/:id
   * Gets a church location by ID
   */
  async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await churchLocationService.getLocationById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: location,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/locations/:id
   * Updates a church location (admin only)
   */
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await churchLocationService.updateLocation(
        req.params.id,
        req.body
      );

      const response: ApiResponse = {
        success: true,
        message: 'Church location updated successfully',
        data: location,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/locations/:id
   * Deletes a church location (admin only)
   */
  async deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
      await churchLocationService.deleteLocation(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Church location deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
