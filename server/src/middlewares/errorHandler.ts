import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import logger from '../utils/logger';

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
  errors?: { field: string; message: string }[];
}

// Handle Prisma errors
function handlePrismaError(err: any): AppError {
  switch (err.code) {
    case 'P2002':
      return AppError.conflict(`Duplicate value for: ${err.meta?.target?.join(', ')}`);
    case 'P2025':
      return AppError.notFound('Record');
    case 'P2003':
      return AppError.badRequest('Related record not found');
    case 'P2014':
      return AppError.badRequest('Invalid relation');
    default:
      return AppError.internal('Database error');
  }
}

// Handle JWT errors
function handleJwtError(): AppError {
  return AppError.unauthorized('Invalid token. Please log in again.');
}

function handleJwtExpiredError(): AppError {
  return AppError.unauthorized('Token expired. Please log in again.');
}

// Handle Mongoose validation errors
function handleMongoValidationError(err: any): AppError {
  const errors = Object.values(err.errors).map((e: any) => e.message);
  return AppError.badRequest(`Validation error: ${errors.join('. ')}`);
}

// Handle Mongoose duplicate key errors
function handleMongoDuplicateKeyError(err: any): AppError {
  const key = Object.keys(err.keyValue)[0];
  return AppError.conflict(`Duplicate value for ${key}`);
}

// Send error response
function sendError(err: ExtendedError & { errors?: any }, req: Request, res: Response): void {
  const isDev = env.NODE_ENV === 'development';

  if (err.isOperational) {
    res.status(err.statusCode ?? 500).json({
      success: false,
      status: err.status ?? 'error',
      message: err.message,
      ...(err.code && { code: err.code }),
      ...(err.errors && { errors: err.errors }),
      ...(isDev && { stack: err.stack }),
      timestamp: new Date().toISOString(),
    });
  } else {
    // Unknown programming error: hide details in production
    logger.error('UNHANDLED ERROR:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      status: 'error',
      message: isDev ? err.message : 'Something went wrong. Please try again.',
      ...(isDev && { stack: err.stack }),
      timestamp: new Date().toISOString(),
    });
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  let error = { ...err } as ExtendedError;
  error.message = err.message;
  error.stack = err.stack;

  // Prisma errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJwtError();
  if (err.name === 'TokenExpiredError') error = handleJwtExpiredError();

  // Mongoose errors
  if (err.name === 'ValidationError') error = handleMongoValidationError(err);
  if (err.code === 11000) error = handleMongoDuplicateKeyError(err);

  // Multer errors
  if (err.name === 'MulterError') {
    error = AppError.badRequest(`File upload error: ${err.message}`);
  }

  sendError(error as any, req, res);
};
