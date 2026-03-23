import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const contentController = {
  // ─── NEWS POSTS ───────────────────────────────────────────────────────

  async createNewsPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const post = await contentService.createNewsPost({
        ...req.body,
        createdById: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: 'News post created successfully',
        data: post,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getNewsFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userRole = req.user?.role || 'MEMBER';

      const result = await contentService.getNewsFeed(userRole, page, limit);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getNewsPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userRole = req.user?.role || 'MEMBER';
      const post = await contentService.getNewsPost(req.params.id, userRole);
      res.status(200).json({ success: true, data: post } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async updateNewsPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const post = await contentService.updateNewsPost(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'News post updated successfully',
        data: post,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async deleteNewsPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await contentService.deleteNewsPost(req.params.id);
      res.status(200).json({
        success: true,
        message: 'News post deleted successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  // ─── RESOURCES ────────────────────────────────────────────────────────

  async createResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const resource = await contentService.createResource(req.body);

      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: resource,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as any;

      const result = await contentService.getResources(page, limit, type);
      res.status(200).json({ success: true, data: result } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async getResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await contentService.getResource(req.params.id);
      res.status(200).json({ success: true, data: resource } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async updateResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const resource = await contentService.updateResource(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Resource updated successfully',
        data: resource,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },

  async deleteResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await contentService.deleteResource(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  },
};
