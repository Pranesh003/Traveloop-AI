import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR') as AppError & { errors: typeof errors };
      (err as any).errors = errors;
      return next(err);
    }

    // Replace with parsed/coerced data
    req[target] = result.data;
    next();
  };
};
