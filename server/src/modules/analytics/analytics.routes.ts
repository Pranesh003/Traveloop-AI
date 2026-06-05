import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate, AuthRequest } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import prisma from '../../config/database/postgresql/prisma';
import { AuditLog } from '../../config/database/mongodb/models/System';

const router = Router();
router.use(authenticate);
router.use(authorize({ permissions: ['VIEW_ANALYTICS'] }));

router.get('/overview', catchAsync(async (_req: AuthRequest, res) => {
  const [
    totalUsers, activeUsers, totalTrips, activeTrips,
    totalBookings, completedBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.trip.count(),
    prisma.trip.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
  ]);

  ApiResponse.success(res, {
    users: { total: totalUsers, active: activeUsers },
    trips: { total: totalTrips, active: activeTrips },
    bookings: { total: totalBookings, completed: completedBookings },
  });
}));

router.get('/users/growth', catchAsync(async (_req: AuthRequest, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const dailyCounts = users.reduce<Record<string, number>>((acc, user) => {
    const date = user.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] ?? 0) + 1;
    return acc;
  }, {});

  ApiResponse.success(res, { daily: dailyCounts, total: users.length });
}));

router.get('/trips/growth', catchAsync(async (_req: AuthRequest, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trips = await prisma.trip.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const byStatus = trips.reduce<Record<string, number>>((acc, trip) => {
    acc[trip.status] = (acc[trip.status] ?? 0) + 1;
    return acc;
  }, {});

  ApiResponse.success(res, { total: trips.length, byStatus });
}));

router.get('/revenue', catchAsync(async (_req: AuthRequest, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const payments = await prisma.payment.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
    select: { amount: true, currency: true, createdAt: true },
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  ApiResponse.success(res, { total, currency: 'USD', payments });
}));

router.get('/top-destinations', catchAsync(async (_req: AuthRequest, res) => {
  const destinations = await prisma.destination.findMany({
    orderBy: { popularityScore: 'desc' },
    take: 10,
    select: {
      id: true, name: true, popularityScore: true, safetyIndex: true,
      city: { include: { country: true } },
    },
  });
  ApiResponse.success(res, destinations);
}));

router.get('/audit-logs', catchAsync(async (req: AuthRequest, res) => {
  const page = parseInt(String(req.query.page ?? 1));
  const limit = parseInt(String(req.query.limit ?? 20));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments({}),
  ]);

  ApiResponse.paginated(res, logs, total, page, limit);
}));

export default router;
