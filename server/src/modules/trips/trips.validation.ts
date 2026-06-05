import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']).default('PRIVATE'),
  tags: z.array(z.string()).default([]),
  aiData: z.any().optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  isArchived: z.boolean().optional(),
});

export const addStopSchema = z.object({
  cityId: z.string().uuid(),
  arrivalDate: z.string().datetime().optional(),
  departureDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  accommodation: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderStopsSchema = z.object({
  stopIds: z.array(z.string().uuid()).min(1),
});
