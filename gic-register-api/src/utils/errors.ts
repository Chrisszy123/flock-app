/**
 * Custom application error class for typed error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined error types for common scenarios
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code?: string) {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', code?: string) {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class GeofenceError extends AppError {
  public readonly distance: number;
  public readonly allowedRadius: number;

  constructor(distance: number, allowedRadius: number) {
    super(
      `You are ${Math.round(distance)}m away from the location. Must be within ${allowedRadius}m to check in.`,
      400,
      'GEOFENCE_VIOLATION'
    );
    this.distance = distance;
    this.allowedRadius = allowedRadius;
  }
}

export class DuplicateCheckInError extends AppError {
  constructor(eventName?: string) {
    super(
      eventName
        ? `You have already checked in to "${eventName}" today.`
        : 'You have already checked in today.',
      400,
      'DUPLICATE_CHECKIN'
    );
  }
}
