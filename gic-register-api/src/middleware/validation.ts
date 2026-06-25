import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodTypeDef, ZodError } from 'zod';
import { ValidationError } from '../utils';

/**
 * Validation middleware factory for request body validation
 * @param schema - Zod schema to validate against
 */
export function validateBody<T>(schema: ZodType<T, ZodTypeDef, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validation middleware factory for query parameters
 * @param schema - Zod schema to validate against
 */
export function validateQuery<T>(schema: ZodType<T, ZodTypeDef, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Query validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validation middleware factory for URL parameters
 * @param schema - Zod schema to validate against
 */
export function validateParams<T>(schema: ZodType<T, ZodTypeDef, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Parameter validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}
