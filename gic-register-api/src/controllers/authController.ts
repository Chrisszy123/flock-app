import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { config } from '../config';

export const authController = {
  /**
   * POST /api/auth/register
   * Registers a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Authenticates a user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   * Refreshes the access token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token required',
        };
        res.status(401).json(response);
        return;
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken: tokens.accessToken,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Logs out the current user
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout-all
   * Logs out from all devices
   */
  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
        };
        res.status(401).json(response);
        return;
      }

      await authService.logoutAll(req.user.userId);

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Logged out from all devices',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Gets current user profile
   */
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getCurrentUser(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
