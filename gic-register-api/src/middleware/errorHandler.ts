import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils';
import { config } from '../config';
import { ApiResponse } from '../types';

/**
 * Global error handling middleware
 * Catches all errors and returns consistent API responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (config.isDevelopment) {
    console.error('Error:', error);
  }

  // Handle known application errors
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      error: error.code,
    };

    // Include validation errors if present
    if (error instanceof ValidationError) {
      response.errors = error.errors;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const field = prismaError.meta?.target?.[0] || 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
        error: 'DUPLICATE_ENTRY',
      } as ApiResponse);
      return;
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      res.status(404).json({
        success: false,
        message: 'Record not found',
        error: 'NOT_FOUND',
      } as ApiResponse);
      return;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN',
    } as ApiResponse);
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: config.isProduction
      ? 'An unexpected error occurred'
      : error.message,
    error: 'INTERNAL_SERVER_ERROR',
  } as ApiResponse);
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: 'NOT_FOUND',
  } as ApiResponse);
}
