import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { AuditLog } from '../config/database/mongodb/models/System';
import logger from '../utils/logger';

interface AuditOptions {
  action: string;
  resource: string;
  getResourceId?: (req: AuthRequest) => string | undefined;
}

/**
 * Middleware that logs admin/user actions to MongoDB AuditLog after the response is sent.
 */
export const auditLog = (options: AuditOptions) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Listen to response finish event
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        await AuditLog.create({
          userId: req.user?.id,
          userEmail: req.user?.email,
          action: options.action,
          resource: options.resource,
          resourceId: options.getResourceId?.(req) ?? req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: sanitizeBody(req.body),
            query: req.query,
          },
          ipAddress: req.ip ?? req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode,
          duration,
        });
      } catch (err) {
        logger.error('Audit log error:', err);
      }
    });

    next();
  };
};

/**
 * Remove sensitive fields from body before logging
 */
function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {};
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'key', 'cvv'];
  const sanitized = { ...body };
  for (const key of sensitiveKeys) {
    if (key in sanitized) sanitized[key] = '[REDACTED]';
  }
  return sanitized;
}
