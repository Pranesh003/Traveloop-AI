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

router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const { category, destinationId, q } = req.query as any;

  const where: any = { isPublished: true };
  if (category) where.category = category;
  if (destinationId) where.destinationId = destinationId;
  if (q) where.name = { contains: q, mode: 'insensitive' };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: { destination: { include: { city: { include: { country: true } } } } },
      skip, take: limit, orderBy: { rating: 'desc' },
    }),
    prisma.activity.count({ where }),
  ]);
  ApiResponse.paginated(res, activities, total, page, limit);
}));

router.get('/:id', catchAsync(async (req: AuthRequest, res) => {
  const activity = await prisma.activity.findUnique({
    where: { id: req.params.id },
    include: { destination: { include: { city: { include: { country: true } } } } },
  });
  if (!activity) throw AppError.notFound('Activity');
  ApiResponse.success(res, activity);
}));

router.post('/', authenticate, authorize({ permissions: ['MANAGE_ACTIVITIES'] }), uploadFields, catchAsync(async (req: AuthRequest, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images: string[] = [];

  if (files?.images) {
    const uploads = await cloudinaryService.uploadBuffers(files.images.map(f => f.buffer), 'traveloop/activities');
    images.push(...uploads.map(u => u.secureUrl));
  }

  const activity = await prisma.activity.create({
    data: { ...req.body, images, price: parseFloat(req.body.price || '0') },
    include: { destination: true },
  });
  ApiResponse.created(res, activity);
}));

router.put('/:id', authenticate, authorize({ permissions: ['MANAGE_ACTIVITIES'] }), catchAsync(async (req: AuthRequest, res) => {
  const activity = await prisma.activity.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, activity, 'Activity updated');
}));

router.delete('/:id', authenticate, authorize({ permissions: ['MANAGE_ACTIVITIES'] }), catchAsync(async (req: AuthRequest, res) => {
  await prisma.activity.delete({ where: { id: req.params.id } });
  ApiResponse.noContent(res);
}));

export default router;
