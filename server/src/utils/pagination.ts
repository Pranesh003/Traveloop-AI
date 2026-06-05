import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export function getPagination(query: PaginationQuery, maxLimit = 100): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(query.limit ?? 20), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function getPaginationFromReq(req: Request, maxLimit = 100): PaginationOptions {
  return getPagination(req.query as PaginationQuery, maxLimit);
}
