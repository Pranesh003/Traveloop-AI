import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { optionalAuth, authenticate, AuthRequest } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { getPaginationFromReq } from '../../utils/pagination';
import prisma from '../../config/database/postgresql/prisma';
import { SearchHistory } from '../../config/database/mongodb/models/System';
import { AppError } from '../../utils/AppError';
import { uploadFields } from '../../middlewares/upload';
import { cloudinaryService } from '../../services/cloudinary.service';

const router = Router();

// --- Global Search ---
router.get('/search', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { q = '', type = 'global' } = req.query as { q?: string; type?: string };
  if (!q) return ApiResponse.success(res, []);

  const results: Record<string, unknown[]> = {};

  if (type === 'global' || type === 'destinations') {
    results.destinations = await prisma.destination.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, isPublished: true },
      include: { city: { include: { country: true } } },
      take: 5,
    });
  }

  if (type === 'global' || type === 'cities') {
    results.cities = await prisma.city.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { country: true },
      take: 5,
    });
  }

  if (type === 'global' || type === 'activities') {
    results.activities = await prisma.activity.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, isPublished: true },
      take: 5,
    });
  }

  if (type === 'global' || type === 'packages') {
    results.packages = await prisma.travelPackage.findMany({
      where: { title: { contains: q, mode: 'insensitive' }, isPublished: true },
      take: 5,
    });
  }

  if ((type === 'global' || type === 'trips') && req.user) {
    results.trips = await prisma.trip.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        OR: [{ userId: req.user.id }, { visibility: 'PUBLIC' }],
      },
      take: 5,
    });
  }

  // Save search history
  if (req.user) {
    await SearchHistory.create({ userId: req.user.id, query: q, type, resultCount: Object.values(results).flat().length }).catch(() => {});
  }

  ApiResponse.success(res, results);
}));

function formatPackageForFrontend(pkg: any) {
  if (!pkg) return null;
  return {
    ...pkg,
    name: pkg.title,
    duration: `${pkg.durationDays} Days`,
    price: `₹${(pkg.price || 0).toLocaleString()}`,
    bookings: pkg._count?.bookings ?? 0,
  };
}

function mapPackagePayload(body: any) {
  const data: any = {};
  
  if (body.name !== undefined) data.title = body.name;
  if (body.title !== undefined) data.title = body.title;
  
  if (body.duration !== undefined) {
    const days = parseInt(body.duration.replace(/\D/g, ''));
    data.durationDays = isNaN(days) ? 7 : days;
  }
  if (body.durationDays !== undefined) {
    data.durationDays = parseInt(body.durationDays);
  }

  if (body.price !== undefined) {
    const rawPrice = String(body.price).replace(/[^0-9.]/g, '');
    const priceVal = parseFloat(rawPrice);
    data.price = isNaN(priceVal) ? 0 : priceVal;
  }

  data.currency = body.currency || 'INR';
  data.isPublished = body.isPublished !== undefined 
    ? (body.isPublished === 'true' || body.isPublished === true)
    : true;

  if (body.description !== undefined) data.description = body.description;
  if (body.rating !== undefined) data.rating = parseFloat(body.rating) || 5.0;

  return data;
}

// --- Packages ---
router.get('/packages', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [packages, total] = await Promise.all([
    prisma.travelPackage.findMany({
      include: { 
        createdBy: { select: { name: true, avatar: true } },
        _count: { select: { bookings: true } }
      },
      skip, take: limit, orderBy: { rating: 'desc' },
    }),
    prisma.travelPackage.count(),
  ]);
  const formatted = packages.map(formatPackageForFrontend);
  ApiResponse.paginated(res, formatted, total, page, limit);
}));

router.get('/packages/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const pkg = await prisma.travelPackage.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { name: true, avatar: true } },
      activities: { include: { activity: true } },
      _count: { select: { bookings: true } }
    },
  });
  if (!pkg) throw AppError.notFound('Package');
  ApiResponse.success(res, formatPackageForFrontend(pkg));
}));

