import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';
import { isAppError, isOperationalError, AppError } from '../shared/errors/AppError.js';
import { logger } from '../infrastructure/logger/pino.logger.js';

/**
 * Custom error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized responses
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  // Determine status code
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  let errorDetails: Array<{ field: string; message: string }> | undefined;

  if (isAppError(err)) {
    statusCode = err.statusCode;
    errorCode = err.code;
    errorMessage = err.message;
    
    if ('details' in err && Array.isArray(err.details)) {
      errorDetails = err.details;
    }
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma errors
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      statusCode = HTTP_STATUS.CONFLICT;
      errorCode = 'DUPLICATE_ENTRY';
      const field = prismaError.meta?.target?.[0] || 'field';
      errorMessage = `A record with this ${field} already exists`;
    } else if (prismaError.code === 'P2025') {
      statusCode = HTTP_STATUS.NOT_FOUND;
      errorCode = 'NOT_FOUND';
      errorMessage = 'Record not found';
    } else if (prismaError.code === 'P2003') {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      errorCode = 'FOREIGN_KEY_VIOLATION';
      errorMessage = 'Referenced record does not exist';
    }
  } else if (err.name === 'ZodError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = 'Validation failed';
  }

  // Log error
  const logData = {
    requestId,
    error: {
      code: errorCode,
      message: err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      body: env.NODE_ENV === 'development' ? req.body : undefined,
    },
    isOperational: isOperationalError(err),
  };

  if (statusCode >= 500) {
    logger.error(logData, 'Server error');
  } else if (statusCode >= 400) {
    logger.warn(logData, 'Client error');
  }

  // Send response
  const response: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      ...(errorDetails && { details: errorDetails }),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development' && err.stack) {
    Object.assign(response.error, { stack: err.stack.split('\n') });
  }

  res.status(statusCode).json(response);
}

/**
 * Handle uncaught exceptions
 */
export function setupUncaughtExceptionHandlers(): void {
  process.on('uncaughtException', (err: Error) => {
    logger.fatal({
      error: err.message,
      stack: err.stack,
    }, 'Uncaught exception');
    
    // Give time for logs to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.fatal({
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    }, 'Unhandled promise rejection');
    
    // Give time for logs to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}
