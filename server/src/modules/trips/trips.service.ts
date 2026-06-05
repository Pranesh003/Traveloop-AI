import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { cloudinaryService } from '../../services/cloudinary.service';
import { cache } from '../../config/redis';

const tripInclude = {
  stops: {
    include: {
      city: { include: { country: true } },
      activities: { include: { activity: true } },
    },
    orderBy: { order: 'asc' as const },
  },
  user: { select: { id: true, name: true, avatar: true } },
};

export const tripsService = {
  async createTrip(userId: string, data: any) {
    const trip = await prisma.trip.create({
      data: { ...data, userId },
      include: tripInclude,
    });
    await cache.delPattern(`trips:user:${userId}*`);
    return trip;
  },

  async getMyTrips(userId: string, page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const cacheKey = cache.buildKey('trips', 'user', userId, String(page), String(limit), status ?? 'all');

    const cached = await cache.get(cacheKey);
    if (cached) return cached as { trips: unknown[]; total: number };

    const where: any = { userId, isArchived: false };
    if (status) where.status = status;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: tripInclude,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.trip.count({ where }),
    ]);

    const result = { trips, total };
    await cache.set(cacheKey, result, 60);
    return result;
  },

  async getTripById(id: string, userId: string) {
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { visibility: 'PUBLIC' },
          { shareToken: { not: null } },
        ],
      },
      include: tripInclude,
    });

    if (!trip) throw AppError.notFound('Trip');
    return trip;
  },

  async getTripByShareToken(shareToken: string) {
    const trip = await prisma.trip.findUnique({
      where: { shareToken },
      include: tripInclude,
    });
    if (!trip) throw AppError.notFound('Trip');
    return trip;
  },

  async updateTrip(id: string, userId: string, data: any) {
    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw AppError.notFound('Trip');

    const updated = await prisma.trip.update({
      where: { id },
      data,
      include: tripInclude,
    });

    await cache.delPattern(`trips:user:${userId}*`);
    return updated;
  },

  async deleteTrip(id: string, userId: string) {
    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw AppError.notFound('Trip');

    await prisma.trip.delete({ where: { id } });
    await cache.delPattern(`trips:user:${userId}*`);
  },

  async archiveTrip(id: string, userId: string) {
    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw AppError.notFound('Trip');

    return prisma.trip.update({
      where: { id },
      data: { isArchived: true },
      include: tripInclude,
    });
  },

  async duplicateTrip(id: string, userId: string) {
    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: { stops: { include: { activities: true } } },
    });
    if (!trip) throw AppError.notFound('Trip');

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: `${trip.name} (Copy)`,
        description: trip.description,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        tags: trip.tags,
        stops: {
          create: trip.stops.map(stop => ({
            cityId: stop.cityId,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            notes: stop.notes,
            accommodation: stop.accommodation,
            order: stop.order,
            activities: {
              create: stop.activities.map(a => ({
                activityId: a.activityId,
                scheduledAt: a.scheduledAt,
                notes: a.notes,
              })),
            },
          })),
        },
      },
      include: tripInclude,
    });

    return newTrip;
  },

  async shareTrip(id: string, userId: string) {
    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw AppError.notFound('Trip');

    const shareToken = trip.shareToken ?? uuidv4().replace(/-/g, '');

    return prisma.trip.update({
      where: { id },
      data: { shareToken, visibility: 'SHARED' },
    });
  },

  async uploadCoverImage(id: string, userId: string, buffer: Buffer) {
    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw AppError.notFound('Trip');

    const result = await cloudinaryService.uploadBuffer(buffer, 'traveloop/trips', {
      public_id: `trip_cover_${id}`,
      overwrite: true,
    });

    await prisma.trip.update({
      where: { id },
      data: { coverImage: result.secureUrl },
    });

    return result.secureUrl;
  },

  // ---- Stops ----
  async addStop(tripId: string, userId: string, data: any) {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw AppError.notFound('Trip');

    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) throw AppError.notFound('City');

    const stopCount = await prisma.tripStop.count({ where: { tripId } });

    return prisma.tripStop.create({
      data: { tripId, ...data, order: data.order ?? stopCount },
      include: { city: { include: { country: true } }, activities: { include: { activity: true } } },
    });
  },

  async updateStop(tripId: string, stopId: string, userId: string, data: any) {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw AppError.notFound('Trip');

    return prisma.tripStop.update({
      where: { id: stopId },
      data,
      include: { city: { include: { country: true } }, activities: { include: { activity: true } } },
    });
  },

  async deleteStop(tripId: string, stopId: string, userId: string) {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw AppError.notFound('Trip');
    await prisma.tripStop.delete({ where: { id: stopId } });
  },

  async reorderStops(tripId: string, userId: string, stopIds: string[]) {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw AppError.notFound('Trip');

    await Promise.all(
      stopIds.map((stopId, index) =>
        prisma.tripStop.update({
          where: { id: stopId },
          data: { order: index },
        }),
      ),
    );
  },

  async getPublicTrips(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: { visibility: 'PUBLIC', isArchived: false },
        include: tripInclude,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.trip.count({ where: { visibility: 'PUBLIC', isArchived: false } }),
    ]);
    return { trips, total };
  },
};
