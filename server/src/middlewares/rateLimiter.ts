import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { Request, Response } from 'express';

const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT',
      });
    },
  });

// General API limiter
export const globalLimiter = createLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.NODE_ENV === 'development' ? 10000 : env.RATE_LIMIT_MAX,
  'Too many requests. Please try again later.',
);

// Strict limiter for auth endpoints
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  env.NODE_ENV === 'development' ? 1000 : 10,
  'Too many authentication attempts. Please wait 15 minutes.',
);

// AI endpoints limiter
export const aiLimiter = createLimiter(
  60 * 1000, // 1 minute
  20,
  'AI rate limit exceeded. Please wait before sending more requests.',
);

// Upload limiter
export const uploadLimiter = createLimiter(
  60 * 1000,
  10,
  'Upload limit exceeded. Maximum 10 uploads per minute.',
);
