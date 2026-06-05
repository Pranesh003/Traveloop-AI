import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AuthRequest } from './authenticate';

/**
 * RBAC authorization middleware.
 * Checks if authenticated user has ALL required roles OR has required permissions.
 *
 * Usage:
 *   authorize({ roles: ['SUPER_ADMIN'] })
 *   authorize({ permissions: ['MANAGE_USERS'] })
 *   authorize({ roles: ['ADMIN', 'SUPER_ADMIN'] })
 */
export interface AuthorizeOptions {
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean; // Default: false (any match is sufficient)
}

export const authorize = (options: AuthorizeOptions | string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    // Support legacy array syntax: authorize(['SUPER_ADMIN'])
    const opts: AuthorizeOptions = Array.isArray(options)
      ? { roles: options }
      : options;

    const { roles = [], permissions = [], requireAll = false } = opts;
    const userRole = req.user.roleName;
    const userPerms = req.user.permissions;

    // Check roles
    const roleMatch = roles.length === 0 || roles.includes(userRole);

    // Check permissions
    let permMatch = true;
    if (permissions.length > 0) {
      permMatch = requireAll
        ? permissions.every(p => userPerms.includes(p))
        : permissions.some(p => userPerms.includes(p));
    }

    if (!roleMatch && !permMatch) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    if (roles.length > 0 && permissions.length > 0) {
      // Both specified — either can satisfy
      if (!roleMatch && !permMatch) {
        return next(AppError.forbidden('Insufficient permissions'));
      }
    } else if (roles.length > 0 && !roleMatch) {
      return next(AppError.forbidden('Insufficient role'));
    } else if (permissions.length > 0 && !permMatch) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// Convenience shortcut for single permission
export const requirePermission = (permission: string) =>
  authorize({ permissions: [permission] });

// Convenience for admin access
export const requireAdmin = authorize({ roles: ['ADMIN', 'SUPER_ADMIN'] });
export const requireSuperAdmin = authorize({ roles: ['SUPER_ADMIN'] });
