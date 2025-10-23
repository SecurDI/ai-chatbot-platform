/**
 * Custom error classes for consistent error handling
 * Provides structured error responses
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

/**
 * Validation error (400) with field details
 */
export class ValidationError extends AppError {
  public fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400);
    this.fields = fields;
  }
}

/**
 * Check if error is an operational error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: Error): {
  success: false;
  error: string;
  statusCode: number;
  fields?: Record<string, string>;
} {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      fields: error.fields,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  // Unknown error - don't expose details in production
  return {
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error.message,
    statusCode: 500,
  };
}
