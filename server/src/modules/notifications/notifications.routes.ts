import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate, AuthRequest } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { getPaginationFromReq } from '../../utils/pagination';
import { Notification } from '../../config/database/mongodb/models/System';
import { AppError } from '../../utils/AppError';
import { enqueueNotification } from '../../queues/notification.queue';

const router = Router();
router.use(authenticate);

// Get my notifications
router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const { page, limit, skip } = getPaginationFromReq(req);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ userId: req.user!.id }),
    Notification.countDocuments({ userId: req.user!.id, isRead: false }),
  ]);
  ApiResponse.paginated(res, notifications, total, page, limit, 'Success');
  // Add unread count to response manually via meta
}));

router.get('/unread-count', catchAsync(async (req: AuthRequest, res) => {
  const count = await Notification.countDocuments({ userId: req.user!.id, isRead: false });
  ApiResponse.success(res, { unreadCount: count });
}));

router.post('/:id/read', catchAsync(async (req: AuthRequest, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { isRead: true, readAt: new Date() },
  );
  ApiResponse.success(res, null, 'Marked as read');
}));

router.post('/read-all', catchAsync(async (req: AuthRequest, res) => {
  await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true, readAt: new Date() });
  ApiResponse.success(res, null, 'All notifications marked as read');
}));

router.delete('/:id', catchAsync(async (req: AuthRequest, res) => {
  await Notification.deleteOne({ _id: req.params.id, userId: req.user!.id });
  ApiResponse.noContent(res);
}));

// Admin: send broadcast notification
router.post('/broadcast', authorize({ permissions: ['MANAGE_NOTIFICATIONS'] }), catchAsync(async (req: AuthRequest, res) => {
  const { userIds, type, title, body, data } = req.body;
  const users = userIds as string[];

  await Promise.all(
    users.map(userId =>
      enqueueNotification({ userId, type, title, body, data }),
    ),
  );

  ApiResponse.success(res, { sent: users.length }, `Broadcast sent to ${users.length} users`);
}));

export default router;
