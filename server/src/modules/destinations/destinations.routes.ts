import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { getPaginationFromReq } from '../../utils/pagination';
import { uploadFields } from '../../middlewares/upload';
import { cloudinaryService } from '../../services/cloudinary.service';
import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { cache } from '../../config/redis';
import { AuthRequest } from '../../middlewares/authenticate';

const router = Router();

// ---- Countries ----
router.get('/countries', catchAsync(async (req: AuthRequest, res) => {
  const cached = await cache.get('countries:all');
  if (cached) return ApiResponse.success(res, cached);
  const countries = await prisma.country.findMany({ orderBy: { name: 'asc' } });
  await cache.set('countries:all', countries, 3600);
  ApiResponse.success(res, countries);
}));

router.post('/countries', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const country = await prisma.country.create({ data: req.body });
  await cache.del('countries:all');
  ApiResponse.created(res, country);
}));

router.put('/countries/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const country = await prisma.country.update({ where: { id: req.params.id }, data: req.body });
  await cache.del('countries:all');
  ApiResponse.success(res, country, 'Country updated');
}));

router.delete('/countries/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  await prisma.country.delete({ where: { id: req.params.id } });
  await cache.del('countries:all');
  ApiResponse.noContent(res);
}));

// ---- Cities ----
router.get('/cities', catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const { countryId, q } = req.query as { countryId?: string; q?: string };

  const where: any = {};
  if (countryId) where.countryId = countryId;
  if (q) where.name = { contains: q, mode: 'insensitive' };

  const [cities, total] = await Promise.all([
    prisma.city.findMany({ where, include: { country: true }, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.city.count({ where }),
  ]);
  ApiResponse.paginated(res, cities, total, page, limit);
}));

router.post('/cities', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const city = await prisma.city.create({ data: req.body, include: { country: true } });
  ApiResponse.created(res, city);
}));

router.put('/cities/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const city = await prisma.city.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, city, 'City updated');
}));

router.delete('/cities/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  await prisma.city.delete({ where: { id: req.params.id } });
  ApiResponse.noContent(res);
}));

// ---- Destinations ----
router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const { cityId, q } = req.query as { cityId?: string; q?: string };

  const where: any = { isPublished: true };
  if (cityId) where.cityId = cityId;
  if (q) where.name = { contains: q, mode: 'insensitive' };

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where, include: { city: { include: { country: true } } },
      skip, take: limit, orderBy: { popularityScore: 'desc' },
    }),
    prisma.destination.count({ where }),
  ]);
  ApiResponse.paginated(res, destinations, total, page, limit);
}));

router.get('/:id', catchAsync(async (req: AuthRequest, res) => {
  const destination = await prisma.destination.findUnique({
    where: { id: req.params.id },
    include: {
      city: { include: { country: true } },
      activities: { where: { isPublished: true }, take: 20 },
    },
  });
  if (!destination) throw AppError.notFound('Destination');
  ApiResponse.success(res, destination);
}));

router.post('/', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), uploadFields, catchAsync(async (req: AuthRequest, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images: string[] = [];

  if (files?.images) {
    const uploads = await cloudinaryService.uploadBuffers(files.images.map(f => f.buffer), 'traveloop/destinations');
    images.push(...uploads.map(u => u.secureUrl));
  }

  let coverImage: string | undefined;
  if (files?.coverImage?.[0]) {
    const upload = await cloudinaryService.uploadBuffer(files.coverImage[0].buffer, 'traveloop/destinations');
    coverImage = upload.secureUrl;
  }

  const destination = await prisma.destination.create({
    data: { ...req.body, images, coverImage },
    include: { city: { include: { country: true } } },
  });
  ApiResponse.created(res, destination);
}));

router.put('/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const destination = await prisma.destination.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, destination, 'Destination updated');
}));

router.delete('/:id', authenticate, authorize({ permissions: ['MANAGE_DESTINATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  await prisma.destination.delete({ where: { id: req.params.id } });
  ApiResponse.noContent(res);
}));

export default router;