router.post('/packages', authenticate, authorize({ permissions: ['MANAGE_PACKAGES'] }), uploadFields, catchAsync(async (req: AuthRequest, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images: string[] = [];
  let coverImage: string | undefined;

  if (files?.images) {
    const uploads = await cloudinaryService.uploadBuffers(files.images.map(f => f.buffer), 'traveloop/packages');
    images.push(...uploads.map(u => u.secureUrl));
  }
  if (files?.coverImage?.[0]) {
    const upload = await cloudinaryService.uploadBuffer(files.coverImage[0].buffer, 'traveloop/packages');
    coverImage = upload.secureUrl;
  }

  const mappedData = mapPackagePayload(req.body);
  const pkg = await prisma.travelPackage.create({
    data: { ...mappedData, createdById: req.user!.id, images, coverImage },
  });
  ApiResponse.created(res, formatPackageForFrontend(pkg), 'Package created');
}));

router.put('/packages/:id', authenticate, authorize({ permissions: ['MANAGE_PACKAGES'] }), catchAsync(async (req: AuthRequest, res) => {
  const mappedData = mapPackagePayload(req.body);
  const pkg = await prisma.travelPackage.update({ where: { id: req.params.id }, data: mappedData });
  ApiResponse.success(res, formatPackageForFrontend(pkg), 'Package updated');
}));

router.delete('/packages/:id', authenticate, authorize({ permissions: ['MANAGE_PACKAGES'] }), catchAsync(async (req: AuthRequest, res) => {
  await prisma.travelPackage.delete({ where: { id: req.params.id } });
  ApiResponse.noContent(res);
}));

// --- Bookings ---
router.post('/bookings', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const pkg = await prisma.travelPackage.findUnique({ where: { id: req.body.packageId } });
  if (!pkg) throw AppError.notFound('Package');

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.id,
      packageId: req.body.packageId,
      totalAmount: pkg.price * (req.body.groupSize ?? 1),
      currency: pkg.currency,
      travelDate: req.body.travelDate,
      groupSize: req.body.groupSize ?? 1,
      notes: req.body.notes,
    },
    include: { package: { select: { title: true } } },
  });

  ApiResponse.created(res, booking, 'Booking created');
}));

router.get('/bookings', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: { package: { select: { title: true, coverImage: true } } },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where: { userId: req.user!.id } }),
  ]);
  ApiResponse.paginated(res, bookings, total, page, limit);
}));

// --- Roles (Admin) ---
router.get('/roles', authenticate, authorize({ permissions: ['MANAGE_ROLES'] }), catchAsync(async (_req: AuthRequest, res) => {
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
  });
  ApiResponse.success(res, roles);
}));

router.post('/roles', authenticate, authorize({ permissions: ['MANAGE_ROLES'] }), catchAsync(async (req: AuthRequest, res) => {
  const role = await prisma.role.create({ data: req.body });
  ApiResponse.created(res, role, 'Role created');
}));

router.put('/roles/:id', authenticate, authorize({ permissions: ['MANAGE_ROLES'] }), catchAsync(async (req: AuthRequest, res) => {
  const role = await prisma.role.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, role, 'Role updated');
}));

router.get('/permissions', authenticate, authorize({ permissions: ['MANAGE_ROLES'] }), catchAsync(async (_req: AuthRequest, res) => {
  const permissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
  ApiResponse.success(res, permissions);
}));

// --- Journals ---
const { TravelJournal } = require('../../config/database/mongodb/models/Community');

router.get('/journals/:tripId', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const journal = await TravelJournal.findOne({ tripId: req.params.tripId, userId: req.user!.id });
  ApiResponse.success(res, journal);
}));

router.post('/journals', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const journal = await TravelJournal.create({ userId: req.user!.id, ...req.body });
  ApiResponse.created(res, journal, 'Journal created');
}));

router.put('/journals/:id/entry', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const journal = await TravelJournal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $push: { entries: { ...req.body, createdAt: new Date() } } },
    { new: true },
  );
  if (!journal) throw AppError.notFound('Journal');
  ApiResponse.success(res, journal, 'Entry added');
}));

export default router;
