import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate, AuthRequest } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { getPaginationFromReq } from '../../utils/pagination';
import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { enqueueNotification } from '../../queues/notification.queue';

const router = Router();
router.use(authenticate);

// Users: create ticket
router.post('/', catchAsync(async (req: AuthRequest, res) => {
  const ticket = await prisma.supportTicket.create({
    data: { userId: req.user!.id, ...req.body },
    include: { user: { select: { name: true, email: true } } },
  });
  ApiResponse.created(res, ticket, 'Support ticket created');
}));

// Users: view own tickets
router.get('/mine', catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      include: { user: { select: { name: true, email: true } } },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where: { userId: req.user!.id } }),
  ]);
  ApiResponse.paginated(res, tickets, total, page, limit);
}));

router.put('/mine/:id', catchAsync(async (req: AuthRequest, res) => {
  const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!ticket) throw AppError.notFound('Ticket');
  const updated = await prisma.supportTicket.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, updated, 'Ticket updated');
}));

// Admin: view all tickets
router.get('/', authorize({ permissions: ['MANAGE_SUPPORT'] }), catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const { status, priority } = req.query as any;
  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where, include: { user: { select: { name: true, email: true } }, assignee: { select: { name: true } } },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where }),
  ]);
  ApiResponse.paginated(res, tickets, total, page, limit);
}));

router.put('/:id/assign', authorize({ permissions: ['MANAGE_SUPPORT'] }), catchAsync(async (req: AuthRequest, res) => {
  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.id },
    data: { assignedTo: req.body.assignedTo, status: 'IN_PROGRESS' },
  });
  await enqueueNotification({
    userId: ticket.userId,
    type: 'TICKET_UPDATE',
    title: 'Ticket Assigned',
    body: 'Your support ticket is now being reviewed by our team.',
    data: { ticketId: ticket.id },
  });
  ApiResponse.success(res, ticket, 'Ticket assigned');
}));

router.put('/:id/resolve', authorize({ permissions: ['MANAGE_SUPPORT'] }), catchAsync(async (req: AuthRequest, res) => {
  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.id },
    data: { status: 'RESOLVED', resolution: req.body.resolution },
  });
  await enqueueNotification({
    userId: ticket.userId,
    type: 'TICKET_UPDATE',
    title: 'Ticket Resolved ✅',
    body: `Your support ticket has been resolved: ${req.body.resolution}`,
    data: { ticketId: ticket.id },
  });
  ApiResponse.success(res, ticket, 'Ticket resolved');
}));

export default router;
